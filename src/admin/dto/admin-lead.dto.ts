import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsNotEmpty,
  Min,
  Max,
  ArrayMinSize,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { LeadBuildingType, LeadStatus } from '../entities/lead.entity';

export class AdminLeadListQueryDto {
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
    description: 'Minimum budget',
    example: 4000000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum budget',
    example: 10000000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({
    description: 'Minimum size in sq.ft',
    example: 1000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum size in sq.ft',
    example: 2000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
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
    description: 'Filter by property types (array)',
    example: ['Villa', 'Apartment'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyTypes?: string[];

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: LeadStatus,
    example: LeadStatus.NEW,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Filter by time period: all, new, this_month, last_month',
    example: 'all',
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'new', 'this_month', 'last_month'])
  timeFilter?: string;
}

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Minimum budget',
    example: 4000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum budget',
    example: 6000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({
    description: 'Minimum size in sq.ft',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum size in sq.ft',
    example: 2000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeMax?: number;

  @ApiPropertyOptional({
    description: 'Building type',
    enum: LeadBuildingType,
    example: LeadBuildingType.RESIDENTIAL,
  })
  @IsOptional()
  @IsEnum(LeadBuildingType)
  buildingType?: LeadBuildingType;

  @ApiPropertyOptional({
    description: 'Property types',
    example: ['Villa', 'Apartment', 'Plot'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyTypes?: string[];

  @ApiPropertyOptional({
    description: 'Locations',
    example: ['Sector 70A', 'Sector 15'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];
}

export class UpdateLeadDto {
  @ApiPropertyOptional({
    description: 'Lead name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Minimum budget',
    example: 4000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum budget',
    example: 6000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({
    description: 'Minimum size in sq.ft',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum size in sq.ft',
    example: 2000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeMax?: number;

  @ApiPropertyOptional({
    description: 'Building type',
    enum: LeadBuildingType,
    example: LeadBuildingType.RESIDENTIAL,
  })
  @IsOptional()
  @IsEnum(LeadBuildingType)
  buildingType?: LeadBuildingType;

  @ApiPropertyOptional({
    description: 'Property types',
    example: ['Villa', 'Apartment'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyTypes?: string[];

  @ApiPropertyOptional({
    description: 'Locations',
    example: ['Sector 70A'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @ApiPropertyOptional({
    description: 'Lead status',
    enum: LeadStatus,
    example: LeadStatus.CONTACTED,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}

export class AddLeadNoteDto {
  @ApiProperty({
    description: 'Note content',
    example: 'Customer showed interest in 3 BHK properties',
  })
  @IsString()
  @IsNotEmpty()
  note: string;
}

export class UpdateLeadStatusDto {
  @ApiProperty({
    description: 'New lead status',
    enum: LeadStatus,
    example: LeadStatus.CONTACTED,
  })
  @IsEnum(LeadStatus)
  @IsNotEmpty()
  status: LeadStatus;
}

export class LeadPropertyContactDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'uuid-string',
  })
  @IsString()
  @IsNotEmpty()
  propertyId: string;
}

export class LeadNoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  createdByAdminId?: string | null;
}

export class LeadPropertyContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyId: string;

  @ApiPropertyOptional()
  property?: {
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

export class LeadResponseDto {
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

  @ApiPropertyOptional({ type: [LeadNoteResponseDto] })
  notes?: LeadNoteResponseDto[];

  @ApiPropertyOptional({ type: [LeadPropertyContactResponseDto] })
  propertyContacts?: LeadPropertyContactResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminLeadListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of leads',
    type: [LeadResponseDto],
  })
  data: LeadResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiPropertyOptional()
  statusCounts?: Record<string, number>;
}

