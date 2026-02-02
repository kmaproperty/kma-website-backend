import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

function parseCsv(value: string): string[] {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export enum EndUserPropertiesSortBy {
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum EndUserPropertiesSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class EndUserPropertiesSearchQueryDto {
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
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'City ID to filter properties',
    example: 'uuid-city-id',
  })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Search by property name, locality, or builder',
    example: 'DLF Valley',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by property category IDs (comma separated) - Residential/Commercial',
    example: 'uuid-category-1,uuid-category-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by listing type IDs (comma separated) - Sale/Rent',
    example: 'uuid-listing-type-1,uuid-listing-type-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  listingTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by property type IDs (comma separated) - Villa, Plot, Apartment, etc.',
    example: 'uuid-property-type-1,uuid-property-type-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  propertyTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by BHK type IDs (comma separated)',
    example: 'uuid-bhk-1,uuid-bhk-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  bhkTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by furnishing type (comma separated)',
    example: 'Unfurnished,Fully Furnished',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  furnishingTypes?: string[];

  @ApiPropertyOptional({
    description: 'Filter by construction status (comma separated) - ready_to_move,under_construction',
    example: 'ready_to_move,under_construction',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  constructionStatuses?: string[];

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: 10000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Latitude for location-based search (Near Me)',
    example: 28.6139,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for location-based search (Near Me)',
    example: 77.2090,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Radius in kilometers for location-based search',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radius?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: EndUserPropertiesSortBy,
    default: EndUserPropertiesSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(EndUserPropertiesSortBy)
  sortBy: EndUserPropertiesSortBy = EndUserPropertiesSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: EndUserPropertiesSortOrder,
    default: EndUserPropertiesSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(EndUserPropertiesSortOrder)
  sortOrder: EndUserPropertiesSortOrder = EndUserPropertiesSortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Filter by posted by user role (comma separated) - OWNER, CHANNEL_PARTNER, or ALL to get all properties',
    example: 'OWNER,CHANNEL_PARTNER',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  postedBy?: string[];

  @ApiPropertyOptional({
    description:
      'Session ID for anonymous users. When provided with search/filters, the search is recorded in search_history. Can also be sent via X-Session-Id header.',
    example: 'a1b2c3d4e5f6789012345678abcdef01',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

// Response DTOs
export class EndUserPropertyUnitDto {
  @ApiProperty({
    description: 'Unit type',
    example: '2 BHK 1475 Sq. Ft. Apartment',
  })
  unit: string;

  @ApiProperty({
    description: 'Size in square feet',
    example: '1475 Sq. Ft. (Saleable)',
  })
  size: string;

  @ApiProperty({
    description: 'Price or "Price On Request"',
    example: 'Price On Request',
  })
  price: string;
}

export class EndUserPropertyImageDto {
  @ApiProperty({
    description: 'Image file key/URL',
    example: 'https://example.com/property-image.jpg',
  })
  fileKey: string;

  @ApiProperty({
    description: 'Image view type',
    example: 'exterior',
  })
  view: string;

  @ApiProperty({
    description: 'Is this the cover image',
    example: true,
    required: false,
  })
  isCoverImage?: boolean;
}

export class EndUserPropertyVideoDto {
  @ApiProperty({
    description: 'Video file key/URL',
    example: 'https://example.com/property-video.mp4',
  })
  fileKey: string;

  @ApiProperty({
    description: 'Video format',
    example: 'mp4',
  })
  format: string;
}

export class EndUserPropertyListItemDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Property name', example: 'DLF Valley' })
  propertyName: string;

  @ApiProperty({
    description: 'Full address',
    example: 'Phase-I Sector 1-19, Chandigarh',
  })
  address: string;

  @ApiProperty({
    description: 'Property description',
    example: 'Introducing DLF Valley, a premier residential property...',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Primary image URL (cover image or first image)',
    example: 'https://example.com/property-image.jpg',
    required: false,
  })
  imageUrl?: string | null;

  @ApiProperty({
    description: 'All property images',
    type: [EndUserPropertyImageDto],
    required: false,
  })
  images?: EndUserPropertyImageDto[];

  @ApiProperty({
    description: 'All property videos',
    type: [EndUserPropertyVideoDto],
    required: false,
  })
  videos?: EndUserPropertyVideoDto[];

  @ApiProperty({
    description: 'Is RERA registered',
    example: true,
  })
  isReraRegistered: boolean;

  @ApiProperty({
    description: 'Construction status',
    example: 'new_launch',
    enum: ['ready_to_move', 'under_construction', 'new_launch'],
    required: false,
  })
  constructionStatus?: string | null;

  @ApiProperty({
    description: 'Property category',
    example: 'Residential',
    required: false,
  })
  category?: string | null;

  @ApiProperty({
    description: 'Listing type (Sale/Rent)',
    example: 'Sale',
    required: false,
  })
  listingType?: string | null;

  @ApiProperty({
    description: 'Property type',
    example: 'Apartment',
    required: false,
  })
  propertyType?: string | null;

  @ApiProperty({
    description: 'BHK type',
    example: '2 BHK',
    required: false,
  })
  bhkType?: string | null;

  @ApiProperty({
    description: 'Plot area',
    example: 119,
    required: false,
  })
  plotArea?: number | null;

  @ApiProperty({
    description: 'Plot area unit',
    example: 'Sq.Yd.',
    required: false,
  })
  plotAreaUnit?: string | null;

  @ApiProperty({
    description: 'Property facing/view direction',
    example: 'Park View',
    required: false,
  })
  facing?: string | null;

  @ApiProperty({
    description: 'Furnishing type',
    example: 'Semi-Furnished',
    enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    required: false,
  })
  furnishType?: string | null;

  @ApiProperty({
    description: 'Number of images',
    example: 4,
    required: false,
  })
  imageCount?: number;

  @ApiProperty({
    description: 'Number of videos',
    example: 2,
    required: false,
  })
  videoCount?: number;

  @ApiProperty({
    description: 'Price (if available)',
    example: 5000000,
    required: false,
  })
  price?: number | null;

  @ApiProperty({
    description: 'Monthly rent (if available)',
    example: 25000,
    required: false,
  })
  monthlyRent?: number | null;

  @ApiProperty({
    description: 'City name',
    example: 'Chandigarh',
    required: false,
  })
  city?: string | null;

  @ApiProperty({
    description: 'Society name',
    example: 'DLF Valley',
    required: false,
  })
  society?: string | null;

  @ApiProperty({
    description: 'Locality name',
    example: 'Sector 1-19',
    required: false,
  })
  locality?: string | null;

  @ApiProperty({
    description: 'Available units with sizes and prices',
    type: [EndUserPropertyUnitDto],
    required: false,
  })
  units?: EndUserPropertyUnitDto[];

  @ApiProperty({
    description: 'Property owner/agent information',
    required: false,
  })
  owner?: {
    name: string | null;
    profileImage: string | null;
    role: string;
  } | null;

  @ApiProperty({
    description: 'Whether the property is in the user\'s favorites (true if logged in user has favorited it, false otherwise)',
    example: false,
    required: false,
  })
  isFavorite?: boolean;
}

export class EndUserPropertiesSearchResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of properties',
    type: [EndUserPropertyListItemDto],
  })
  properties: EndUserPropertyListItemDto[];

  @ApiProperty({ description: 'Total number of properties', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages: number;
}

export class EndUserTopPropertiesQueryDto {
  @ApiProperty({
    description: 'City ID to filter top properties',
    example: 'uuid-city-id',
  })
  @IsUUID()
  @IsNotEmpty()
  cityId: string;
}

export class EndUserTopPropertiesResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of top properties',
    type: [EndUserPropertyListItemDto],
  })
  properties: EndUserPropertyListItemDto[];

  @ApiProperty({ description: 'Total number of top properties', example: 5 })
  total: number;
}

