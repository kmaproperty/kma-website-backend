import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminMarkFeaturedPropertyDto {
  @ApiProperty({
    description: 'Property ID to mark as featured',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;
}

export class AdminMarkFeaturedPropertyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Property marked as featured successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  propertyId: string;

  @ApiProperty({
    description: 'Whether property is marked as featured',
    example: true,
  })
  isFeatured: boolean;
}

export class AdminRemoveFeaturedPropertyDto {
  @ApiProperty({
    description: 'Property ID to remove from featured',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;
}

export class AdminRemoveFeaturedPropertyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Property removed from featured successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  propertyId: string;

  @ApiProperty({
    description: 'Whether property is marked as featured',
    example: false,
  })
  isFeatured: boolean;
}

export class AdminFeaturedPropertiesListQueryDto {
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
    description: 'Filter by city ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  cityId?: string;
}

export class AdminFeaturedPropertiesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of featured properties with enhanced details including bathroom, bedroom, owner details, rating, and possession status',
    type: Object,
    isArray: true,
  })
  data: Record<string, any>[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
