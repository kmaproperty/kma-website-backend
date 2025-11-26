import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class AdminCityListQueryDto {
  @ApiPropertyOptional({
    description: 'Search cities by name (case insensitive)',
    example: 'Delhi',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AdminCityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional({ nullable: true })
  state: string | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  latitude: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  longitude: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminCreateCityDto {
  @ApiProperty({
    description: 'City display name',
    example: 'Gurgaon',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Unique city code (used for lookups)',
    example: 'gurgaon',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional({
    description: 'State name',
    example: 'Haryana',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 28.4595,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: 77.0266,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class AdminUpdateCityDto extends PartialType(AdminCreateCityDto) {}

export class AdminSocietyListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter societies by city id',
    example: '1f8b0e9e-8d6c-4d1f-8e6e-3858c5c2e6c4',
  })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Search societies by name or locality',
    example: 'DLF Phase',
  })
  @IsOptional()
  @IsString()
  search?: string;

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

export class AdminSocietyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cityId: string;

  @ApiPropertyOptional({ nullable: true })
  localityName: string | null;

  @ApiPropertyOptional({ nullable: true })
  address: string | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  latitude: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  longitude: number | null;

  @ApiPropertyOptional({ nullable: true })
  pincode: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional({ nullable: true })
  createdByUserId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'City details for quick reference',
    nullable: true,
    type: () => CitySummary,
  })
  city?: CitySummary | null;
}

export class CitySummary {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class AdminCreateSocietyDto {
  @ApiProperty({
    description: 'Society name',
    example: 'DLF Phase 4',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiProperty({
    description: 'City ID the society belongs to',
    example: '1f8b0e9e-8d6c-4d1f-8e6e-3858c5c2e6c4',
  })
  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @ApiPropertyOptional({
    description: 'Locality name (Sector/Phase etc.)',
    example: 'Phase 4',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  localityName?: string;

  @ApiPropertyOptional({
    description: 'Street address',
    example: 'Golf Course Road, Gurgaon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Pincode', example: '122002' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  pincode?: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 28.4700,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 77.0800,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Mark society as verified',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class AdminUpdateSocietyDto extends PartialType(AdminCreateSocietyDto) {}


