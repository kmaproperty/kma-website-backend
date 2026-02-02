import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class PropertyTypeExploreQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by city ID',
    example: 'uuid-city-id',
  })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by property type ID',
    example: 'uuid-property-type-id',
  })
  @IsOptional()
  @IsUUID()
  propertyTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by listing type ID',
    example: 'uuid-listing-type-id',
  })
  @IsOptional()
  @IsUUID()
  listingTypeId?: string;
}

export class PropertyTypeExploreImageDto {
  @ApiProperty({ description: 'Image file key/URL', example: 'properties/abc123.jpg' })
  fileKey: string;
  @ApiProperty({ description: 'View type', example: 'living_room' })
  view: string;
  @ApiProperty({ description: 'Whether this is the cover image', example: true })
  isCoverImage: boolean;
}

export class PropertyTypeExploreItemDto {
  @ApiProperty({
    description: 'Property type ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Property type name',
    example: 'Villas',
  })
  name: string;

  @ApiProperty({
    description: 'Property type code',
    example: 'res-sale-villa',
  })
  code: string;

  @ApiProperty({
    description: 'Number of active properties for this type',
    example: 28,
  })
  propertyCount: number;

  @ApiPropertyOptional({
    description: 'Cover or first image from a sample property of this type (fileKey)',
    example: 'properties/abc123.jpg',
  })
  imageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'All images from the sample property of this type',
    type: [PropertyTypeExploreImageDto],
  })
  images?: PropertyTypeExploreImageDto[];
}

export class PropertyTypeExploreResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of property types with their property counts',
    type: [PropertyTypeExploreItemDto],
  })
  propertyTypes: PropertyTypeExploreItemDto[];
}

