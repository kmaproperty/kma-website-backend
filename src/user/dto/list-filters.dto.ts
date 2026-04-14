import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class FilterListingTypeItemDto {
  @ApiProperty({ description: 'Listing type ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Listing type name', example: 'Sale' })
  name: string;

  @ApiProperty({ description: 'Listing type code', example: 'SALE' })
  code: string;
}

export class FilterCategoryItemDto {
  @ApiProperty({ description: 'Category ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Category name', example: 'Residential' })
  name: string;

  @ApiProperty({ description: 'Category code', example: 'RESIDENTIAL' })
  code: string;
}

export class FilterPropertyTypeItemDto {
  @ApiProperty({ description: 'Property type ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Property type name', example: 'Flat/Apartment' })
  name: string;

  @ApiProperty({ description: 'Property type code', example: 'FLAT_APARTMENT' })
  code: string;
}

export class FilterBhkTypeItemDto {
  @ApiProperty({ description: 'BHK type ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'BHK type name', example: '2 BHK' })
  name: string;

  @ApiProperty({ description: 'BHK type code', example: '2_BHK' })
  code: string;
}

export class FilterAmenityItemDto {
  @ApiProperty({ description: 'Amenity ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Amenity name', example: 'Swimming Pool' })
  name: string;

  @ApiProperty({ description: 'Amenity code', example: 'swimming-pool' })
  code: string;

  @ApiPropertyOptional({ description: 'Amenity icon URL or identifier', example: null })
  icon?: string | null;
}

export class FilterFurnishingItemDto {
  @ApiProperty({ description: 'Furnish type value (use in furnishingTypes filter)', example: 'Furnished' })
  id: string;

  @ApiProperty({ description: 'Furnish type display name', example: 'Furnished' })
  name: string;

  @ApiProperty({ description: 'Furnish type code', example: 'Furnished' })
  code: string;
}

export class FilterRangeOptionDto {
  @ApiProperty({ description: 'Display label', example: '₹ 1 Cr' })
  label: string;

  @ApiProperty({ description: 'Numeric value to send in filter', example: 10000000 })
  value: number;
}

export class FilterRangeDto {
  @ApiProperty({ description: 'Unit label', example: '₹ Crore' })
  unit: string;

  @ApiProperty({ type: [FilterRangeOptionDto] })
  min: FilterRangeOptionDto[];

  @ApiProperty({ type: [FilterRangeOptionDto] })
  max: FilterRangeOptionDto[];
}

export class ListFiltersQueryDto {
  @ApiPropertyOptional({
    description: 'Optional listing type ID to filter property types (only property types for this listing type are returned)',
    example: 'uuid-listing-type-id',
  })
  @IsOptional()
  @IsUUID()
  listingTypeId?: string;

  @ApiPropertyOptional({
    description: 'Optional category ID to filter property types (only property types for this category are returned)',
    example: 'uuid-category-id',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description:
      'Optional property type ID. When provided, bhkTypes are returned only for this property type. bhkTypes are empty for Plot and Commercial category.',
    example: 'uuid-property-type-id',
  })
  @IsOptional()
  @IsUUID()
  propertyTypeId?: string;
}

export class ListFiltersResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Listing types (e.g. Sale, Rent)',
    type: [FilterListingTypeItemDto],
  })
  listingTypes: FilterListingTypeItemDto[];

  @ApiProperty({
    description: 'Categories (e.g. Residential, Commercial)',
    type: [FilterCategoryItemDto],
  })
  categories: FilterCategoryItemDto[];

  @ApiPropertyOptional({
    description: 'Property types. When listingTypeId and/or categoryId are provided in query, only matching property types are returned.',
    type: [FilterPropertyTypeItemDto],
  })
  propertyTypes?: FilterPropertyTypeItemDto[];

  @ApiProperty({
    description:
      'BHK types. When propertyTypeId is provided, only BHK types for that property type are returned. Empty for Plot and Commercial category.',
    type: [FilterBhkTypeItemDto],
  })
  bhkTypes: FilterBhkTypeItemDto[];

  @ApiProperty({
    description: 'Amenities (e.g. Swimming Pool, Gym)',
    type: [FilterAmenityItemDto],
  })
  amenities: FilterAmenityItemDto[];

  @ApiProperty({
    description: 'Furnish type options: Furnished, Semi-Furnished, Unfurnished (use id/code in furnishingTypes search filter)',
    type: [FilterFurnishingItemDto],
  })
  furnishing: FilterFurnishingItemDto[];

  @ApiProperty({
    description: 'Budget range options (min/max) for sale listings. Values are in rupees.',
    type: FilterRangeDto,
  })
  budgetSale: FilterRangeDto;

  @ApiProperty({
    description: 'Budget range options (min/max) for rent listings (monthly rent). Values are in rupees.',
    type: FilterRangeDto,
  })
  budgetRent: FilterRangeDto;

  @ApiProperty({
    description: 'Size range options for plot/land in Sq.Yd.',
    type: FilterRangeDto,
  })
  sizePlot: FilterRangeDto;

  @ApiProperty({
    description: 'Size range options for built-up area in Sq.Ft.',
    type: FilterRangeDto,
  })
  sizeBuiltUp: FilterRangeDto;
}
