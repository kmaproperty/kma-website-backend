import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from './repositories/otp.repository';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import { User } from './entities/user.entity';
import { UserRole } from './enum/user-role.enum';
import { KycStatus } from './enum/kyc-status.enum';
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
  EndUserPropertiesCountQueryDto,
  EndUserPropertiesCountResponseDto,
  EndUserPropertyListItemDto,
  EndUserPropertyUnitDto,
  EndUserPropertyImageDto,
  EndUserPropertyVideoDto,
  EndUserTopPropertiesQueryDto,
  EndUserTopPropertiesResponseDto,
  EndUserTopCityItemDto,
  EndUserTopCitiesResponseDto,
  EndUserPropertyDetailsResponseDto,
  EndUserChannelPartnerListQueryDto,
  EndUserChannelPartnerListResponseDto,
  ChannelPartnerListItemDto,
  EndUserChannelPartnerDetailsResponseDto,
  ChannelPartnerStatisticsDto,
  UploadProfilePicDto,
  UploadProfilePicResponseDto,
  GetProfilePicResponseDto,
  UploadLivePhotoDto,
  UploadLivePhotoResponseDto,
  VerifyAadhaarDto,
  VerifyAadhaarResponseDto,
  BankDetailsDto,
  BankDetailsResponseDto,
  DocuSignAgreementStatusResponseDto,
  VerificationStepsStatusResponseDto,
  GetLivePhotoResponseDto,
  GetAadhaarDetailsResponseDto,
  GetBankDetailsResponseDto,
  OwnerProfileResponseDto,
  OwnerEditProfileDto,
  OwnerEditProfileResponseDto,
  ChannelPartnerProfileResponseDto,
  ChannelPartnerEditProfileDto,
  ChannelPartnerEditProfileResponseDto,
  UserProfileResponseDto,
  UserEditProfileDto,
  UserEditProfileResponseDto,
  SendOtpForContactUsDto,
  SendOtpForContactUsResponseDto,
  SubmitContactUsDto,
  ContactUsResponseDto,
  SubmitRatingReviewDto,
  SubmitRatingReviewResponseDto,
  HomePageReviewsResponseDto,
  HomePageReviewItemDto,
  HomePageReviewsStatisticsDto,
  PropertyMasterDataResponseDto,
  ListingTypeItemDto,
  CategoryItemDto,
  PropertyTypeItemDto,
  HomePageResponseDto,
  AboutUsDataDto,
  HomePageStatisticsDto,
  PropertyTypeExploreResponseDto,
  PropertyTypeExploreItemDto,
  PropertyTypeExploreQueryDto,
  EndUserConfigurationResponseDto,
  AddFavoritePropertyDto,
  RemoveFavoritePropertyDto,
  FavoritePropertyResponseDto,
  FavoritePropertyListQueryDto,
  FavoritePropertyListResponseDto,
  CheckFavoritePropertyQueryDto,
  CheckFavoritePropertyResponseDto,
} from './dto';
import { PropertyRepository } from '../property/repositories/property.repository';
import { Property } from '../property/entities/property.entity';
import { CityRepository } from '../property/repositories/city.repository';
import { PropertyListingTypeRepository } from '../property/repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from '../property/repositories/property-category-new.repository';
import { PropertyTypeRepository } from '../property/repositories/property-type.repository';
import { PropertyRejectionHistoryRepository } from '../property/repositories/property-rejection-history.repository';
import { PropertyVerificationRequestRepository } from '../property/repositories/property-verification-request.repository';
import { GooglePlacesService } from '../property/services/google-places.service';
import { PropertyStatus } from '../property/enum/property-status.enum';
import { PropertyVerificationStatus } from '../property/entities/property-verification-request.entity';
import { MAX_LISTINGS_PER_OWNER } from '../property/constants/property.constants';
import {
  DashboardResponseDto,
  SubmitPropertyRatingReviewDto,
  SubmitPropertyRatingReviewResponseDto,
  GetMyPropertyRatingReviewResponseDto,
} from './dto';
import { UpgradeToChannelPartnerDto, UpgradeToChannelPartnerResponseDto } from './dto/upgrade-channel-partner.dto';
import { LeadRepository } from './repositories/lead.repository';
import { LeadType } from './entities/lead.entity';
import { UserRoleHistoryRepository } from './repositories/user-role-history.repository';
import { ChannelPartnerAgreementRepository } from './repositories/channel-partner-agreement.repository';
import { AgreementStatus } from './entities/channel-partner-agreement.entity';
import { BankDetailsRepository } from './repositories/bank-details.repository';
import { EncryptionService } from './services/encryption.service';
import { PropertyViewTrackerService } from './services/property-view-tracker.service';
import { ContactUsKmaQueryRepository } from './repositories/contact-us-kma-query.repository';
import { KmaRatingReviewRepository } from './repositories/kma-rating-review.repository';
import { PropertyRatingReviewRepository } from './repositories/property-rating-review.repository';
import { AboutUsRepository } from '../admin/repositories/about-us.repository';
import { AdminConfigurationRepository } from '../admin/repositories/admin-configuration.repository';
import { FavoritePropertyRepository } from './repositories/favorite-property.repository';

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
    private readonly agreementRepository: ChannelPartnerAgreementRepository,
    private readonly bankDetailsRepository: BankDetailsRepository,
    private readonly encryptionService: EncryptionService,
    private readonly contactUsKmaQueryRepository: ContactUsKmaQueryRepository,
    private readonly kmaRatingReviewRepository: KmaRatingReviewRepository,
    private readonly propertyRatingReviewRepository: PropertyRatingReviewRepository,
    private readonly propertyListingTypeRepository: PropertyListingTypeRepository,
    private readonly propertyCategoryRepository: PropertyCategoryNewRepository,
    private readonly propertyTypeRepository: PropertyTypeRepository,
    private readonly propertyRejectionHistoryRepository: PropertyRejectionHistoryRepository,
    private readonly propertyVerificationRequestRepository: PropertyVerificationRequestRepository,
    private readonly aboutUsRepository: AboutUsRepository,
    private readonly adminConfigurationRepository: AdminConfigurationRepository,
    private readonly favoritePropertyRepository: FavoritePropertyRepository,
    private readonly propertyViewTracker: PropertyViewTrackerService,
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
      profilePhotoUrl,
    } = dto;

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

    // Validate channel partner code if provided
    if (channelPartnerCode) {
      const validCode =
        await this.channelPartnerCodeRepository.findByCode(channelPartnerCode);
      if (!validCode) {
        throw new BadRequestException('Invalid channel partner code');
      }
    }

    // Use provided phone or existing user phone
    const phoneToUse = phone || user.phone;

    // Check if a CHANNEL_PARTNER with the same phone already exists
    // This prevents violating the unique constraint UQ_users_phone_role
    const existingChannelPartner = await this.userRepository.findByPhoneAndRole(
      phoneToUse,
      UserRole.CHANNEL_PARTNER,
    );
    if (existingChannelPartner && existingChannelPartner.id !== user.id) {
      throw new BadRequestException(
        'A CHANNEL_PARTNER account with this phone number already exists',
      );
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== user.id) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<User> = {
      role: UserRole.CHANNEL_PARTNER,
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone;
    if (channelPartnerCode !== undefined) updateData.channelPartnerCode = channelPartnerCode || null;
    if (firmName !== undefined) updateData.firmName = firmName || null;
    if (businessSince !== undefined) updateData.businessSince = businessSince || null;
    if (cities !== undefined) updateData.cities = cities || null;
    if (aboutYourSelf !== undefined) updateData.aboutYourSelf = aboutYourSelf || null;
    if (intent !== undefined) updateData.intent = intent || null;
    if (profilePhotoUrl !== undefined) updateData.profileImage = profilePhotoUrl || null;

    // Update role and persist history in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        User,
        { id: user.id },
        updateData,
      );
      if (channelPartnerCode) {
        await this.userRoleHistoryRepository.create({
          userId: user.id,
          fromRole: UserRole.OWNER,
          toRole: UserRole.CHANNEL_PARTNER,
          channelPartnerCode: channelPartnerCode,
        });
      }
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
      throw new BadRequestException('User already exists. Please login.');
    }

    // Check if same phone number has conflicting user types (CHANNEL_PARTNER and OWNER cannot coexist)
    if (userRole === UserRole.OWNER) {
      const existingChannelPartner = await this.userRepository.findByPhoneAndRole(
        phone,
        UserRole.CHANNEL_PARTNER,
      );
      if (existingChannelPartner) {
        throw new BadRequestException('User already exists. Please login.');
      }
    } else if (userRole === UserRole.CHANNEL_PARTNER) {
      const existingOwner = await this.userRepository.findByPhoneAndRole(
        phone,
        UserRole.OWNER,
      );
      if (existingOwner) {
        throw new BadRequestException('User already exists. Please login.');
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
      throw new BadRequestException('User not found. Please signup first.');
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

      // Get property count for the user
      const propertyCount = await this.propertyRepository.countByUserId(user.id);

      // Check and update KYC status
      const kycCompleted = await this.checkAndUpdateKycStatus(user.id);

      const hasReachedListingLimit =
        user.role === UserRole.OWNER
          ? propertyCount >= MAX_LISTINGS_PER_OWNER
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
        propertyCount,
        kycCompleted,
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
    const { name, email, intent, city, profilePhotoUrl } = createOwnerDto;
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
      profileImage: profilePhotoUrl || null,
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
      profilePhotoUrl,
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
      profileImage: profilePhotoUrl || null,
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
      throw new BadRequestException('User already exists. Please login.');
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
        throw new BadRequestException('User already exists. Please login.');
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

      // Merge session with user account if sessionId is provided
      if (verifyOtpDto.sessionId) {
        await this.propertyViewTracker.mergeSessionWithUser(
          verifyOtpDto.sessionId,
          savedUser.id,
        );
      }

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
      throw new BadRequestException('User not found. Please signup first.');
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

      // Merge session with user account if sessionId is provided
      if (verifyOtpDto.sessionId) {
        await this.propertyViewTracker.mergeSessionWithUser(
          verifyOtpDto.sessionId,
          updatedUser.id,
        );
      }

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

    // Get category IDs for residential and commercial
    const residentialCategory = await this.propertyCategoryRepository.findByCode('residential');
    const commercialCategory = await this.propertyCategoryRepository.findByCode('commercial');

    // Count properties by category for the user
    const [
      residentialCount,
      commercialCount,
    ] = await Promise.all([
      residentialCategory
        ? this.propertyRepository.countByUserIdAndCategoryId(
            user.id,
            residentialCategory.id,
          )
        : Promise.resolve(0),
      commercialCategory
        ? this.propertyRepository.countByUserIdAndCategoryId(
            user.id,
            commercialCategory.id,
          )
        : Promise.resolve(0),
    ]);

    // Get KYC status
    const kycStatus = await this.getVerificationStepsStatus(userId);

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
      listingsSummary: {
        residential: residentialCount,
        commercial: commercialCount,
      },
      kycStatus: {
        step1_live_photo: kycStatus.step1_live_photo,
        step2_aadhaar: kycStatus.step2_aadhaar,
        step3_bank_details: kycStatus.step3_bank_details,
        step4_docusign_agreement: kycStatus.step4_docusign_agreement,
        kyc_completed: kycStatus.kyc_completed,
        kyc_progress: kycStatus.kyc_progress,
        kyc_steps_completed: kycStatus.kyc_steps_completed,
        kyc_total_steps: kycStatus.kyc_total_steps,
        kyc_status: kycStatus.kyc_status,
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
   * Get User Profile (Owner or Channel Partner)
   */
  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.OWNER && user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User must be an owner or channel partner');
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
        city: user.role === UserRole.OWNER ? user.cities : null,
        channelPartnerCode: user.role === UserRole.CHANNEL_PARTNER ? user.channelPartnerCode : null,
        firmName: user.role === UserRole.CHANNEL_PARTNER ? user.firmName : null,
        businessSince: user.role === UserRole.CHANNEL_PARTNER ? user.businessSince : null,
        cities: user.role === UserRole.CHANNEL_PARTNER ? user.cities : null,
        aboutYourSelf: user.role === UserRole.CHANNEL_PARTNER ? user.aboutYourSelf : null,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Get Owner Profile
   */
  async getOwnerProfile(userId: string): Promise<OwnerProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.OWNER) {
      throw new BadRequestException('User is not an owner');
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
        intent: user.intent,
        city: user.cities,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Edit Owner Profile
   */
  async editOwnerProfile(
    userId: string,
    editProfileDto: OwnerEditProfileDto,
  ): Promise<OwnerEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.OWNER) {
      throw new BadRequestException('User is not an owner');
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

    if (editProfileDto.intent !== undefined) {
      updateData.intent = editProfileDto.intent || null;
    }

    if (editProfileDto.city !== undefined) {
      updateData.cities = editProfileDto.city || null;
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
        intent: updatedUser.intent,
        city: updatedUser.cities,
        profileImage: updatedUser.profileImage,
      },
    };
  }

  /**
   * Get Channel Partner Profile
   */
  async getChannelPartnerProfile(
    userId: string,
  ): Promise<ChannelPartnerProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
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
        channelPartnerCode: user.channelPartnerCode,
        firmName: user.firmName,
        businessSince: user.businessSince,
        cities: user.cities,
        aboutYourSelf: user.aboutYourSelf,
        intent: user.intent,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Edit User Profile (Owner or Channel Partner)
   */
  async editUserProfile(
    userId: string,
    editProfileDto: UserEditProfileDto,
  ): Promise<UserEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.OWNER && user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User must be an owner or channel partner');
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

    // Owner-specific fields
    if (user.role === UserRole.OWNER) {
      if (editProfileDto.city !== undefined) {
        updateData.cities = editProfileDto.city || null;
      }
    }

    // Channel Partner-specific fields
    if (user.role === UserRole.CHANNEL_PARTNER) {
      if (editProfileDto.channelPartnerCode !== undefined) {
        // Validate channel partner code if provided
        if (editProfileDto.channelPartnerCode) {
          const validCode =
            await this.channelPartnerCodeRepository.findByCode(
              editProfileDto.channelPartnerCode,
            );
          if (!validCode) {
            throw new BadRequestException(
              USER_MESSAGES.CHANNEL_PARTNER.INVALID_CODE,
            );
          }
        }
        updateData.channelPartnerCode =
          editProfileDto.channelPartnerCode || null;
      }

      if (editProfileDto.firmName !== undefined) {
        updateData.firmName = editProfileDto.firmName || null;
      }

      if (editProfileDto.businessSince !== undefined) {
        updateData.businessSince = editProfileDto.businessSince || null;
      }

      if (editProfileDto.cities !== undefined) {
        updateData.cities = editProfileDto.cities || null;
      }

      if (editProfileDto.aboutYourSelf !== undefined) {
        updateData.aboutYourSelf = editProfileDto.aboutYourSelf || null;
      }
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
        city: updatedUser.role === UserRole.OWNER ? updatedUser.cities : null,
        channelPartnerCode: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.channelPartnerCode : null,
        firmName: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.firmName : null,
        businessSince: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.businessSince : null,
        cities: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.cities : null,
        aboutYourSelf: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.aboutYourSelf : null,
        profileImage: updatedUser.profileImage,
      },
    };
  }

  /**
   * Edit Channel Partner Profile
   */
  async editChannelPartnerProfile(
    userId: string,
    editProfileDto: ChannelPartnerEditProfileDto,
  ): Promise<ChannelPartnerEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
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

    if (editProfileDto.channelPartnerCode !== undefined) {
      // Validate channel partner code if provided
      if (editProfileDto.channelPartnerCode) {
        const validCode =
          await this.channelPartnerCodeRepository.findByCode(
            editProfileDto.channelPartnerCode,
          );
        if (!validCode) {
          throw new BadRequestException(
            USER_MESSAGES.CHANNEL_PARTNER.INVALID_CODE,
          );
        }
      }
      updateData.channelPartnerCode =
        editProfileDto.channelPartnerCode || null;
    }

    if (editProfileDto.firmName !== undefined) {
      updateData.firmName = editProfileDto.firmName || null;
    }

    if (editProfileDto.businessSince !== undefined) {
      updateData.businessSince = editProfileDto.businessSince || null;
    }

    if (editProfileDto.cities !== undefined) {
      updateData.cities = editProfileDto.cities || null;
    }

    if (editProfileDto.aboutYourSelf !== undefined) {
      updateData.aboutYourSelf = editProfileDto.aboutYourSelf || null;
    }

    if (editProfileDto.intent !== undefined) {
      updateData.intent = editProfileDto.intent || null;
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
        channelPartnerCode: updatedUser.channelPartnerCode,
        firmName: updatedUser.firmName,
        businessSince: updatedUser.businessSince,
        cities: updatedUser.cities,
        aboutYourSelf: updatedUser.aboutYourSelf,
        intent: updatedUser.intent,
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
      icon: city.icon ?? null,
    });

    // Get featured cities from database
    const featuredCitiesFromDb = await this.cityRepository.findFeatured();
    let featuredCities = featuredCitiesFromDb.map(mapCityToDto);

    // Get all cities from database
    const allCitiesFromDb = await this.cityRepository.findAll();
    let allCities = allCitiesFromDb.map(mapCityToDto);

    // Filter both featuredCities and allCities based on search query (if provided)
    if (search && search.trim()) {
      const searchQuery = search.trim().toLowerCase();
      featuredCities = featuredCities.filter((city) =>
        city.name.toLowerCase().includes(searchQuery),
      );
      allCities = allCities.filter((city) =>
        city.name.toLowerCase().includes(searchQuery),
      );
    }
    // If search is empty, both arrays already contain all cities

    // Detect city based on latitude/longitude (only for location detection)
    let detectedCity: CityItemDto | null = null;
    if (latitude !== undefined && longitude !== undefined) {
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
      allCities,
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
   * @param query - Search query parameters
   * @param userId - Optional user ID to check favorite status (if logged in)
   */
  async searchEndUserProperties(
    query: EndUserPropertiesSearchQueryDto,
    userId?: string,
  ): Promise<EndUserPropertiesSearchResponseDto> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      cityId,
      search,
      categoryIds,
      listingTypeIds,
      propertyTypeIds,
      bhkTypeIds,
      furnishingTypes,
      constructionStatuses,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius,
      postedBy,
    } = query;

    const result = await this.propertyRepository.findEndUserProperties({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        cityId,
        search,
        categoryIds,
        listingTypeIds,
        propertyTypeIds,
        bhkTypeIds,
        furnishingTypes,
        constructionStatuses,
        minPrice,
        maxPrice,
        latitude,
        longitude,
        radius,
        postedBy,
      },
    });

    // Get favorite property IDs if user is logged in
    let favoritePropertyIds: Set<string> = new Set();
    if (userId) {
      const favoriteProperties = await this.favoritePropertyRepository
        .findByUserId(userId, 1, 10000); // Get all favorites (large limit to get all)
      favoritePropertyIds = new Set(
        favoriteProperties.items.map((fp) => fp.propertyId),
      );
    }

    // Map properties to response DTO
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (property) => {
        // Get primary image (cover image or first image) and all images
        let imageUrl: string | null = null;
        let images: EndUserPropertyImageDto[] | undefined = undefined;
        if (property.photos && property.photos.length > 0) {
          const coverImage = property.photos.find((p) => p.isCoverImage);
          const firstPhoto = property.photos[0];
          const selectedPhoto = coverImage || firstPhoto;
          // Note: You may need to generate full URL from fileKey using S3Service
          // For now, returning fileKey - adjust based on your URL generation logic
          imageUrl = selectedPhoto.fileKey || null;
          
          // Map all images
          images = property.photos.map((photo) => ({
            fileKey: photo.fileKey,
            view: photo.view,
            isCoverImage: photo.isCoverImage || false,
          }));
        }

        // Map all videos
        let videos: EndUserPropertyVideoDto[] | undefined = undefined;
        if (property.videos && property.videos.length > 0) {
          videos = property.videos.map((video) => ({
            fileKey: video.fileKey,
            format: video.format,
          }));
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
          images: images,
          videos: videos,
          imageCount: property.photos?.length || 0,
          videoCount: property.videos?.length || 0,
          isReraRegistered: false, // Add RERA field to Property entity if needed
          constructionStatus: property.constructionStatus || null,
          category: property.category?.name || null,
          listingType: property.listingType?.name || null,
          propertyType: property.propertyType?.name || null,
          bhkType: property.bhkType?.name || null,
          plotArea: property.plotArea || null,
          plotAreaUnit: property.plotAreaUnit || null,
          facing: property.facing || null,
          furnishType: property.furnishType || null,
          price: property.price || null,
          monthlyRent: property.monthlyRent || null,
          city: property.city?.name || null,
          society: property.society?.name || null,
          locality: property.locality?.name || null,
          units: units.length > 0 ? units : undefined,
          owner: property.user
            ? {
                name: property.user.name,
                profileImage: property.user.profileImage,
                role: property.user.role,
              }
            : null,
          isFavorite: userId ? favoritePropertyIds.has(property.id) : false,
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
   * Get count of properties matching filters (similar to searchEndUserProperties but only returns count)
   */
  async getEndUserPropertiesCount(
    query: EndUserPropertiesCountQueryDto,
  ): Promise<EndUserPropertiesCountResponseDto> {
    const {
      cityId,
      search,
      categoryIds,
      listingTypeIds,
      propertyTypeIds,
      bhkTypeIds,
      furnishingTypes,
      constructionStatuses,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius,
      postedBy,
    } = query;

    const result = await this.propertyRepository.findEndUserProperties({
      page: 1, // Use page 1 for count
      limit: 1, // Use minimal limit since we only need count
      sortBy: 'createdAt', // Default sort (not used in count, but required by repository)
      sortOrder: 'DESC', // Default order (not used in count, but required by repository)
      filters: {
        cityId,
        search,
        categoryIds,
        listingTypeIds,
        propertyTypeIds,
        bhkTypeIds,
        furnishingTypes,
        constructionStatuses,
        minPrice,
        maxPrice,
        latitude,
        longitude,
        radius,
        postedBy,
      },
    });

    return {
      success: true,
      count: result.total,
    };
  }

  /**
   * Get top properties for end users
   * Returns top 5 properties filtered by city
   */
  async getTopProperties(
    query: EndUserTopPropertiesQueryDto,
  ): Promise<EndUserTopPropertiesResponseDto> {
    const { cityId } = query;
    const limit = 5; // Top 5 properties as per requirement

    const result = await this.propertyRepository.findTopProperties({
      page: 1,
      limit,
      cityId,
      status: PropertyStatus.ACTIVE,
    });

    // Map properties to response DTO (reuse the same mapping logic as searchEndUserProperties)
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (property) => {
        // Get primary image (cover image or first image) and all images
        let imageUrl: string | null = null;
        let images: EndUserPropertyImageDto[] | undefined = undefined;
        if (property.photos && property.photos.length > 0) {
          const coverImage = property.photos.find((p) => p.isCoverImage);
          const firstPhoto = property.photos[0];
          const selectedPhoto = coverImage || firstPhoto;
          imageUrl = selectedPhoto.fileKey || null;
          
          // Map all images
          images = property.photos.map((photo) => ({
            fileKey: photo.fileKey,
            view: photo.view,
            isCoverImage: photo.isCoverImage || false,
          }));
        }

        // Map all videos
        let videos: EndUserPropertyVideoDto[] | undefined = undefined;
        if (property.videos && property.videos.length > 0) {
          videos = property.videos.map((video) => ({
            fileKey: video.fileKey,
            format: video.format,
          }));
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

        // Build units array
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
          images: images,
          videos: videos,
          isReraRegistered: false,
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

    return {
      success: true,
      properties,
      total: result.total,
    };
  }

  /**
   * Get top cities by property count
   * Returns top 5 cities with maximum active properties
   */
  async getTopCities(): Promise<EndUserTopCitiesResponseDto> {
    const limit = 5; // Top 5 cities as per requirement
    const citiesWithCounts = await this.cityRepository.findTopCitiesByPropertyCount(limit);

    const cities: EndUserTopCityItemDto[] = citiesWithCounts.map((city) => ({
      id: city.id,
      name: city.name,
      code: city.code,
      state: city.state ?? null,
      latitude: city.latitude ? parseFloat(city.latitude.toString()) : null,
      longitude: city.longitude ? parseFloat(city.longitude.toString()) : null,
      imageUrl: city.imageUrl ?? null,
      propertyCount: city.propertyCount,
    }));

    return {
      success: true,
      cities,
    };
  }

  /**
   * Get Property Details for End User
   */
  async getEndUserPropertyDetails(
    propertyId: string,
  ): Promise<EndUserPropertyDetailsResponseDto> {
    const property = await this.propertyRepository.findByIdWithRelations(
      propertyId,
    );

    if (!property) {
      throw new BadRequestException('Property not found');
    }

    // Check if property is active and not deleted
    if (property.status !== PropertyStatus.ACTIVE || property.isDeleted) {
      throw new BadRequestException('Property is not available');
    }

    // Fetch the latest property verification request (ordered by createdAt DESC, so first is latest)
    const verificationRequests = await this.propertyVerificationRequestRepository.findByPropertyId(
      propertyId,
    );
    const latestVerificationRequest = verificationRequests[0] || null;

    // Return the full property entity with all loaded relations (photos, videos, master data, owner, etc.)
    return {
      success: true,
      property,
      verificationStatus: latestVerificationRequest?.status || null,
      comments: latestVerificationRequest?.rejectionReason || null,
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

  /**
   * Upload profile picture
   */
  async uploadProfilePic(
    userId: string,
    uploadProfilePicDto: UploadProfilePicDto,
  ): Promise<UploadProfilePicResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.userRepository.update(userId, {
      profileImage: uploadProfilePicDto.profile_pic_url,
    });

    return {
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_pic_url: uploadProfilePicDto.profile_pic_url,
    };
  }

  /**
   * Get profile picture
   */
  async getProfilePic(
    userId: string,
  ): Promise<GetProfilePicResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      success: true,
      profile_pic_url: user.profileImage ?? null,
    };
  }

  /**
   * Step 1: Upload live photo
   */
  async uploadLivePhoto(
    userId: string,
    uploadLivePhotoDto: UploadLivePhotoDto,
  ): Promise<UploadLivePhotoResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prepare update data
    const updateData: Partial<User> = {
      livePhotoUrl: uploadLivePhotoDto.live_photo_url,
      livePhotoApproved: false, // Reset approval status when new photo is uploaded
    };

    // If KYC was previously rejected, move status back to IN_REVIEW or PENDING
    if (user.kycStatus === KycStatus.REJECTED) {
      // Clear rejection reason
      updateData.kycRejectionReason = null;
      
      // Check if all user steps are completed to determine new status
      const agreementStatus = await this.getDocuSignAgreementStatus(userId);
      const step1Completed = !!(uploadLivePhotoDto.live_photo_url && uploadLivePhotoDto.live_photo_url.trim().length > 0);
      const allUserStepsCompleted =
        step1Completed && // Step 1: Live photo uploaded (user action)
        user.aadhaarVerified && // Step 2: Aadhaar verified (user action)
        user.bankDetailsFilled && // Step 3: Bank details filled (user action)
        agreementStatus.docusign_agreement_signed; // Step 4: DocuSign signed (user action)

      // Set status to IN_REVIEW if all steps completed, otherwise PENDING
      updateData.kycStatus = allUserStepsCompleted
        ? KycStatus.IN_REVIEW
        : KycStatus.PENDING;
    }

    await this.userRepository.update(userId, updateData);

    // Check and update KYC status (this will maintain the status if it's not REJECTED anymore)
    await this.checkAndUpdateKycStatus(userId);

    const updatedUser = await this.userRepository.findById(userId);
    return {
      success: true,
      message: 'Live photo uploaded successfully. Waiting for admin approval.',
      live_photo_url: uploadLivePhotoDto.live_photo_url,
      live_photo_approved: updatedUser?.livePhotoApproved ?? false,
    };
  }

  /**
   * Step 2: Verify Aadhaar
   * Accepts fixed OTP "1234" for verification
   */
  async verifyAadhaar(
    userId: string,
    verifyAadhaarDto: VerifyAadhaarDto,
  ): Promise<VerifyAadhaarResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(verifyAadhaarDto.aadhaar_number)) {
      throw new BadRequestException('Aadhaar number must be exactly 12 digits');
    }

    // Validate OTP - accept only "1234"
    if (verifyAadhaarDto.otp !== '1234') {
      throw new BadRequestException('Invalid OTP code. Please enter 1234.');
    }

    // Store Aadhaar number and mark as verified
    await this.userRepository.update(userId, {
      aadhaarNumber: verifyAadhaarDto.aadhaar_number,
      aadhaarVerified: true,
    });

    // Check and update KYC status
    await this.checkAndUpdateKycStatus(userId);

    return {
      success: true,
      message: 'Aadhaar verified successfully',
      aadhaar_verified: true,
    };
  }

  /**
   * Step 3: Save bank details (encrypted)
   */
  async saveBankDetails(
    userId: string,
    bankDetailsDto: BankDetailsDto,
  ): Promise<BankDetailsResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Encrypt sensitive fields
    const encryptedAccountNumber = this.encryptionService.encrypt(
      bankDetailsDto.account_number,
    );
    const encryptedIfscCode = this.encryptionService.encrypt(
      bankDetailsDto.ifsc_code,
    );

    // Save encrypted bank details
    await this.bankDetailsRepository.upsertBankDetails(userId, {
      accountNumber: encryptedAccountNumber,
      ifscCode: encryptedIfscCode,
      bankName: bankDetailsDto.bank_name,
      accountHolderName: bankDetailsDto.account_holder_name,
      branchName: bankDetailsDto.branch_name || null,
    });

    // Mark bank details as filled
    await this.userRepository.update(userId, {
      bankDetailsFilled: true,
    });

    // Check and update KYC status
    await this.checkAndUpdateKycStatus(userId);

    return {
      success: true,
      message: 'Bank details saved successfully',
      bank_details_filled: true,
    };
  }

  /**
   * Get bank details (decrypted) - for admin or user viewing their own details
   */
  async getBankDetails(userId: string): Promise<BankDetailsDto | null> {
    const bankDetails = await this.bankDetailsRepository.findByUserId(userId);
    if (!bankDetails) {
      return null;
    }

    // Decrypt sensitive fields
    try {
      const decryptedAccountNumber = this.encryptionService.decrypt(
        bankDetails.accountNumber,
      );
      const decryptedIfscCode = this.encryptionService.decrypt(
        bankDetails.ifscCode,
      );

      return {
        account_number: decryptedAccountNumber,
        ifsc_code: decryptedIfscCode,
        bank_name: bankDetails.bankName,
        account_holder_name: bankDetails.accountHolderName,
        branch_name: bankDetails.branchName || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to decrypt bank details', error);
      throw new BadRequestException('Failed to retrieve bank details');
    }
  }

  /**
   * Get live photo with status
   */
  async getLivePhoto(userId: string): Promise<GetLivePhotoResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      success: true,
      live_photo_url: user.livePhotoUrl ?? null,
      live_photo_approved: user.livePhotoApproved,
    };
  }

  /**
   * Get Aadhaar details with status
   */
  async getAadhaarDetails(
    userId: string,
  ): Promise<GetAadhaarDetailsResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      success: true,
      aadhaar_number: user.aadhaarNumber ?? null,
      aadhaar_verified: user.aadhaarVerified,
    };
  }

  /**
   * Get bank details (for user endpoint)
   */
  async getUserBankDetails(
    userId: string,
  ): Promise<GetBankDetailsResponseDto> {
    const bankDetails = await this.getBankDetails(userId);

    return {
      success: true,
      bank_details: bankDetails,
    };
  }

  /**
   * Step 4: Get DocuSign agreement status
   */
  async getDocuSignAgreementStatus(
    userId: string,
  ): Promise<DocuSignAgreementStatusResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if there's a completed agreement
    const agreements = await this.agreementRepository.findByUserId(userId);
    const completedAgreement = agreements.find(
      (agreement) => agreement.status === AgreementStatus.COMPLETED,
    );

    const isSigned = !!completedAgreement || user.docusignAgreementSigned;

    if (completedAgreement && !user.docusignAgreementSigned) {
      // Update the flag if agreement is completed but flag is not set
      await this.userRepository.update(userId, {
        docusignAgreementSigned: true,
      });
    }

    return {
      success: true,
      docusign_agreement_signed: isSigned,
      envelope_id: completedAgreement?.envelopeId ?? null,
    };
  }

  /**
   * Check and update KYC completion status
   * KYC is completed when all 4 steps are done:
   * 1. Live photo uploaded and approved by admin
   * 2. Aadhaar verified
   * 3. Bank details filled
   * 4. DocuSign agreement signed
   */
  async checkAndUpdateKycStatus(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // Check DocuSign agreement status (might be updated in agreement table)
    const agreementStatus = await this.getDocuSignAgreementStatus(userId);

    // Check if all 4 user steps are completed (not including admin approval)
    const step1Completed = !!(user.livePhotoUrl && user.livePhotoUrl.trim().length > 0);
    const allUserStepsCompleted =
      step1Completed && // Step 1: Live photo uploaded (user action)
      user.aadhaarVerified && // Step 2: Aadhaar verified (user action)
      user.bankDetailsFilled && // Step 3: Bank details filled (user action)
      agreementStatus.docusign_agreement_signed; // Step 4: DocuSign signed (user action)

    // Determine KYC status based on current state
    // Only auto-update status if it's not already APPROVED or REJECTED (to preserve admin decisions)
    let newKycStatus: KycStatus | null = null;
    
    if (user.kycStatus === KycStatus.APPROVED || user.kycStatus === KycStatus.REJECTED) {
      // Don't override admin decisions (APPROVED or REJECTED) - preserve the status
      newKycStatus = user.kycStatus;
    } else if (allUserStepsCompleted) {
      // All 4 user steps completed → set to IN_REVIEW (waiting for admin approval)
      newKycStatus = KycStatus.IN_REVIEW;
    } else {
      // Some or no steps completed → set to PENDING
      newKycStatus = KycStatus.PENDING;
    }

    // KYC is completed only if status is APPROVED
    const isKycCompleted = newKycStatus === KycStatus.APPROVED;

    // Update KYC status and completion flag if changed
    const updateData: Partial<User> = {};
    if (user.kycCompleted !== isKycCompleted) {
      updateData.kycCompleted = isKycCompleted;
    }
    // Only update status if it's different and we're not preserving an admin decision
    if (user.kycStatus !== newKycStatus && newKycStatus !== null) {
      updateData.kycStatus = newKycStatus;
    }

    if (Object.keys(updateData).length > 0) {
      await this.userRepository.update(userId, updateData);
    }

    return isKycCompleted;
  }

  /**
   * Get all verification steps status
   */
  async getVerificationStepsStatus(
    userId: string,
  ): Promise<VerificationStepsStatusResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check and update KYC status
    const kycCompleted = await this.checkAndUpdateKycStatus(userId);

    // Check DocuSign agreement status
    const agreementStatus = await this.getDocuSignAgreementStatus(userId);

    // Calculate progress
    // Step 1 is completed if live photo is uploaded (filled), not just approved
    const step1Completed = !!(user.livePhotoUrl && user.livePhotoUrl.trim().length > 0);
    const steps = [
      step1Completed, // Step 1: Live photo uploaded (filled)
      user.aadhaarVerified, // Step 2
      user.bankDetailsFilled, // Step 3
      agreementStatus.docusign_agreement_signed, // Step 4
    ];
    const stepsCompleted = steps.filter(Boolean).length;
    const totalSteps = 4;
    const progress = Math.round((stepsCompleted / totalSteps) * 100);

    // Use the stored kycStatus from database, or determine it if not set
    const kycStatusValue = user.kycStatus || KycStatus.PENDING;
    const kycStatusString = kycStatusValue;

    return {
      success: true,
      step1_live_photo: {
        live_photo_url: user.livePhotoUrl ?? null,
        live_photo_approved: user.livePhotoApproved,
      },
      step2_aadhaar: {
        aadhaar_number: user.aadhaarNumber ?? null,
        aadhaar_verified: user.aadhaarVerified,
      },
      step3_bank_details: {
        bank_details_filled: user.bankDetailsFilled,
      },
      step4_docusign_agreement: {
        docusign_agreement_signed: agreementStatus.docusign_agreement_signed,
      },
      kyc_completed: kycCompleted,
      kyc_progress: progress,
      kyc_steps_completed: stepsCompleted,
      kyc_total_steps: totalSteps,
      kyc_status: kycStatusString,
      kyc_rejection_reason: user.kycRejectionReason ?? null,
    };
  }

  /**
   * Check if email already exists in the system
   * Throws BadRequestException if email exists
   */
  async checkDuplicateEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    
    return {
      message: 'Email is available',
    };
  }

  /**
   * List channel partners with search and filters for end users
   */
  async listChannelPartners(
    query: EndUserChannelPartnerListQueryDto,
  ): Promise<EndUserChannelPartnerListResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));

    // Parse property range if provided
    let propertyCountMin: number | undefined;
    let propertyCountMax: number | null | undefined;
    if (query.properties) {
      [propertyCountMin, propertyCountMax] = this.parsePropertyRange(query.properties);
    }

    // Get channel partners with all filters applied in SQL
    const { items: users, total } = await this.userRepository.findChannelPartners({
      page,
      limit,
      search: query.search,
      city: query.city,
      experience: query.experience,
      propertyCountMin,
      propertyCountMax,
    });

    // Calculate property counts and experience for each user (for response)
    const channelPartnersWithDetails = await Promise.all(
      users.map(async (user) => {
        const propertyCount = await this.propertyRepository.countByUserId(user.id);
        
        // Calculate experience years from businessSince
        let experienceYears: number | null = null;
        if (user.businessSince) {
          const businessDate = new Date(user.businessSince);
          const today = new Date();
          const years = Math.floor(
            (today.getTime() - businessDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );
          experienceYears = Math.max(0, years);
        }

        return {
          user,
          propertyCount,
          experienceYears,
        };
      })
    );

    // Map to response DTO
    const data: ChannelPartnerListItemDto[] = channelPartnersWithDetails.map((item) => ({
      id: item.user.id,
      name: item.user.name,
      firm_name: item.user.firmName,
      profile_image: item.user.profileImage,
      cities: item.user.cities,
      experience_years: item.experienceYears,
      property_count: item.propertyCount,
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Parse property range string to min and max values
   */
  private parsePropertyRange(range: string): [number, number | null] {
    if (range === '50+') {
      return [50, null];
    }
    const [min, max] = range.split('-').map(Number);
    return [min, max];
  }

  /**
   * Get channel partner details for end users
   */
  async getChannelPartnerDetails(
    channelPartnerId: string,
  ): Promise<EndUserChannelPartnerDetailsResponseDto> {
    const user = await this.userRepository.findById(channelPartnerId);
    if (!user) {
      throw new BadRequestException('Channel partner not found');
    }

    // Verify it's a channel partner
    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
    }

    // Verify channel partner is active and KYC completed
    if (!user.isActive || user.isBlocked || !user.kycCompleted) {
      throw new BadRequestException('Channel partner profile is not available');
    }

    // Calculate statistics
    const propertyCount = await this.propertyRepository.countByUserId(user.id);
    const activePropertyCount = await this.propertyRepository.countActivePropertiesByUserId(user.id);
    
    // Count total leads (buyers served)
    const totalLeads = await this.leadRepository.countByUserId(user.id);

    // Calculate experience years
    let experienceYears: number | null = null;
    if (user.businessSince) {
      const businessDate = new Date(user.businessSince);
      const today = new Date();
      const years = Math.floor(
        (today.getTime() - businessDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      );
      experienceYears = Math.max(0, years);
    }

    // Parse areas of operation from cities field
    const areasOfOperationList = user.cities
      ? user.cities.split(',').map((city) => city.trim()).filter(Boolean)
      : [];
    const areasOfOperationCount = new Set(areasOfOperationList).size;

    // Fetch active properties categorized
    const categorizedProperties = await this.propertyRepository.findActivePropertiesByUserIdCategorized(
      user.id,
    );

    // Helper function to map property to EndUserPropertyListItemDto
    const mapProperty = (property: any): EndUserPropertyListItemDto => {
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
    };

    // Map categorized properties
    const mappedActiveProperties = {
      buy: categorizedProperties.buy.map(mapProperty),
      rent: categorizedProperties.rent.map(mapProperty),
      commercial: categorizedProperties.commercial.map(mapProperty),
    };

    const statistics: ChannelPartnerStatisticsDto = {
      buyers_served: totalLeads,
      years_of_experience: experienceYears,
      property_holdings: propertyCount,
      active_properties: activePropertyCount,
      team_size: null, // Not available in database
      areas_of_operation: areasOfOperationCount,
    };

    return {
      success: true,
      id: user.id,
      name: user.name,
      firm_name: user.firmName,
      channel_partner_code: user.channelPartnerCode,
      profile_image: user.profileImage,
      created_at: user.createdAt,
      phone: user.phone,
      email: user.email,
      about: user.aboutYourSelf,
      cities: user.cities,
      trusted_since: user.businessSince,
      statistics,
      areas_of_operation_list: areasOfOperationList,
      active_properties: mappedActiveProperties,
    };
  }

  /**
   * Send OTP for contact us (for non-logged in users)
   */
  async sendOtpForContactUs(
    sendOtpDto: SendOtpForContactUsDto,
  ): Promise<SendOtpForContactUsResponseDto> {
    const { phone } = sendOtpDto;
    return await this.sendOtp({ phone });
  }

  /**
   * Submit contact us query (for both logged in and non-logged in users)
   * If logged in: endUserId is provided, no OTP needed
   * If not logged in: endUserId is null, OTP is required
   */
  async submitContactUs(
    submitDto: SubmitContactUsDto,
    endUserId: string | null = null,
  ): Promise<ContactUsResponseDto> {
    const { name, phone, email, otp } = submitDto;

    // If user is logged in, verify the user exists and is an end user
    if (endUserId) {
      const user = await this.userRepository.findById(endUserId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.role !== UserRole.END_USER) {
        throw new BadRequestException('Only end users can submit contact us queries');
      }

      // Create contact us query for logged in user
      const contactUsQuery = await this.contactUsKmaQueryRepository.create({
        name,
        phoneNumber: phone,
        email: email || null,
        endUserId, // Map to logged in end user
      });

      return {
        success: true,
        message: 'Contact us query submitted successfully',
        contactUsQueryId: contactUsQuery.id,
      };
    }

    // If not logged in, OTP is required
    if (!otp) {
      throw new BadRequestException(
        'OTP is required for non-logged in users. Please provide OTP or use /end-user/contact-us/send-otp to get one.',
      );
    }

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

      // Create contact us query for non-logged in user
      const contactUsQuery = await this.contactUsKmaQueryRepository.create({
        name,
        phoneNumber: phone,
        email: email || null,
        endUserId: null, // Not logged in
      });

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Contact us query submitted successfully',
        contactUsQueryId: contactUsQuery.id,
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
   * Submit rating and review for KMA (for logged in end users only)
   */
  async submitRatingReview(
    submitDto: SubmitRatingReviewDto,
    endUserId: string,
  ): Promise<SubmitRatingReviewResponseDto> {
    const { rating, review } = submitDto;

    // Verify the user exists and is an end user
    const user = await this.userRepository.findById(endUserId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException('Only end users can submit ratings and reviews');
    }

    // Create rating and review for logged in user
    // Get user information from authenticated user profile
    const ratingReview = await this.kmaRatingReviewRepository.create({
      rating,
      review: review || null,
      name: user.name || 'User',
      phoneNumber: user.phone,
      email: user.email || null,
      endUserId, // Map to logged in end user
    });

    return {
      success: true,
      message: 'Rating and review submitted successfully',
      ratingReviewId: ratingReview.id,
    };
  }

  /**
   * Submit or update rating and review for a specific property (logged in end users only)
   */
  async submitPropertyRatingReview(
    endUserId: string,
    dto: SubmitPropertyRatingReviewDto,
  ): Promise<SubmitPropertyRatingReviewResponseDto> {
    const {
      propertyId,
      role,
      connectivityRating,
      neighbourhoodRating,
      safetyRating,
      livabilityRating,
      likeText,
      dislikeText,
    } = dto;

    // Verify the user exists and is an end user
    const user = await this.userRepository.findById(endUserId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException(
        'Only end users can submit property ratings and reviews',
      );
    }

    // Verify the property exists and is active
    const property = await this.propertyRepository.findById(propertyId);
    if (!property || property.isDeleted || property.status !== PropertyStatus.ACTIVE) {
      throw new BadRequestException('Property is not available');
    }

    // Compute overall rating as average of the four categories
    const overallRating =
      (connectivityRating +
        neighbourhoodRating +
        safetyRating +
        livabilityRating) /
      4;

    const saved = await this.propertyRatingReviewRepository.upsertForUser(
      propertyId,
      endUserId,
      role,
      {
        connectivityRating,
        neighbourhoodRating,
        safetyRating,
        livabilityRating,
        likeText: likeText ?? null,
        dislikeText: dislikeText ?? null,
        overallRating,
      },
    );

    return {
      success: true,
      message: 'Property rating and review submitted successfully',
      ratingReviewId: saved.id,
    };
  }

  /**
   * Get logged-in user's rating and review for a specific property
   */
  async getMyPropertyRatingReview(
    endUserId: string,
    propertyId: string,
  ): Promise<GetMyPropertyRatingReviewResponseDto> {
    // Ensure user exists (cheap safety check)
    const user = await this.userRepository.findById(endUserId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const review =
      await this.propertyRatingReviewRepository.findByUserAndProperty(
        propertyId,
        endUserId,
      );

    if (!review) {
      return {
        success: true,
        review: null,
      };
    }

    return {
      success: true,
      review: {
        propertyId: review.propertyId,
        role: review.role,
        connectivityRating: review.connectivityRating,
        neighbourhoodRating: review.neighbourhoodRating,
        safetyRating: review.safetyRating,
        livabilityRating: review.livabilityRating,
        likeText: review.likeText ?? undefined,
        dislikeText: review.dislikeText ?? undefined,
      },
    };
  }

  /**
   * Get property master data (listing types, categories, and property types)
   * Structure: Listing Types -> Categories -> Property Types
   */
  async getPropertyMasterData(): Promise<PropertyMasterDataResponseDto> {
    // Fetch all listing types
    const listingTypes = await this.propertyListingTypeRepository.findAll();

    // Fetch all categories
    const categories = await this.propertyCategoryRepository.findAll();

    // Fetch all property types with their relations
    const propertyTypes = await this.propertyTypeRepository.findAll();

    // Build the hierarchical structure
    const listingTypeItems: ListingTypeItemDto[] = listingTypes.map(
      (listingType) => {
        // For each listing type, get categories that have property types for this listing type
        const categoryMap = new Map<string, CategoryItemDto>();

        // Filter property types for this listing type
        const propertyTypesForListingType = propertyTypes.filter(
          (pt) => pt.listingTypeId === listingType.id,
        );

        // Group property types by category
        propertyTypesForListingType.forEach((propertyType) => {
          const categoryId = propertyType.categoryId;

          if (!categoryMap.has(categoryId)) {
            const category = categories.find((c) => c.id === categoryId);
            if (category) {
              categoryMap.set(categoryId, {
                id: category.id,
                name: category.name,
                code: category.code,
                propertyTypes: [],
              });
            }
          }

          const categoryItem = categoryMap.get(categoryId);
          if (categoryItem) {
            categoryItem.propertyTypes.push({
              id: propertyType.id,
              name: propertyType.name,
              code: propertyType.code,
            });
          }
        });

        // Convert map to array and filter out categories with no property types
        const categoryItems = Array.from(categoryMap.values()).filter(
          (cat) => cat.propertyTypes.length > 0,
        );

        return {
          id: listingType.id,
          name: listingType.name,
          code: listingType.code,
          categories: categoryItems,
        };
      },
    );

    // Filter out listing types with no categories
    const filteredListingTypes = listingTypeItems.filter(
      (lt) => lt.categories.length > 0,
    );

    return {
      success: true,
      message: 'Property master data retrieved successfully',
      data: filteredListingTypes,
    };
  }

  /**
   * Get home page reviews (top 5 approved reviews with statistics)
   */
  async getHomePageReviews(): Promise<HomePageReviewsResponseDto> {
    const [reviews, statistics, totalEndUsers] = await Promise.all([
      this.kmaRatingReviewRepository.findTopApprovedReviews(5),
      this.kmaRatingReviewRepository.getApprovedReviewsStatistics(),
      // Count total end users (active, non-blocked)
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.END_USER,
            isActive: true,
            isBlocked: false,
          },
        }),
    ]);

    const reviewItems: HomePageReviewItemDto[] = reviews.map((r) => {
      const profileImage = r.endUser?.profileImage ?? null;
      return {
        id: r.id,
        rating: r.rating,
        review: r.review,
        name: r.name,
        email: r.email,
        endUser: r.endUser
          ? {
              id: r.endUser.id,
              name: r.endUser.name,
              email: r.endUser.email,
              profileImage: r.endUser.profileImage,
            }
          : null,
        profileImage,
        createdAt: r.createdAt,
      };
    });

    return {
      success: true,
      reviews: reviewItems,
      statistics: {
        totalCount: statistics.totalCount,
        averageRating: statistics.averageRating,
        totalEndUsers,
      },
      trustedByText: 'Trusted By Client around the World',
    };
  }

  /**
   * Get home page data including About Us and statistics
   */
  async getHomePageData(): Promise<HomePageResponseDto> {
    // Get About Us data (latest entry)
    const aboutUsEntries = await this.aboutUsRepository.findAll();
    const aboutUs: AboutUsDataDto | null =
      aboutUsEntries.length > 0
        ? {
            heading: aboutUsEntries[0].heading,
            description: aboutUsEntries[0].description,
          }
        : null;

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get statistics in parallel
    const [
      totalOwners,
      totalChannelPartners,
      totalUsers,
      totalActiveProperties,
      propertiesListedLast24Hours,
    ] = await Promise.all([
      // Total Owners
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.OWNER,
            isActive: true,
            isBlocked: false,
          },
        }),
      // Total Channel Partners
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.CHANNEL_PARTNER,
            isActive: true,
            isBlocked: false,
          },
        }),
      // Total Users/Clients (end users only - active, non-blocked)
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.END_USER,
            isActive: true,
            isBlocked: false,
          },
        }),
      // Total Active Properties
      this.dataSource
        .getRepository(Property)
        .count({
          where: {
            status: PropertyStatus.ACTIVE,
            isDeleted: false,
          },
        }),
      // Properties listed in last 24 hours (active properties approved in last 24 hours)
      this.dataSource
        .getRepository(Property)
        .createQueryBuilder('property')
        .where('property.status = :status', { status: PropertyStatus.ACTIVE })
        .andWhere('property.activatedAt >= :date', { date: twentyFourHoursAgo })
        .andWhere('property.isDeleted = :isDeleted', { isDeleted: false })
        .getCount(),
    ]);

    return {
      success: true,
      aboutUs,
      statistics: {
        totalOwners,
        totalChannelPartners,
        totalUsers,
        totalActiveProperties,
        propertiesListedLast24Hours,
      },
    };
  }

  /**
   * Get property types with their active property counts for explore section
   */
  async getPropertyTypesExplore(
    query?: PropertyTypeExploreQueryDto,
  ): Promise<PropertyTypeExploreResponseDto> {
    const { cityId, propertyTypeId, listingTypeId } = query || {};

    // Get property types with filters
    let propertyTypes = await this.propertyTypeRepository.findAll();

    // Filter by listing type if provided
    if (listingTypeId) {
      propertyTypes = propertyTypes.filter(
        (pt) => pt.listingTypeId === listingTypeId,
      );
    }

    // Filter by specific property type if provided
    if (propertyTypeId) {
      propertyTypes = propertyTypes.filter((pt) => pt.id === propertyTypeId);
    }

    // Get property counts for each property type in parallel
    const propertyTypesWithCounts = await Promise.all(
      propertyTypes.map(async (propertyType) => {
        // Build where clause for property count
        const whereClause: any = {
          propertyTypeId: propertyType.id,
          status: PropertyStatus.ACTIVE,
          isDeleted: false,
        };

        // Add city filter if provided
        if (cityId) {
          whereClause.cityId = cityId;
        }

        // Add listing type filter if provided
        if (listingTypeId) {
          whereClause.listingTypeId = listingTypeId;
        }

        const propertyCount = await this.dataSource
          .getRepository(Property)
          .count({
            where: whereClause,
          });

        return {
          id: propertyType.id,
          name: propertyType.name,
          code: propertyType.code,
          propertyCount,
        };
      }),
    );

    // Filter out property types with 0 properties and sort by count descending
    const filteredAndSorted = propertyTypesWithCounts
      .filter((item) => item.propertyCount > 0)
      .sort((a, b) => b.propertyCount - a.propertyCount);

    return {
      success: true,
      propertyTypes: filteredAndSorted,
    };
  }

  async getAdminConfigurations(): Promise<EndUserConfigurationResponseDto> {
    const configuration = await this.adminConfigurationRepository.findOne();

    if (!configuration) {
      return {
        success: true,
        configuration: null,
      };
    }

    return {
      success: true,
      configuration: {
        id: configuration.id,
        mobileAppAvailable: configuration.mobileAppAvailable,
        description: configuration.description,
        phoneNumber: configuration.phoneNumber,
        email: configuration.email,
        address: configuration.address,
        latitude: configuration.latitude ? Number(configuration.latitude) : null,
        longitude: configuration.longitude ? Number(configuration.longitude) : null,
        instagramLink: configuration.instagramLink,
        fbLink: configuration.fbLink,
        youtubeLink: configuration.youtubeLink,
        twitterLink: configuration.twitterLink,
        createdAt: configuration.createdAt,
        updatedAt: configuration.updatedAt,
      },
    };
  }

  /**
   * Add property to favorites
   */
  async addFavoriteProperty(
    userId: string,
    dto: AddFavoritePropertyDto,
  ): Promise<FavoritePropertyResponseDto> {
    const { propertyId } = dto;

    // Check if property exists and is active
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new BadRequestException('Property not found');
    }

    if (property.status !== PropertyStatus.ACTIVE || property.isDeleted) {
      throw new BadRequestException('Property is not available');
    }

    // Check if already favorited
    const existing = await this.favoritePropertyRepository.findByUserAndProperty(
      userId,
      propertyId,
    );
    if (existing) {
      throw new BadRequestException('Property is already in favorites');
    }

    const favorite = await this.favoritePropertyRepository.create(
      userId,
      propertyId,
    );

    return {
      success: true,
      message: 'Property added to favorites successfully',
      favoriteId: favorite.id,
    };
  }

  /**
   * Remove property from favorites
   */
  async removeFavoriteProperty(
    userId: string,
    dto: RemoveFavoritePropertyDto,
  ): Promise<FavoritePropertyResponseDto> {
    const { propertyId } = dto;

    const deleted = await this.favoritePropertyRepository.delete(
      userId,
      propertyId,
    );

    if (!deleted) {
      throw new BadRequestException('Property is not in favorites');
    }

    return {
      success: true,
      message: 'Property removed from favorites successfully',
    };
  }

  /**
   * Get user's favorite properties
   */
  async getFavoriteProperties(
    userId: string,
    query: FavoritePropertyListQueryDto,
  ): Promise<FavoritePropertyListResponseDto> {
    const { page, limit } = query;

    const result = await this.favoritePropertyRepository.findByUserId(
      userId,
      page,
      limit,
    );

    // Map favorite properties to response DTO (reuse the same mapping logic as searchEndUserProperties)
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (favorite) => {
        const property = favorite.property;

        // Get primary image (cover image or first image) and all images
        let imageUrl: string | null = null;
        let images: EndUserPropertyImageDto[] | undefined = undefined;
        if (property.photos && property.photos.length > 0) {
          const coverImage = property.photos.find((p) => p.isCoverImage);
          const firstPhoto = property.photos[0];
          const selectedPhoto = coverImage || firstPhoto;
          imageUrl = selectedPhoto.fileKey || null;

          // Map all images
          images = property.photos.map((photo) => ({
            fileKey: photo.fileKey,
            view: photo.view,
            isCoverImage: photo.isCoverImage || false,
          }));
        }

        // Map all videos
        let videos: EndUserPropertyVideoDto[] | undefined = undefined;
        if (property.videos && property.videos.length > 0) {
          videos = property.videos.map((video) => ({
            fileKey: video.fileKey,
            format: video.format,
          }));
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

        // Build units array
        const units: EndUserPropertyUnitDto[] = [];
        if (property.bhkType?.name) {
          // Try to get builtUpAreaMetadata from relations if available
          const builtUpAreaMetadata = property.builtUpAreaMetadata || 
            (property as any).builtUpAreaMetadata;
          
          if (builtUpAreaMetadata) {
            const superBuiltUpArea = builtUpAreaMetadata.superBuiltUpArea
              ? `${builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
              : builtUpAreaMetadata.carpetArea
                ? `${builtUpAreaMetadata.carpetArea} Sq. Ft.`
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
        }

        return {
          id: property.id,
          propertyName,
          address,
          description: property.propertyDescription || undefined,
          imageUrl,
          images: images,
          videos: videos,
          imageCount: property.photos?.length || 0,
          videoCount: property.videos?.length || 0,
          isReraRegistered: false,
          constructionStatus: property.constructionStatus || null,
          category: property.category?.name || null,
          listingType: property.listingType?.name || null,
          propertyType: property.propertyType?.name || null,
          bhkType: property.bhkType?.name || null,
          plotArea: property.plotArea || null,
          plotAreaUnit: property.plotAreaUnit || null,
          facing: property.facing || null,
          furnishType: property.furnishType || null,
          price: property.price || null,
          monthlyRent: property.monthlyRent || null,
          city: property.city?.name || null,
          society: property.society?.name || null,
          locality: property.locality?.name || null,
          units: units.length > 0 ? units : undefined,
          owner: property.user
            ? {
                name: property.user.name,
                profileImage: property.user.profileImage,
                role: property.user.role,
              }
            : null,
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
   * Check if property is favorited by user
   */
  async checkFavoriteProperty(
    userId: string,
    propertyId: string,
  ): Promise<CheckFavoritePropertyResponseDto> {
    const isFavorite = await this.favoritePropertyRepository.isFavorite(
      userId,
      propertyId,
    );

    return {
      success: true,
      isFavorite,
    };
  }
}
