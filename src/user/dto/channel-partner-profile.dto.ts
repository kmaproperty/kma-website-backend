import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserIntent } from '../enum/user-intent.enum';

export class ChannelPartnerProfileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543210',
      role: 'CHANNEL_PARTNER',
      isActive: true,
      phoneVerified: true,
      channelPartnerCode: 'CP123456',
      firmName: 'Acme Realty',
      businessSince: '2018-06-15',
      cities: 'Delhi, Noida, Gurugram',
      aboutYourSelf: 'Experienced real estate professional',
      intent: 'SELL',
      profileImage: 'https://example.com/profile.jpg',
    },
  })
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
    phoneVerified: boolean;
    channelPartnerCode: string | null;
    firmName: string | null;
    businessSince: string | null;
    cities: string | null;
    aboutYourSelf: string | null;
    intent: UserIntent | null;
    profileImage: string | null;
  };
}

export class ChannelPartnerEditProfileDto {
  @ApiProperty({
    description: 'Channel partner name',
    example: 'Jane Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Channel partner email address',
    example: 'jane@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Channel partner code',
    example: 'CP123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  channelPartnerCode?: string;

  @ApiProperty({
    description: 'Firm name',
    example: 'Acme Realty',
    required: false,
  })
  @IsString()
  @IsOptional()
  firmName?: string;

  @ApiProperty({
    description: 'Business operating since (date in ISO format YYYY-MM-DD)',
    example: '2018-06-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  businessSince?: string;

  @ApiProperty({
    description: 'Cities covered (comma separated)',
    example: 'Delhi, Noida, Gurugram',
    required: false,
  })
  @IsString()
  @IsOptional()
  cities?: string;

  @ApiProperty({
    description: 'About yourself',
    example: 'Experienced real estate professional with 5+ years in the industry',
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
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}

export class ChannelPartnerEditProfileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Profile updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user information',
    example: {
      id: 'uuid-string',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543210',
      role: 'CHANNEL_PARTNER',
      isActive: true,
      channelPartnerCode: 'CP123456',
      firmName: 'Acme Realty',
      businessSince: '2018-06-15',
      cities: 'Delhi, Noida, Gurugram',
      aboutYourSelf: 'Experienced real estate professional',
      intent: 'SELL',
      profileImage: 'https://example.com/profile.jpg',
    },
  })
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
    channelPartnerCode: string | null;
    firmName: string | null;
    businessSince: string | null;
    cities: string | null;
    aboutYourSelf: string | null;
    intent: UserIntent | null;
    profileImage: string | null;
  };
}

