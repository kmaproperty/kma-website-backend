import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class ValidateOtpDto {
  @ApiProperty({
    description: 'Phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code to validate',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  otp: string;

  @ApiProperty({
    description: 'User role for account creation/login. Options: OWNER, CHANNEL_PARTNER, END_USER. Required to identify which account to create/login.',
    example: 'END_USER',
    enum: UserRole,
    required: true,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  @IsNotEmpty()
  role: UserRole;
}

export class ValidateOtpResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'OTP validated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether user needs to provide additional details',
    example: true,
  })
  requiredOtherDetails: boolean;

  @ApiProperty({
    description: 'User ID if user exists',
    example: 'uuid-string',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accessToken?: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Indicates if the owner has reached the maximum allowed listings',
    example: false,
  })
  hasReachedListingLimit: boolean;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: 'OWNER',
      isActive: true,
    },
    required: false,
  })
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
  };
}
