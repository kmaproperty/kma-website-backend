import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  Matches,
  IsOptional,
  IsEnum,
  IsDateString,
  Length,
} from 'class-validator';
import { UserIntent } from '../enum/user-intent.enum';

export class UpgradeToChannelPartnerDto {
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
    description: 'Channel partner phone number',
    example: '9876543210',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone?: string;

  @ApiProperty({ 
    description: 'Valid channel partner code', 
    example: 'CP123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(3, 50)
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

export class UpgradeToChannelPartnerResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Upgraded to CHANNEL_PARTNER successfully' })
  message: string;

  @ApiProperty({ example: 'CP-ABC1234', required: false })
  channelPartnerCode?: string;
}


