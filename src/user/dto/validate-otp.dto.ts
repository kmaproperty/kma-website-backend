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
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
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

  @ApiPropertyOptional({
    description: 'User role for account creation',
    example: 'OWNER',
    enum: UserRole,
    required: false,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  @IsOptional()
  role?: UserRole;
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
