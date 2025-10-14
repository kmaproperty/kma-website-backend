/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import { User } from './entities/user.entity';
import { UserRole } from './enum/user-role.enum';
import {
  SendOtpDto,
  SendOtpResponseDto,
  ValidateOtpDto,
  ValidateOtpResponseDto,
  CreateOwnerDto,
  CreateOwnerResponseDto,
  CreateChannelPartnerDto,
  CreateChannelPartnerResponseDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly channelPartnerCodeRepository: ChannelPartnerCodeRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Send OTP to phone number
   */
  sendOtp(sendOtpDto: SendOtpDto): SendOtpResponseDto {
    const { phone } = sendOtpDto;

    // Generate JWT token with phone number and expiration
    const payload = {
      phone,
      type: 'otp_verification',
      timestamp: Date.now(),
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '10m', // OTP token expires in 10 minutes
    });

    // In production, integrate with SMS service
    // For now, we'll just log the OTP
    console.log(`OTP for ${phone}: 1234`);

    return {
      success: true,
      message: 'OTP sent successfully',
      token,
    };
  }

  /**
   * Validate OTP and create user if not exists
   */
  async validateOtp(
    validateOtpDto: ValidateOtpDto,
  ): Promise<ValidateOtpResponseDto> {
    const { token, otp, role } = validateOtpDto;

    // Validate OTP (static OTP is 1234)
    if (otp !== '1234') {
      throw new BadRequestException('Invalid OTP');
    }

    // Verify JWT token and extract phone number
    let phone: string;
    try {
      const decodedToken: {
        phone: string;
        type: string;
        timestamp: number;
      } = this.jwtService.verify(token);

      // Validate token type
      if (decodedToken.type !== 'otp_verification') {
        throw new BadRequestException('Invalid token type');
      }

      phone = decodedToken.phone;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Token has expired. Please request a new OTP.',
        );
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token');
      } else {
        throw new BadRequestException('Token verification failed');
      }
    }

    // Check if user exists
    const existingUser = await this.userRepository.findByPhone(phone);

    if (existingUser) {
      // User exists, update phone_verified flag and generate tokens
      await this.userRepository.update(existingUser.id, {
        phoneVerified: true,
      });

      // Generate JWT tokens for existing user
      const payload = {
        sub: existingUser.id,
        phone: existingUser.phone,
        role: existingUser.role,
        type: 'access_token',
      };

      const refreshPayload = {
        sub: existingUser.id,
        phone: existingUser.phone,
        role: existingUser.role,
        type: 'refresh_token',
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });
      const refreshToken = this.jwtService.sign(refreshPayload, {
        expiresIn: '7d',
      });

      // Update user with tokens
      await this.userRepository.update(existingUser.id, {
        token: accessToken,
        refreshToken: refreshToken,
      });

      return {
        success: true,
        message: 'OTP validated successfully',
        requiredOtherDetails: false,
        userId: existingUser.id,
        accessToken,
        refreshToken,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
          isActive: existingUser.isActive,
        },
      };
    } else {
      // User doesn't exist, create user with phone number and phone_verified = true
      const userData: Partial<User> = {
        phone,
        role: role || UserRole.OWNER, // Use provided role or default to OWNER
        isActive: true,
        phoneVerified: true, // Phone is verified through OTP
        name: null,
        email: null,
        intent: null,
      };

      const newUser = await this.userRepository.create(userData);

      // Generate JWT tokens for new user
      const payload = {
        sub: newUser.id,
        phone: newUser.phone,
        role: newUser.role,
        type: 'access_token',
      };

      const refreshPayload = {
        sub: newUser.id,
        phone: newUser.phone,
        role: newUser.role,
        type: 'refresh_token',
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });
      const refreshToken = this.jwtService.sign(refreshPayload, {
        expiresIn: '7d',
      });

      // Update user with tokens
      await this.userRepository.update(newUser.id, {
        token: accessToken,
        refreshToken: refreshToken,
      });

      return {
        success: true,
        message: `OTP validated successfully. User created with ${newUser.role} role.`,
        requiredOtherDetails: true,
        userId: newUser.id,
        accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          isActive: newUser.isActive,
        },
      };
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
    tokenData: { sub: string; phone: string; role: string; type: string },
  ): Promise<CreateOwnerResponseDto> {
    const { name, email, phone, intent } = createOwnerDto;

    // Verify phone number matches token
    if (tokenData.phone !== phone) {
      throw new BadRequestException('Phone number mismatch');
    }

    // Find user by phone
    const existingUser = await this.userRepository.findByPhone(phone);
    if (!existingUser) {
      throw new BadRequestException('User not found. Please verify OTP first.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (tokenData.role !== UserRole.OWNER) {
      throw new BadRequestException(
        'User is not authorized to create OWNER account.',
      );
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(
        'Phone number is not verified. Please verify OTP first.',
      );
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
    });

    if (!updatedUser) {
      throw new BadRequestException('Failed to update user');
    }

    return {
      success: true,
      message: 'Owner account created successfully',
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
   * Create CHANNEL_PARTNER account
   */
  async createChannelPartner(
    createChannelPartnerDto: CreateChannelPartnerDto,
    tokenData: { sub: string; phone: string; role: string; type: string },
  ): Promise<CreateChannelPartnerResponseDto> {
    const {
      name,
      email,
      phone,
      channelPartnerCode,
      experience,
      state,
      city,
      aboutYourSelf,
      intent,
    } = createChannelPartnerDto;

    // Verify phone number matches token
    if (tokenData.phone !== phone) {
      throw new BadRequestException('Phone number mismatch');
    }

    // Find user by phone
    const existingUser = await this.userRepository.findByPhone(phone);
    if (!existingUser) {
      throw new BadRequestException('User not found. Please verify OTP first.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (tokenData.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException(
        'User is not authorized to create CHANNEL_PARTNER account.',
      );
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(
        'Phone number is not verified. Please verify OTP first.',
      );
    }

    // Validate channel partner code
    const validCode =
      await this.channelPartnerCodeRepository.findByCode(channelPartnerCode);
    if (!validCode) {
      throw new BadRequestException(
        'Invalid channel partner code. Please provide a valid code.',
      );
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

    // Update user with CHANNEL_PARTNER details
    const updatedUser = await this.userRepository.update(existingUser.id, {
      name,
      email: email || null,
      role: UserRole.CHANNEL_PARTNER,
      channelPartnerCode,
      experience,
      state,
      city,
      aboutYourSelf: aboutYourSelf || null,
      intent: intent || null,
    });

    if (!updatedUser) {
      throw new BadRequestException('Failed to update user');
    }

    return {
      success: true,
      message: 'Channel partner account created successfully',
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
}
