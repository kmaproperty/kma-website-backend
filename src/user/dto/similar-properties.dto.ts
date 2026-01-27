import { IsString, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SimilarPropertiesQueryDto {
  @ApiProperty({
    description: 'City ID to filter similar properties',
    example: 'uuid-city-id',
  })
  @IsUUID()
  @IsString()
  cityId: string;

  @ApiPropertyOptional({
    description: 'Property type ID to filter similar properties (optional)',
    example: 'uuid-property-type-id',
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  propertyTypeId?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class SimilarPropertyOwnerDto {
  @ApiProperty({ description: 'Owner/Agent user ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Owner/Agent name', example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ description: 'Owner/Agent profile image URL', example: 'https://example.com/profile.jpg', nullable: true })
  profileImage: string | null;

  @ApiProperty({ description: 'Owner/Agent role', example: 'OWNER', enum: ['OWNER', 'CHANNEL_PARTNER'] })
  role: string;
}

export class SimilarPropertyItemDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Property title/name', example: 'Royal Apartment' })
  title: string;

  @ApiProperty({ description: 'Property address', example: '25, Willow Crest Apartment' })
  address: string;

  @ApiProperty({ description: 'Property image URL (cover image or first image)', example: 'https://example.com/property.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: 'Property type name', example: 'Apartment', nullable: true })
  propertyType: string | null;

  @ApiProperty({ description: 'Average rating out of 5', example: 5.0, nullable: true })
  averageRating: number | null;

  @ApiProperty({ description: 'Total number of reviews', example: 10 })
  totalReviews: number;

  @ApiProperty({ description: 'Price (sale price or monthly rent)', example: 400.0, nullable: true })
  price: number | null;

  @ApiProperty({ description: 'Price type', example: 'sale', enum: ['sale', 'rent'], nullable: true })
  priceType: 'sale' | 'rent' | null;

  @ApiProperty({ description: 'Listed on date', example: '2025-05-25' })
  listedOn: string;

  @ApiProperty({ description: 'Possession status', example: 'Ready to move', nullable: true })
  possessionStatus: string | null;

  @ApiProperty({ description: 'Number of bedrooms', example: 2, nullable: true })
  bedrooms: number | null;

  @ApiProperty({ description: 'Number of bathrooms', example: 2, nullable: true })
  bathrooms: number | null;

  @ApiProperty({ description: 'Area in square feet', example: 350, nullable: true })
  area: number | null;

  @ApiProperty({ description: 'Area unit', example: 'Sq Ft', nullable: true })
  areaUnit: string | null;

  @ApiProperty({ description: 'Owner/Agent information', type: SimilarPropertyOwnerDto })
  owner: SimilarPropertyOwnerDto;

  @ApiPropertyOptional({ description: 'Is property favorited by the logged-in user', example: false })
  isFavorite?: boolean;
}

export class SimilarPropertiesResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'List of similar properties', type: [SimilarPropertyItemDto] })
  properties: SimilarPropertyItemDto[];

  @ApiProperty({ description: 'Total number of similar properties found', example: 10 })
  total: number;
}