export class EndUserPropertiesCountQueryDto {
  @ApiPropertyOptional({
    description: 'City ID to filter properties',
    example: 'uuid-city-id',
  })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Search by property name, locality, or builder',
    example: 'DLF Valley',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by property category IDs (comma separated) - Residential/Commercial',
    example: 'uuid-category-1,uuid-category-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by listing type IDs (comma separated) - Sale/Rent',
    example: 'uuid-listing-type-1,uuid-listing-type-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  listingTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by property type IDs (comma separated) - Villa, Plot, Apartment, etc.',
    example: 'uuid-property-type-1,uuid-property-type-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  propertyTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by BHK type IDs (comma separated)',
    example: 'uuid-bhk-1,uuid-bhk-2',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsUUID(4, { each: true })
  bhkTypeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by furnishing type (comma separated)',
    example: 'Unfurnished,Fully Furnished',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  furnishingTypes?: string[];

  @ApiPropertyOptional({
    description: 'Filter by construction status (comma separated) - ready_to_move,under_construction',
    example: 'ready_to_move,under_construction',
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  constructionStatuses?: string[];

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: 10000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Latitude for location-based search (Near Me)',
    example: 28.6139,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for location-based search (Near Me)',
    example: 77.2090,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Radius in kilometers for location-based search',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radius?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by posted by user role (comma separated) - OWNER, CHANNEL_PARTNER, or ALL to get all properties',
    example: 'OWNER,CHANNEL_PARTNER',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseCsv(value))
  @IsString({ each: true })
  postedBy?: string[];
}

export class EndUserPropertiesCountResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Total number of properties matching the filters', example: 150 })
  count: number;
}

