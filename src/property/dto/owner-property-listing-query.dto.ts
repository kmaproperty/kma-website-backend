import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function parseCsv(value?: string | string[]): string[] | undefined {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return undefined;
}

export enum OwnerPropertySortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  UPDATED_AT = 'updatedAt',
  EXPIRES_AT = 'expiresAt',
}

export enum OwnerPropertySortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum OwnerPropertyFilter {
  ALL = 'all',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RECENTLY_EXPIRED = 'recently_expired',
}

export class OwnerPropertyListingQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by property category IDs (comma separated)',
    example: 'uuid-category-1,uuid-category-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by property type IDs (comma separated)',
    example: 'uuid-property-type-1,uuid-property-type-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  propertyTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by listing type IDs (comma separated)',
    example: 'uuid-listing-type-1',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  listingTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by furnishing type (comma separated, e.g., Furnished, Semi-Furnished)',
    example: 'Furnished,Semi-Furnished',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  furnishingTypes?: string[];

  @ApiPropertyOptional({
    description: 'Filter by project (construction) status (comma separated)',
    example: 'ready_to_move,under_construction',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  projectStatuses?: string[];

  @ApiPropertyOptional({
    description:
      'Filter by property status (comma separated, e.g., draft,pending_review,active,rejected,deactivated)',
    example: 'pending_review,active',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  statuses?: string[];

  @ApiPropertyOptional({
    description: 'Filter by listing status: active, expired, deactivated (comma separated)',
    example: 'active,expired',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  listingStatuses?: string[];

  @ApiPropertyOptional({
    description: 'Filter by verification status: verified, unverified (comma separated)',
    example: 'verified',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  verificationStatuses?: string[];

  @ApiPropertyOptional({
    description: 'Quick filter option: all (all listings), pending (draft state), under_review (pending_review status), recently_expired (expired active properties)',
    example: 'pending',
    enum: OwnerPropertyFilter,
  })
  @IsOptional()
  @IsEnum(OwnerPropertyFilter)
  filter?: OwnerPropertyFilter;

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: 5000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Free text search (currently supports property ID)',
    example: '17840748',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field: createdAt (Last Added), price (Price), updatedAt, expiresAt (Expiry Date)',
    enum: OwnerPropertySortBy,
    default: OwnerPropertySortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(OwnerPropertySortBy)
  sortBy: OwnerPropertySortBy = OwnerPropertySortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: OwnerPropertySortOrder,
    default: OwnerPropertySortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(OwnerPropertySortOrder)
  sortOrder: OwnerPropertySortOrder = OwnerPropertySortOrder.DESC;
}

