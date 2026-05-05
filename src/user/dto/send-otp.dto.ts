import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number to send OTP',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'User role for signup/login. For login: Do not pass role for OWNER/CHANNEL_PARTNER (API auto-detects), required for END_USER. For signup: optional (defaults to END_USER)',
    example: 'END_USER',
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  @IsOptional()
  role?: UserRole;
}

export class SendOtpResponseDto {
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
}
