import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpContactPropertyDto {
  @ApiProperty({
    description: 'Phone number to send OTP (10 digits, without country code)',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;
}

export class SendOtpContactPropertyResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'OTP sent successfully' })
  message: string;

  @ApiPropertyOptional({
    description: 'OTP code (only in development)',
    example: '1234',
  })
  otp?: string;
}

export class SubmitContactPropertyDto {
  @ApiProperty({ description: 'Name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Email address (optional)', example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Phone number (10 digits)',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Country code for phone (e.g. +91)',
    example: '+91',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'OTP code (required for non-logged-in users; get via POST .../contact/send-otp)',
    example: '1234',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'OTP must be exactly 4 digits' })
  otp?: string;
}

export class SubmitContactPropertyResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Contact request submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created contacted property record ID',
    example: 'uuid-string',
  })
  contactedPropertyId: string;

  @ApiPropertyOptional({
    description:
      'Access token issued when a non-logged-in user verifies OTP. Present only when the caller was anonymous and the phone now maps to an END_USER account (created on the fly if needed).',
  })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Refresh token paired with accessToken.' })
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'User object issued with the tokens (same shape as login).',
  })
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
  };
}
