import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpForContactUsDto {
  @ApiProperty({
    description: 'Phone number to send OTP for contact us verification',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;
}

export class SendOtpForContactUsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'OTP sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'OTP code (only in development)',
    example: '1234',
    required: false,
  })
  otp?: string;
}

export class SubmitContactUsDto {
  @ApiProperty({
    description: 'Name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
    description: 'Email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'OTP code for verification (required for non-logged in users)',
    example: '1234',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'OTP must be exactly 4 digits',
  })
  otp?: string;
}

export class ContactUsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Contact us query submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created contact us query ID',
    example: 'uuid-string',
  })
  contactUsQueryId: string;
}

