import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      role: 'OWNER',
      isActive: true,
      phoneVerified: true,
      city: 'Mumbai',
      channelPartnerCode: null,
      firmName: null,
      businessSince: null,
      cities: null,
      aboutYourSelf: null,
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
    city: string | null;
    channelPartnerCode: string | null;
    firmName: string | null;
    businessSince: string | null;
    cities: string | null;
    aboutYourSelf: string | null;
    profileImage: string | null;
  };
}

export class UserEditProfileDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'City where the owner operates (for OWNER role)',
    example: 'Mumbai',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Channel partner code (for CHANNEL_PARTNER role)',
    example: 'CP123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  channelPartnerCode?: string;

  @ApiProperty({
    description: 'Firm name (for CHANNEL_PARTNER role)',
    example: 'Acme Realty',
    required: false,
  })
  @IsString()
  @IsOptional()
  firmName?: string;

  @ApiProperty({
    description: 'Business operating since (for CHANNEL_PARTNER role, date in ISO format YYYY-MM-DD)',
    example: '2018-06-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  businessSince?: string;

  @ApiProperty({
    description: 'Cities covered (for CHANNEL_PARTNER role, comma separated)',
    example: 'Delhi, Noida, Gurugram',
    required: false,
  })
  @IsString()
  @IsOptional()
  cities?: string;

  @ApiProperty({
    description: 'About yourself (for CHANNEL_PARTNER role)',
    example: 'Experienced real estate professional with 5+ years in the industry',
    required: false,
  })
  @IsString()
  @IsOptional()
  aboutYourSelf?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}

export class UserEditProfileResponseDto {
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
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      role: 'OWNER',
      isActive: true,
      city: 'Mumbai',
      channelPartnerCode: null,
      firmName: null,
      businessSince: null,
      cities: null,
      aboutYourSelf: null,
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
    city: string | null;
    channelPartnerCode: string | null;
    firmName: string | null;
    businessSince: string | null;
    cities: string | null;
    aboutYourSelf: string | null;
    profileImage: string | null;
  };
}

