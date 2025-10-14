import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserIntent } from '../enum/user-intent.enum';

export class CreateChannelPartnerDto {
  @ApiProperty({
    description: 'Channel partner name',
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Channel partner email address',
    example: 'jane@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Channel partner phone number',
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
    description: 'Channel partner code',
    example: 'CP123456',
  })
  @IsString()
  @IsNotEmpty()
  channelPartnerCode: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  experience: number;

  @ApiProperty({
    description: 'State',
    example: 'California',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'City',
    example: 'Los Angeles',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'About yourself (optional)',
    example:
      'Experienced real estate professional with 5+ years in the industry',
    required: false,
  })
  @IsString()
  @IsOptional()
  aboutYourSelf?: string;

  @ApiProperty({
    description: 'User intent (SELL or RENT)',
    example: 'SELL',
    enum: UserIntent,
    required: false,
  })
  @IsEnum(UserIntent, { message: 'Intent must be either SELL or RENT' })
  @IsOptional()
  intent?: UserIntent;
}

export class CreateChannelPartnerResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Channel partner account created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User ID',
    example: 'uuid-string',
  })
  userId: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567890',
      role: 'CHANNEL_PARTNER',
      isActive: true,
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}
