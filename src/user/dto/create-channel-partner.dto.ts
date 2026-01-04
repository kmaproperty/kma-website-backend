import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  IsOptional,
  IsEnum,
  IsDateString,
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
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
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
    description: 'Firm name',
    example: 'Acme Realty',
  })
  @IsString()
  @IsNotEmpty()
  firmName: string;

  @ApiProperty({
    description: 'Business operating since (date in ISO format YYYY-MM-DD)',
    example: '2018-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  businessSince: string;

  @ApiProperty({
    description: 'Cities covered (comma separated)',
    example: 'Delhi, Noida, Gurugram',
  })
  @IsString()
  @IsNotEmpty()
  cities: string;

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

  @ApiProperty({
    description: 'Profile photo URL',
    example: 'https://example.com/profile-photo.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePhotoUrl?: string;
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
