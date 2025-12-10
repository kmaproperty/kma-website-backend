import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class AdminEditUserDto {
  @ApiPropertyOptional({
    description: 'User name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'User email',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Firm name (for channel partners)',
    example: 'ABC Realty',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firmName?: string;

  @ApiPropertyOptional({
    description: 'Cities (for channel partners)',
    example: 'Delhi, Mumbai',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cities?: string;

  @ApiPropertyOptional({
    description: 'Business since date (for channel partners)',
    example: '2020-01-01',
  })
  @IsOptional()
  @IsString()
  businessSince?: string;

  @ApiPropertyOptional({
    description: 'About yourself (for channel partners)',
    example: 'Experienced real estate agent',
  })
  @IsOptional()
  @IsString()
  aboutYourSelf?: string;

  @ApiPropertyOptional({
    description: 'Set user active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Set phone verified status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;
}

export class AdminUserDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  name: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiPropertyOptional({ nullable: true })
  intent: string | null;

  @ApiPropertyOptional({ nullable: true })
  channelPartnerCode: string | null;

  @ApiPropertyOptional({ nullable: true })
  firmName: string | null;

  @ApiPropertyOptional({ nullable: true })
  cities: string | null;

  @ApiPropertyOptional({ nullable: true })
  businessSince: string | null;

  @ApiPropertyOptional({ nullable: true })
  aboutYourSelf: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminBlockUserResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  isBlocked: boolean;
}

export class AdminUnblockUserResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  isBlocked: boolean;
}

export class AdminEditUserResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AdminUserDetailResponseDto })
  data: AdminUserDetailResponseDto;
}

