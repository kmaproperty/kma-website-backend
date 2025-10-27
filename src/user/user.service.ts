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
  ResendOtpDto,
  ResendOtpResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
} from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly ACCESS_TOKEN_EXPIRY = '24h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly channelPartnerCodeRepository: ChannelPartnerCodeRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
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

      // Check if user exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { phone },
      });

      let user: User;
      let isNewUser = false;

      if (existingUser) {
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
        // User doesn't exist, create user with phone number and phone_verified = true
        const userData: Partial<User> = {
          phone,
          role: role || UserRole.OWNER,
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
    const { name, email, phone, intent, city } = createOwnerDto;

    // Verify phone number matches token
    if (tokenData.phone !== phone) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NUMBER_MISMATCH);
    }

    // Find user by phone
    const existingUser = await this.userRepository.findByPhone(phone);
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

    // Find user by phone
    const existingUser = await this.userRepository.findByPhone(phone);
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
}
