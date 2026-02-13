import { ApiProperty } from '@nestjs/swagger';

export class PropertyTypeItemDto {
  @ApiProperty({
    description: 'Property type ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Property type name',
    example: 'Flat/Apartment',
  })
  name: string;

  @ApiProperty({
    description: 'Property type code',
    example: 'FLAT_APARTMENT',
  })
  code: string;
}

export class CategoryItemDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Residential',
  })
  name: string;

  @ApiProperty({
    description: 'Category code',
    example: 'RESIDENTIAL',
  })
  code: string;

  @ApiProperty({
    description: 'Property types available for this category and listing type',
    type: [PropertyTypeItemDto],
  })
  propertyTypes: PropertyTypeItemDto[];
}

export class ListingTypeItemDto {
  @ApiProperty({
    description: 'Listing type ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Listing type name',
    example: 'Sale',
  })
  name: string;

  @ApiProperty({
    description: 'Listing type code',
    example: 'SALE',
  })
  code: string;

  @ApiProperty({
    description: 'Categories available for this listing type',
    type: [CategoryItemDto],
  })
  categories: CategoryItemDto[];
}

export class AmenityItemDto {
  @ApiProperty({
    description: 'Amenity ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Amenity name',
    example: 'Gymnasium',
  })
  name: string;

  @ApiProperty({
    description: 'Amenity code',
    example: 'gymnasium',
  })
  code: string;

  @ApiProperty({
    description: 'Amenity icon',
    example: 'gymnasium-icon',
    required: false,
  })
  icon?: string | null;
}

export class PropertyMasterDataResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Property master data retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of listing types with their categories and property types',
    type: [ListingTypeItemDto],
  })
  data: ListingTypeItemDto[];

  @ApiProperty({
    description: 'List of amenities (active only, sorted by sortOrder then name)',
    type: [AmenityItemDto],
  })
  amenities: AmenityItemDto[];
}

