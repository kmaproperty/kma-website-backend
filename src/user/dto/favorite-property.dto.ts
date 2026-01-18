import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EndUserPropertyListItemDto } from './end-user-properties-search.dto';

export class AddFavoritePropertyDto {
  @ApiProperty({
    description: 'Property ID to add to favorites',
    example: 'uuid-property-id',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}

export class RemoveFavoritePropertyDto {
  @ApiProperty({
    description: 'Property ID to remove from favorites',
    example: 'uuid-property-id',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}

export class FavoritePropertyResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Property added to favorites successfully' })
  message: string;

  @ApiProperty({ description: 'Favorite property ID', example: 'uuid-favorite-id', required: false })
  favoriteId?: string;
}

export class FavoritePropertyListQueryDto {
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
  @IsOptional()
  limit: number = 20;
}

export class FavoritePropertyListResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of favorite properties',
    type: [EndUserPropertyListItemDto],
  })
  properties: EndUserPropertyListItemDto[];

  @ApiProperty({ description: 'Total number of favorite properties', example: 10 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 1 })
  totalPages: number;
}

export class CheckFavoritePropertyQueryDto {
  @ApiProperty({
    description: 'Property ID to check',
    example: 'uuid-property-id',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}

export class CheckFavoritePropertyResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Whether the property is favorited', example: true })
  isFavorite: boolean;
}

