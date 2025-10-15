import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number to send OTP',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phone: string;
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

  @ApiProperty({
    description: 'OTP code',
    example: '1234',
  })
  otp: string;
}
