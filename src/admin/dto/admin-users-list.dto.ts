import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UserRole } from '../../user/enum/user-role.enum';

export class AdminOwnerListQueryDto {
  @ApiPropertyOptional({
    description: 'Search users by name, phone, or email (case insensitive)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: [UserRole.OWNER, UserRole.CHANNEL_PARTNER, UserRole.END_USER],
    example: UserRole.OWNER,
  })
  @IsOptional()
  @IsString()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (max 100)',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AdminOwnerResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  name: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiPropertyOptional({ nullable: true })
  intent: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminChannelPartnerResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  name: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiProperty()
  isAgreementCompleted: boolean;

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

  @ApiPropertyOptional({ nullable: true })
  intent: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// Unified user response DTO that includes all possible fields
export class AdminUsersListResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  name: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiPropertyOptional({ nullable: true })
  intent: string | null;

  // Channel Partner specific fields (optional)
  @ApiPropertyOptional({ nullable: true })
  isAgreementCompleted?: boolean;

  @ApiPropertyOptional({ nullable: true })
  channelPartnerCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  firmName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  cities?: string | null;

  @ApiPropertyOptional({ nullable: true })
  businessSince?: string | null;

  @ApiPropertyOptional({ nullable: true })
  aboutYourSelf?: string | null;

  @ApiPropertyOptional({ nullable: true })
  profileImage?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Years of experience (calculated from businessSince)' })
  experience?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Number of sale properties' })
  soldProperties?: number;

  @ApiPropertyOptional({ nullable: true, description: 'Number of rent properties' })
  rentedProperties?: number;

  @ApiPropertyOptional({ nullable: true, description: 'KYC completed status' })
  kycCompleted?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ChannelPartnerSummaryDto {
  @ApiProperty()
  totalPartners: number;

  @ApiProperty()
  activePartners: number;

  @ApiProperty()
  verifiedPartners: number;

  @ApiProperty()
  kycCompletedPartners: number;
}

export class AdminOwnerListResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiPropertyOptional({ description: 'Channel partner summary counts (only when role=CHANNEL_PARTNER)' })
  summary?: ChannelPartnerSummaryDto;
}
