import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be a valid international format (e.g., +1234567890)',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code for login verification',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, {
    message: 'OTP must be exactly 4 digits',
  })
  otp: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

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
  })
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
  };
}
