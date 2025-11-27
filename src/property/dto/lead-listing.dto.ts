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
}

