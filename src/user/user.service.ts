import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from './repositories/otp.repository';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import { User } from './entities/user.entity';
import { UserRole } from './enum/user-role.enum';
import { JwtPayload, RefreshTokenPayload } from './types/jwt-payload.interface';
import { USER_MESSAGES } from './constants/user.messages';
import {
  SendOtpDto,
  SendOtpResponseDto,
  ValidateOtpDto,
  ValidateOtpResponseDto,
  CreateOwnerDto,
  CreateOwnerResponseDto,
  CreateChannelPartnerDto,
  CreateChannelPartnerResponseDto,
  CreateEndUserDto,
  CreateEndUserResponseDto,
  ResendOtpDto,
  ResendOtpResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
  EndUserSignupDto,
  EndUserSignupResponseDto,
  EndUserVerifyOtpDto,
  EndUserVerifyOtpResponseDto,
  EndUserLoginDto,
  EndUserLoginResponseDto,
  EndUserVerifyLoginOtpDto,
  EndUserVerifyLoginOtpResponseDto,
  EndUserProfileResponseDto,
  EndUserEditProfileDto,
  EndUserEditProfileResponseDto,
  EndUserChangeMobileDto,
  EndUserChangeMobileResponseDto,
  EndUserVerifyChangeMobileOtpDto,
  EndUserVerifyChangeMobileOtpResponseDto,
  EndUserHomePageResponseDto,
  CityItemDto,
  EndUserCitiesQueryDto,
  EndUserPropertiesSearchQueryDto,
  EndUserPropertiesSearchResponseDto,
  EndUserPropertyListItemDto,
  EndUserPropertyUnitDto,
} from './dto';
import { PropertyRepository } from '../property/repositories/property.repository';
import { CityRepository } from '../property/repositories/city.repository';
import { GooglePlacesService } from '../property/services/google-places.service';
import { MAX_LISTINGS_PER_OWNER } from '../property/constants/property.constants';
import { DashboardResponseDto } from './dto';
import { UpgradeToChannelPartnerDto, UpgradeToChannelPartnerResponseDto } from './dto/upgrade-channel-partner.dto';
import { LeadRepository } from './repositories/lead.repository';
import { LeadType } from './entities/lead.entity';
import { UserRoleHistoryRepository } from './repositories/user-role-history.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly ACCESS_TOKEN_EXPIRY = '24h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly cityRepository: CityRepository,
    private readonly channelPartnerCodeRepository: ChannelPartnerCodeRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly propertyRepository: PropertyRepository,
    private readonly googlePlacesService: GooglePlacesService,
    private readonly leadRepository: LeadRepository,
    private readonly userRoleHistoryRepository: UserRoleHistoryRepository,
  ) {}

  /**
   * Create JWT payload for a user
   */
  private createTokenPayload(
    userId: string,
    phone: string,
    role: UserRole,
    type: 'access_token' | 'refresh_token',
  ): JwtPayload {
    return {
      sub: userId,
      phone,
      role,
      type,
    };
  }

  /**
   * Upgrade OWNER to CHANNEL_PARTNER with code validation and history
   */
  async upgradeToChannelPartner(
    dto: UpgradeToChannelPartnerDto,
    userId: string,
  ): Promise<UpgradeToChannelPartnerResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.phoneVerified) {
      throw new BadRequestException('Phone number is not verified');
    }
    if (user.role === UserRole.CHANNEL_PARTNER) {
      return { success: true, message: 'Already a CHANNEL_PARTNER' };
    }
    if (user.role !== UserRole.OWNER) {
      throw new BadRequestException('Only OWNERs can be upgraded');
    }

    // Validate channel partner code
    const validCode =
      await this.channelPartnerCodeRepository.findByCode(
        dto.channelPartnerCode,
      );
    if (!validCode) {
      throw new BadRequestException('Invalid channel partner code');
    }

    // Check if a CHANNEL_PARTNER with the same phone already exists
    // This prevents violating the unique constraint UQ_users_phone_role
    const existingChannelPartner = await this.userRepository.findByPhoneAndRole(
      user.phone,
      UserRole.CHANNEL_PARTNER,
    );
    if (existingChannelPartner && existingChannelPartner.id !== user.id) {
      throw new BadRequestException(
        'A CHANNEL_PARTNER account with this phone number already exists',
      );
    }

    // Update role and persist history in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        'users',
        { id: user.id },
        { role: UserRole.CHANNEL_PARTNER, channelPartnerCode: dto.channelPartnerCode },
      );
      await this.userRoleHistoryRepository.create({
        userId: user.id,
        fromRole: UserRole.OWNER,
        toRole: UserRole.CHANNEL_PARTNER,
        channelPartnerCode: dto.channelPartnerCode,
      });
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      // Handle unique constraint violation with a user-friendly message
      if (
        e instanceof Error &&
        e.message?.includes('UQ_users_phone_role')
      ) {
        throw new BadRequestException(
          'A CHANNEL_PARTNER account with this phone number already exists',
        );
      }
      throw e;
    } finally {
      await queryRunner.release();
    }

    return {
      success: true,
      message: 'Upgraded to CHANNEL_PARTNER successfully',
    };
  }

  /**
   * Generate access token for a user
   */
  private generateAccessToken(user: User): string {
    const payload = this.createTokenPayload(
      user.id,
      user.phone,
      user.role,
      'access_token',
    );
    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate refresh token for a user
   */
  private generateRefreshToken(user: User): string {
    const payload = this.createTokenPayload(
      user.id,
      user.phone,
      user.role,
      'refresh_token',
    );
    return this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate both access and refresh tokens for a user
   */
  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * Update user with new tokens in database
   */
  private async updateUserTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      token: accessToken,
      refreshToken: refreshToken,
    });
  }

  /**
   * Send OTP to phone number
   */
  async sendOtp(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { phone } = sendOtpDto;

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate any existing OTPs for this phone
    await this.otpRepository.deleteByPhone(phone);

    // Create new OTP record
    await this.otpRepository.create({
      phone,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    // In production, integrate with SMS service
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`OTP generated for ${phone}: ${otpCode}`);
    }

    // Only return OTP in development/staging environments
    const response: SendOtpResponseDto = {
      success: true,
      message: USER_MESSAGES.OTP.SENT,
      otp: process.env.NODE_ENV === 'production' ? undefined : otpCode,
    };

    return response;
  }

  /**
   * Send OTP for signup - phone+role combination must not exist
   */
  async sendOtpForSignup(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { phone, role } = sendOtpDto;
    const userRole = role || UserRole.END_USER; // Default to END_USER for signup

    const existingUser = await this.userRepository.findByPhoneAndRole(phone, userRole);
    if (existingUser) {
      throw new BadRequestException(
        `User with phone ${phone} and role ${userRole} already exists. Please login.`
      );
    }

    // Check if same phone number has conflicting user types (CHANNEL_PARTNER and OWNER cannot coexist)
    if (userRole === UserRole.OWNER) {
      const existingChannelPartner = await this.userRepository.findByPhoneAndRole(
        phone,
        UserRole.CHANNEL_PARTNER,
      );
      if (existingChannelPartner) {
        throw new BadRequestException(
          `A CHANNEL_PARTNER account with phone number ${phone} already exists. CHANNEL_PARTNER and OWNER cannot exist with the same phone number.`,
        );
      }
    } else if (userRole === UserRole.CHANNEL_PARTNER) {
      const existingOwner = await this.userRepository.findByPhoneAndRole(
        phone,
        UserRole.OWNER,
      );
      if (existingOwner) {
        throw new BadRequestException(
          `An OWNER account with phone number ${phone} already exists. CHANNEL_PARTNER and OWNER cannot exist with the same phone number.`,
        );
      }
    }

    return this.sendOtp(sendOtpDto);
  }

  /**
   * Send OTP for login - phone+role combination must already exist
   */
  async sendOtpForLogin(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { phone, role } = sendOtpDto;

    let userRole: UserRole | undefined;
    let existingUser: User | null = null;

    if (role) {
      // If role is explicitly provided, use it
      userRole = role;
      existingUser = await this.userRepository.findByPhoneAndRole(phone, userRole);
    } else {
      // If role is not provided, check for OWNER first, then CHANNEL_PARTNER
      // OWNER and CHANNEL_PARTNER share the same login
      existingUser = await this.userRepository.findByPhoneAndRole(phone, UserRole.OWNER);
      if (existingUser) {
        userRole = UserRole.OWNER;
      } else {
        existingUser = await this.userRepository.findByPhoneAndRole(phone, UserRole.CHANNEL_PARTNER);
        if (existingUser) {
          userRole = UserRole.CHANNEL_PARTNER;
        }
      }
    }

    if (!existingUser || !userRole) {
      const roleMessage = role 
        ? `User with phone ${phone} and role ${role} not found. Please signup first.`
        : `User with phone ${phone} not found as OWNER or CHANNEL_PARTNER. Please signup first.`;
      throw new BadRequestException(roleMessage);
    }

    // Check if user is blocked
    if (existingUser.isBlocked) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
    }

    // Check if user is inactive
    if (!existingUser.isActive) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
    }

    // Use the determined role for sending OTP
    return this.sendOtp({ ...sendOtpDto, role: userRole });
  }

  /**
   * Validate OTP and create user if not exists
   * Uses database transaction to ensure atomicity
   */
  async validateOtp(
    validateOtpDto: ValidateOtpDto,
  ): Promise<ValidateOtpResponseDto> {
    const { phone, otp, role } = validateOtpDto;

    // Find the OTP record for this phone
    const otpRecord = await this.otpRepository.findActiveByPhone(phone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity of OTP marking and user creation/update
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used within transaction
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Determine the role to use and find existing user within transaction
      let userRole: UserRole | undefined;
      let existingUser: User | null = null;

      if (role) {
        // If role is explicitly provided, use it
        userRole = role;
        existingUser = await queryRunner.manager.findOne(User, {
          where: { phone, role: userRole },
        });
      } else {
        // If role is not provided, check for OWNER first, then CHANNEL_PARTNER
        // OWNER and CHANNEL_PARTNER share the same login
        existingUser = await queryRunner.manager.findOne(User, {
          where: { phone, role: UserRole.OWNER },
        });
        if (existingUser) {
          userRole = UserRole.OWNER;
        } else {
          existingUser = await queryRunner.manager.findOne(User, {
            where: { phone, role: UserRole.CHANNEL_PARTNER },
          });
          if (existingUser) {
            userRole = UserRole.CHANNEL_PARTNER;
          } else {
            // If user doesn't exist and role not provided, default to OWNER for new user creation
            userRole = UserRole.OWNER;
          }
        }
      }

      let user: User;
      let isNewUser = false;

      if (existingUser) {
        // Check if user is blocked
        if (existingUser.isBlocked) {
          await queryRunner.rollbackTransaction();
          throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
        }

        // Check if user is inactive
        if (!existingUser.isActive) {
          await queryRunner.rollbackTransaction();
          throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
        }

        // User exists, update phone_verified flag
        await queryRunner.manager.update(
          User,
          { id: existingUser.id },
          { phoneVerified: true },
        );
        const updatedUser = await queryRunner.manager.findOne(User, {
          where: { id: existingUser.id },
        });
        if (!updatedUser) {
          throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
        }
        user = updatedUser;
      } else {
        // User doesn't exist with this phone+role combination, create new user
        if (!userRole) {
          throw new BadRequestException('Role is required for creating a new user');
        }
        
        const userData: Partial<User> = {
          phone,
          role: userRole,
          isActive: true,
          phoneVerified: true,
          name: null,
          email: null,
          intent: null,
        };

        user = queryRunner.manager.create(User, userData);
        user = await queryRunner.manager.save(user);
        isNewUser = true;
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Update user with tokens
      await queryRunner.manager.update(
        User,
        { id: user.id },
        { token: accessToken, refreshToken: refreshToken },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      const hasReachedListingLimit =
        user.role === UserRole.OWNER
          ? (await this.propertyRepository.countByUserId(user.id)) >=
            MAX_LISTINGS_PER_OWNER
          : false;

      return {
        success: true,
        message: isNewUser
          ? USER_MESSAGES.OTP.VALIDATED_NEW_USER(user.role)
          : USER_MESSAGES.OTP.VALIDATED,
        requiredOtherDetails: isNewUser,
        userId: user.id,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
        hasReachedListingLimit,
      } as ValidateOtpResponseDto;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Create OWNER account
   */
  async createOwner(
    createOwnerDto: CreateOwnerDto,
    tokenData: {
      sub: string;
      phone: string;
      role: UserRole;
      type: 'access_token' | 'refresh_token';
    },
  ): Promise<CreateOwnerResponseDto> {
    const { name, email, intent, city } = createOwnerDto;
    const { sub: userId, phone } = tokenData;

    // Find user by ID (from token) to ensure we're updating the correct user
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new BadRequestException(
        USER_MESSAGES.USER.USER_NOT_FOUND_VERIFY_OTP,
      );
    }

    if (tokenData.role !== UserRole.OWNER) {
      throw new BadRequestException(USER_MESSAGES.OWNER.UNAUTHORIZED);
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NOT_VERIFIED);
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== existingUser.id) {
        throw new BadRequestException(
          'Email address is already registered with another user.',
        );
      }
    }

    // Update user with OWNER details
    const updatedUser = await this.userRepository.update(existingUser.id, {
      name,
      email: email || null,
      role: UserRole.OWNER,
      intent: intent || null,
      cities: city || null,
    });

    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: USER_MESSAGES.OWNER.CREATED,
      userId: updatedUser.id,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        city: updatedUser.cities || undefined,
      },
    };
  }

  /**
   * Create CHANNEL_PARTNER account
   */
  async createChannelPartner(
    createChannelPartnerDto: CreateChannelPartnerDto,
    tokenData: {
      sub: string;
      phone: string;
      role: UserRole;
      type: 'access_token' | 'refresh_token';
    },
  ): Promise<CreateChannelPartnerResponseDto> {
    const {
      name,
      email,
      phone,
      channelPartnerCode,
      firmName,
      businessSince,
      cities,
      aboutYourSelf,
      intent,
    } = createChannelPartnerDto;

    // Verify phone number matches token
    if (tokenData.phone !== phone) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NUMBER_MISMATCH);
    }

    // Find user by phone and role
    const existingUser = await this.userRepository.findByPhoneAndRole(phone, UserRole.CHANNEL_PARTNER);
    if (!existingUser) {
      throw new BadRequestException(
        USER_MESSAGES.USER.USER_NOT_FOUND_VERIFY_OTP,
      );
    }

    if (tokenData.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException(USER_MESSAGES.CHANNEL_PARTNER.UNAUTHORIZED);
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NOT_VERIFIED);
    }

    // Validate channel partner code
    const validCode =
      await this.channelPartnerCodeRepository.findByCode(channelPartnerCode);
    if (!validCode) {
      throw new BadRequestException(USER_MESSAGES.CHANNEL_PARTNER.INVALID_CODE);
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== existingUser.id) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Update user with CHANNEL_PARTNER details
    const updatedUser = await this.userRepository.update(existingUser.id, {
      name,
      email: email || null,
      role: UserRole.CHANNEL_PARTNER,
      channelPartnerCode,
      firmName: firmName || null,
      businessSince: businessSince || null,
      cities: cities || null,
      aboutYourSelf: aboutYourSelf || null,
      intent: intent || null,
    });

    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: USER_MESSAGES.CHANNEL_PARTNER.CREATED,
      userId: updatedUser.id,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    };
  }

  /**
   * Create END_USER account
   */
  async createEndUser(
    createEndUserDto: CreateEndUserDto,
    tokenData: {
      sub: string;
      phone: string;
      role: UserRole;
      type: 'access_token' | 'refresh_token';
    },
  ): Promise<CreateEndUserResponseDto> {
    const { name, email } = createEndUserDto;
    const { sub: userId, phone } = tokenData;

    // Find user by ID (from token) to ensure we're updating the correct user
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (existingUser.phone !== phone) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NUMBER_MISMATCH);
    }

    if (tokenData.role !== UserRole.END_USER) {
      throw new BadRequestException(USER_MESSAGES.END_USER.UNAUTHORIZED);
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NOT_VERIFIED);
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== existingUser.id) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Update user with END_USER details
    const updatedUser = await this.userRepository.update(existingUser.id, {
      name,
      email: email || null,
      role: UserRole.END_USER,
    });

    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: USER_MESSAGES.END_USER.CREATED,
      userId: updatedUser.id,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    };
  }

  /**
   * End User Signup - Send OTP
   * Takes name, email, phone and sends OTP for verification
   */
  async signupEndUser(
    signupDto: EndUserSignupDto,
  ): Promise<EndUserSignupResponseDto> {
    const { name, email, phone } = signupDto;

    // Check if user already exists with this phone and END_USER role
    const existingUser = await this.userRepository.findByPhoneAndRole(
      phone,
      UserRole.END_USER,
    );
    if (existingUser) {
      throw new BadRequestException(
        'User with this phone number already exists. Please login instead.',
      );
    }

    // Check if email is already registered
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Send OTP for signup
    const otpResponse = await this.sendOtpForSignup({
      phone,
      role: UserRole.END_USER,
    });

    return {
      success: true,
      message: 'OTP sent successfully to your mobile number',
      phone,
      otp: otpResponse.otp, // Only in development
    };
  }

  /**
   * End User Verify OTP - Complete Signup
   * Validates OTP and creates complete END_USER account with name and email
   */
  async verifyEndUserOtp(
    verifyOtpDto: EndUserVerifyOtpDto,
  ): Promise<EndUserVerifyOtpResponseDto> {
    const { name, email, phone, otp } = verifyOtpDto;

    // Find the OTP record for this phone
    const otpRecord = await this.otpRepository.findActiveByPhone(phone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Check if user already exists (should not happen, but safety check)
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { phone, role: UserRole.END_USER },
      });

      if (existingUser) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          'User with this phone number already exists. Please login instead.',
        );
      }

      // Check if email is already registered
      if (email) {
        const existingUserByEmail = await queryRunner.manager.findOne(User, {
          where: { email },
        });
        if (existingUserByEmail) {
          await queryRunner.rollbackTransaction();
          throw new BadRequestException(
            USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
          );
        }
      }

      // Create new END_USER with all details
      const userData: Partial<User> = {
        phone,
        role: UserRole.END_USER,
        name,
        email,
        isActive: true,
        phoneVerified: true,
        isBlocked: false,
        intent: null,
      };

      const user = queryRunner.manager.create(User, userData);
      const savedUser = await queryRunner.manager.save(user);

      // Generate JWT tokens
      const { accessToken, refreshToken } = this.generateTokens(savedUser);

      // Update user with tokens
      await queryRunner.manager.update(
        User,
        { id: savedUser.id },
        { token: accessToken, refreshToken: refreshToken },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Account created successfully',
        accessToken,
        refreshToken,
        user: {
          id: savedUser.id,
          name: savedUser.name || '',
          email: savedUser.email || '',
          phone: savedUser.phone,
          role: savedUser.role,
          isActive: savedUser.isActive,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * End User Login - Send OTP
   * Sends OTP to existing end user for login
   */
  async loginEndUser(
    loginDto: EndUserLoginDto,
  ): Promise<EndUserLoginResponseDto> {
    const { phone } = loginDto;

    // Check if user exists with END_USER role
    const existingUser = await this.userRepository.findByPhoneAndRole(
      phone,
      UserRole.END_USER,
    );

    if (!existingUser) {
      throw new BadRequestException(
        'User with this phone number not found. Please signup first.',
      );
    }

    // Check if user is blocked
    if (existingUser.isBlocked) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
    }

    // Check if user is inactive
    if (!existingUser.isActive) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
    }

    // Send OTP for login
    const otpResponse = await this.sendOtp({
      phone,
      role: UserRole.END_USER,
    });

    return {
      success: true,
      message: 'OTP sent successfully to your mobile number',
      phone,
      otp: otpResponse.otp, // Only in development
    };
  }

  /**
   * End User Verify Login OTP
   * Validates OTP and logs in the end user
   */
  async verifyEndUserLoginOtp(
    verifyOtpDto: EndUserVerifyLoginOtpDto,
  ): Promise<EndUserVerifyLoginOtpResponseDto> {
    const { phone, otp } = verifyOtpDto;

    // Find the OTP record for this phone
    const otpRecord = await this.otpRepository.findActiveByPhone(phone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Find user
      const user = await queryRunner.manager.findOne(User, {
        where: { phone, role: UserRole.END_USER },
      });

      if (!user) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
      }

      // Check if user is blocked
      if (user.isBlocked) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
      }

      // Check if user is inactive
      if (!user.isActive) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
      }

      // Update phone verified flag
      await queryRunner.manager.update(
        User,
        { id: user.id },
        { phoneVerified: true },
      );

      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
      });

      if (!updatedUser) {
        throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = this.generateTokens(updatedUser);

      // Update user with tokens
      await queryRunner.manager.update(
        User,
        { id: updatedUser.id },
        { token: accessToken, refreshToken: refreshToken },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: updatedUser.id,
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Resend OTP to phone number
   */
  async resendOtp(resendOtpDto: ResendOtpDto): Promise<ResendOtpResponseDto> {
    const { phone } = resendOtpDto;

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate any existing OTPs for this phone
    await this.otpRepository.deleteByPhone(phone);

    // Create new OTP record
    await this.otpRepository.create({
      phone,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    // In production, integrate with SMS service
    // For development, log the OTP (only in non-production)
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`OTP resent for ${phone}: ${otpCode}`);
    }

    // Only return OTP in development/staging environments
    const response: ResendOtpResponseDto = {
      success: true,
      message: USER_MESSAGES.OTP.RESENT,
      otp: process.env.NODE_ENV === 'production' ? undefined : otpCode,
    };

    return response;
  }

  /**
   * Get list of supported cities
   */
  getCities(): string[] {
    return ['Delhi', 'Noida', 'Gurugram'];
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token with proper typing
      const decodedToken =
        this.jwtService.verify<RefreshTokenPayload>(refreshToken);

      if (decodedToken.type !== 'refresh_token') {
        throw new BadRequestException(USER_MESSAGES.AUTH.INVALID_TOKEN_TYPE);
      }

      // Find user by ID
      const user = await this.userRepository.findById(decodedToken.sub);
      if (!user) {
        throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
      }

      // Check if the refresh token matches the one stored in database
      if (user.refreshToken !== refreshToken) {
        throw new BadRequestException(USER_MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
      }

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        this.generateTokens(user);

      // Update user with new tokens
      await this.updateUserTokens(user.id, newAccessToken, newRefreshToken);

      return {
        success: true,
        message: USER_MESSAGES.AUTH.TOKEN_REFRESHED,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BadRequestException(USER_MESSAGES.AUTH.TOKEN_EXPIRED);
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new BadRequestException(USER_MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
      } else {
        throw new BadRequestException(USER_MESSAGES.AUTH.TOKEN_REFRESH_FAILED);
      }
    }
  }

  /**
   * Logout user and clear tokens
   */
  async logout(userId: string): Promise<LogoutResponseDto> {
    await this.clearUserTokens(userId);
    return {
      success: true,
      message: USER_MESSAGES.AUTH.LOGOUT_SUCCESSFUL,
    };
  }

  /**
   * Clear user tokens from database
   */
  private async clearUserTokens(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      token: null,
      refreshToken: null,
    });
  }

  /**
   * Build seller/channel partner dashboard data
   */
  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const used = await this.propertyRepository.countByUserId(user.id);
    const isChannelPartner = user.role === UserRole.CHANNEL_PARTNER;
    const total = isChannelPartner ? null : MAX_LISTINGS_PER_OWNER;
    const remaining = isChannelPartner ? null : Math.max(0, (total as number) - used);
    const daySince = new Date();
    daySince.setDate(daySince.getDate() - 1);
    const weekSince = new Date();
    weekSince.setDate(weekSince.getDate() - 7);
    const monthSince = new Date();
    monthSince.setDate(monthSince.getDate() - 30);

    const [
      dayResidential,
      dayCommercial,
      weekResidential,
      weekCommercial,
      monthResidential,
      monthCommercial,
    ] = await Promise.all([
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.RESIDENTIAL, daySince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.COMMERCIAL, daySince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.RESIDENTIAL, weekSince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.COMMERCIAL, weekSince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.RESIDENTIAL, monthSince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.COMMERCIAL, monthSince),
    ]);

    return {
      name: user.name ?? null,
      role: user.role,
      plan: isChannelPartner ? 'CHANNEL_PARTNER' : 'FREE',
      freeListings: {
        used,
        total,
        remaining,
        isUnlimited: isChannelPartner,
      },
      leadsSummary: {
        lastDay: {
          residential: dayResidential,
          commercial: dayCommercial,
        },
        lastWeek: {
          residential: weekResidential,
          commercial: weekCommercial,
        },
        lastMonth: {
          residential: monthResidential,
          commercial: monthCommercial,
        },
      },
    };
  }

  /**
   * Get End User Profile
   */
  async getEndUserProfile(userId: string): Promise<EndUserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException('User is not an end user');
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Edit End User Profile (Name and Email)
   */
  async editEndUserProfile(
    userId: string,
    editProfileDto: EndUserEditProfileDto,
  ): Promise<EndUserEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException('User is not an end user');
    }

    const updateData: Partial<User> = {};

    if (editProfileDto.name !== undefined) {
      updateData.name = editProfileDto.name || null;
    }

    if (editProfileDto.email !== undefined) {
      // Check if email is already used by another user
      if (editProfileDto.email) {
        const existingUserByEmail = await this.userRepository.findByEmail(
          editProfileDto.email,
        );
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          throw new BadRequestException(
            USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
          );
        }
      }
      updateData.email = editProfileDto.email || null;
    }

    if (editProfileDto.profileImage !== undefined) {
      updateData.profileImage = editProfileDto.profileImage || null;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profileImage: updatedUser.profileImage,
      },
    };
  }

  /**
   * Change Mobile Number - Send OTP
   */
  async changeEndUserMobile(
    userId: string,
    changeMobileDto: EndUserChangeMobileDto,
  ): Promise<EndUserChangeMobileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException('User is not an end user');
    }

    const { phone: newPhone } = changeMobileDto;

    // Check if new phone is same as current phone
    if (user.phone === newPhone) {
      throw new BadRequestException(
        'New mobile number is the same as current mobile number',
      );
    }

    // Check if new phone is already registered
    const existingUser = await this.userRepository.findByPhoneAndRole(
      newPhone,
      UserRole.END_USER,
    );
    if (existingUser) {
      throw new BadRequestException(
        'This mobile number is already registered with another account',
      );
    }

    // Send OTP to new phone number
    const otpResponse = await this.sendOtp({
      phone: newPhone,
      role: UserRole.END_USER,
    });

    return {
      success: true,
      message: 'OTP sent successfully to your new mobile number',
      phone: newPhone,
      otp: otpResponse.otp, // Only in development
    };
  }

  /**
   * Verify OTP and Change Mobile Number
   */
  async verifyChangeEndUserMobile(
    userId: string,
    verifyOtpDto: EndUserVerifyChangeMobileOtpDto,
  ): Promise<EndUserVerifyChangeMobileOtpResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException('User is not an end user');
    }

    const { phone: newPhone, otp } = verifyOtpDto;

    // Find the OTP record for the new phone
    const otpRecord = await this.otpRepository.findActiveByPhone(newPhone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Check if new phone is already registered (double check)
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { phone: newPhone, role: UserRole.END_USER },
      });

      if (existingUser && existingUser.id !== userId) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          'This mobile number is already registered with another account',
        );
      }

      // Update user's phone number and mark as verified
      await queryRunner.manager.update(
        User,
        { id: userId },
        { phone: newPhone, phoneVerified: true },
      );

      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!updatedUser) {
        throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Mobile number changed successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Get End User Home Page Data
   * Returns featured cities and all cities list with search and location detection
   */
  async getEndUserHomePage(
    query?: EndUserCitiesQueryDto,
  ): Promise<EndUserHomePageResponseDto> {
    const { search, latitude, longitude } = query || {};

    // Map cities to DTO format
    const mapCityToDto = (city: any): CityItemDto => ({
      id: city.id,
      name: city.name,
      code: city.code,
      state: city.state,
      latitude: city.latitude ? parseFloat(city.latitude.toString()) : null,
      longitude: city.longitude ? parseFloat(city.longitude.toString()) : null,
      iconUrl: null, // Can be added later if city icons are stored
    });

    // Get featured cities from database
    const featuredCitiesFromDb = await this.cityRepository.findFeatured();
    const featuredCities = featuredCitiesFromDb.map(mapCityToDto);

    // Detect city based on search or latitude/longitude
    let detectedCity: CityItemDto | null = null;

    // Priority 1: If search is provided, use search results
    if (search && search.trim()) {
      const searchResults = await this.cityRepository.searchByName(
        search.trim(),
        1,
      );
      if (searchResults.length > 0) {
        detectedCity = mapCityToDto(searchResults[0]);
      }
    }
    // Priority 2: If no search but lat/long provided, detect by location
    else if (latitude !== undefined && longitude !== undefined) {
      const allCitiesForDetection = await this.cityRepository.findAll();

      // Find the nearest city using Haversine formula
      let minDistance = Infinity;
      let nearestCity: any = null;

      for (const city of allCitiesForDetection) {
        if (city.latitude && city.longitude) {
          const cityLat = parseFloat(city.latitude.toString());
          const cityLon = parseFloat(city.longitude.toString());

          // Haversine formula to calculate distance
          const R = 6371; // Earth's radius in km
          const dLat = this.deg2rad(cityLat - latitude);
          const dLon = this.deg2rad(cityLon - longitude);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(latitude)) *
              Math.cos(this.deg2rad(cityLat)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; // Distance in km

          if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
          }
        }
      }

      // Only return detected city if it's within reasonable distance (e.g., 50km)
      if (nearestCity && minDistance <= 50) {
        detectedCity = mapCityToDto(nearestCity);
      }
    }

    return {
      success: true,
      featuredCities,
      detectedCity,
    };
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Search properties for end users
   * Returns paginated list of active properties with filters
   */
  async searchEndUserProperties(
    query: EndUserPropertiesSearchQueryDto,
  ): Promise<EndUserPropertiesSearchResponseDto> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      cityId,
      search,
      categoryIds,
      propertyTypeIds,
      bhkTypeIds,
      furnishingTypes,
      constructionStatuses,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius,
    } = query;

    const result = await this.propertyRepository.findEndUserProjects({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        cityId,
        search,
        categoryIds,
        propertyTypeIds,
        bhkTypeIds,
        furnishingTypes,
        constructionStatuses,
        minPrice,
        maxPrice,
        latitude,
        longitude,
        radius,
      },
    });

    // Map properties to response DTO
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (property) => {
        // Get primary image (cover image or first image)
        let imageUrl: string | null = null;
        if (property.photos && property.photos.length > 0) {
          const coverImage = property.photos.find((p) => p.isCoverImage);
          const firstPhoto = property.photos[0];
          const selectedPhoto = coverImage || firstPhoto;
          // Note: You may need to generate full URL from fileKey using S3Service
          // For now, returning fileKey - adjust based on your URL generation logic
          imageUrl = selectedPhoto.fileKey || null;
        }

        // Build address
        const addressParts: string[] = [];
        if (property.society?.name) {
          addressParts.push(property.society.name);
        }
        if (property.locality?.name) {
          addressParts.push(property.locality.name);
        }
        if (property.city?.name) {
          addressParts.push(property.city.name);
        }
        const address = addressParts.join(', ') || 'Address not available';

        // Build property name (use society name or property description)
        const propertyName =
          property.society?.name ||
          property.propertyDescription?.split('.')[0] ||
          'Property';

        // Build units array (simplified - you may want to enhance this)
        const units: EndUserPropertyUnitDto[] = [];
        if (property.bhkType?.name && property.builtUpAreaMetadata) {
          const superBuiltUpArea = property.builtUpAreaMetadata.superBuiltUpArea
            ? `${property.builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
            : property.builtUpAreaMetadata.carpetArea
              ? `${property.builtUpAreaMetadata.carpetArea} Sq. Ft.`
              : 'Size not available';
          const price =
            property.price != null
              ? `₹ ${property.price.toLocaleString('en-IN')}`
              : property.monthlyRent != null
                ? `₹ ${property.monthlyRent.toLocaleString('en-IN')}/month`
                : 'Price On Request';

          units.push({
            unit: property.bhkType.name,
            size: `${superBuiltUpArea} (Saleable)`,
            price,
          });
        }

        return {
          id: property.id,
          propertyName,
          address,
          description: property.propertyDescription || undefined,
          imageUrl,
          isReraRegistered: false, // Add RERA field to Property entity if needed
          constructionStatus: property.constructionStatus || null,
          category: property.category?.name || null,
          propertyType: property.propertyType?.name || null,
          bhkType: property.bhkType?.name || null,
          price: property.price || null,
          monthlyRent: property.monthlyRent || null,
          city: property.city?.name || null,
          society: property.society?.name || null,
          locality: property.locality?.name || null,
          units: units.length > 0 ? units : undefined,
        };
      },
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      success: true,
      properties,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Auto-detect nearby cities using Google Places API based on latitude/longitude
   */
  async autoDetectCity(
    latitude: number,
    longitude: number,
  ): Promise<any[]> {
    // Search for nearby cities within 10-15 km
    const nearbyCities = await this.googlePlacesService.searchNearbyCities(
      latitude,
      longitude,
      15000, // 15km radius
    );

    // Map to response format
    return nearbyCities.map((city) => ({
      id: city.placeId || `google-${Math.random()}`,
      name: city.name,
      code: city.name.toLowerCase().replace(/\s+/g, '-'),
      state: city.state || undefined,
      latitude: city.latitude || undefined,
      longitude: city.longitude || undefined,
      source: 'google',
      country: city.country,
      placeId: city.placeId,
    }));
  }
}
