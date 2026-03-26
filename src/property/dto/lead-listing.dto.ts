import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { LeadStatus, LeadBuildingType } from '../../admin/entities/lead.entity';

export class UserLeadListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by lead name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by property ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: LeadStatus,
    example: LeadStatus.CONTACTED,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Time filter for tabs: new (last 24h), this_month, last_month',
    example: 'new',
    enum: ['new', 'this_month', 'last_month'],
  })
  @IsOptional()
  @IsString()
  timeFilter?: string;

  @ApiPropertyOptional({
    description: 'Minimum budget filter',
    example: 4000000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum budget filter',
    example: 10000000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @ApiPropertyOptional({
    description: 'Minimum size filter (sq ft)',
    example: 500,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  sizeMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum size filter (sq ft)',
    example: 2000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  sizeMax?: number;

  @ApiPropertyOptional({
    description: 'Filter by building type',
    enum: LeadBuildingType,
    example: LeadBuildingType.RESIDENTIAL,
  })
  @IsOptional()
  @IsEnum(LeadBuildingType)
  buildingType?: LeadBuildingType;

  @ApiPropertyOptional({
    description: 'Filter by locality (search within locations array)',
    example: 'Sector 48',
  })
  @IsOptional()
  @IsString()
  locality?: string;
}

export class UserLeadPropertyContactDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  property: {
    id: string;
    title?: string;
    price?: number;
    monthlyRent?: number;
    area?: number;
    areaUnit?: string;
    bhkTypeName?: string;
    societyName?: string;
    localityName?: string;
  };

  @ApiProperty()
  contactedAt: Date | null;
}

export class UserLeadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  budgetMin?: number | null;

  @ApiPropertyOptional()
  budgetMax?: number | null;

  @ApiPropertyOptional()
  sizeMin?: number | null;

  @ApiPropertyOptional()
  sizeMax?: number | null;

  @ApiPropertyOptional()
  buildingType?: LeadBuildingType | null;

  @ApiPropertyOptional()
  propertyTypes?: string[] | null;

  @ApiPropertyOptional()
  locations?: string[] | null;

  @ApiProperty()
  status: LeadStatus;

  @ApiPropertyOptional()
  lastContactedAt?: Date | null;

  @ApiProperty()
  propertiesContactedCount: number;

  @ApiProperty({ type: [UserLeadPropertyContactDto] })
  propertyContacts: UserLeadPropertyContactDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserLeadListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of leads',
    type: [UserLeadResponseDto],
  })
  data: UserLeadResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiPropertyOptional({
    description: 'Tab counts for filtering',
    example: { all: 100, new: 5, this_month: 25, last_month: 30 },
  })
  tabCounts?: {
    all: number;
    new: number;
    this_month: number;
    last_month: number;
  };
}

