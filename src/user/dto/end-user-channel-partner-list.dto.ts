import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { EndUserPropertyListItemDto } from './end-user-properties-search.dto';

export class EndUserChannelPartnerListQueryDto {
  @ApiPropertyOptional({
    description: 'Search by channel partner name or firm name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum years of experience',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experience?: number;

  @ApiPropertyOptional({
    description: 'Filter by city name',
    example: 'Delhi',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by number of properties range',
    example: '1-5',
    enum: ['1-5', '5-10', '10-15', '15-20', '20-30', '30-50', '50+'],
  })
  @IsOptional()
  @IsIn(['1-5', '5-10', '10-15', '15-20', '20-30', '30-50', '50+'])
  properties?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class ChannelPartnerListItemDto {
  @ApiProperty({
    description: 'Channel partner user ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Channel partner name',
    example: 'John Doe',
  })
  name: string | null;

  @ApiProperty({
    description: 'Firm name',
    example: 'ABC Realty',
    nullable: true,
  })
  firm_name: string | null;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_image: string | null;

  @ApiProperty({
    description: 'Cities where the channel partner operates',
    example: 'Delhi, Mumbai',
    nullable: true,
  })
  cities: string | null;

  @ApiProperty({
    description: 'Years of experience (calculated from business_since)',
    example: 5,
    nullable: true,
  })
  experience_years: number | null;

  @ApiProperty({
    description: 'Number of properties listed',
    example: 10,
  })
  property_count: number;
}

export class EndUserChannelPartnerListResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'List of channel partners',
    type: [ChannelPartnerListItemDto],
  })
  data: ChannelPartnerListItemDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      page: 1,
      limit: 10,
      total: 50,
      totalPages: 5,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ChannelPartnerStatisticsDto {
  @ApiProperty({
    description: 'Number of buyers served (total leads)',
    example: 500,
  })
  buyers_served: number;

  @ApiProperty({
    description: 'Years of experience (calculated from business_since)',
    example: 21,
    nullable: true,
  })
  years_of_experience: number | null;

  @ApiProperty({
    description: 'Number of property holdings (total properties)',
    example: 44,
  })
  property_holdings: number;

  @ApiProperty({
    description: 'Number of active properties (approved and not deleted)',
    example: 40,
  })
  active_properties: number;

  @ApiProperty({
    description: 'Team size (not available in database)',
    example: null,
    nullable: true,
  })
  team_size: number | null;

  @ApiProperty({
    description: 'Number of areas of operation (unique cities)',
    example: 20,
  })
  areas_of_operation: number;
}

export class EndUserChannelPartnerDetailsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Channel partner ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Channel partner name',
    example: 'Manjeet Skyzen Homes',
  })
  name: string | null;

  @ApiProperty({
    description: 'Firm name',
    example: 'Vijay Real Estate',
    nullable: true,
  })
  firm_name: string | null;

  @ApiProperty({
    description: 'Channel partner code',
    example: 'CP123456',
    nullable: true,
  })
  channel_partner_code: string | null;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_image: string | null;

  @ApiProperty({
    description: 'Account created date',
    example: '2023-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Phone number',
    example: '9876543210',
  })
  phone: string;

  @ApiProperty({
    description: 'Email address',
    example: 'contact@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'About/Description',
    example: 'Vijay Real Estate is an accomplished real estate firm...',
    nullable: true,
  })
  about: string | null;

  @ApiProperty({
    description: 'Cities/Areas of operation (comma-separated)',
    example: 'Delhi, Mumbai, Noida',
    nullable: true,
  })
  cities: string | null;

  @ApiProperty({
    description: 'Business since date (trusted since)',
    example: '2003-01-01',
    nullable: true,
  })
  trusted_since: string | null;

  @ApiProperty({
    description: 'Statistics',
    type: ChannelPartnerStatisticsDto,
  })
  statistics: ChannelPartnerStatisticsDto;

  @ApiProperty({
    description: 'Areas of operation (parsed cities as array)',
    example: ['Delhi', 'Mumbai', 'Noida'],
    type: [String],
  })
  areas_of_operation_list: string[];

  @ApiProperty({
    description: 'Active properties categorized by Buy, Rent, and Commercial',
    example: {
      buy: [],
      rent: [],
      commercial: [],
    },
  })
  active_properties: {
    buy: EndUserPropertyListItemDto[];
    rent: EndUserPropertyListItemDto[];
    commercial: EndUserPropertyListItemDto[];
  };
}

