import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminMarkTopPropertyDto {
  @ApiProperty({
    description: 'Property ID to mark as top',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;
}

export class AdminMarkTopPropertyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Property marked as top successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  propertyId: string;

  @ApiProperty({
    description: 'Whether property is marked as top',
    example: true,
  })
  isTop: boolean;
}

export class AdminRemoveTopPropertyDto {
  @ApiProperty({
    description: 'Property ID to remove from top',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;
}

export class AdminRemoveTopPropertyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Property removed from top successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  propertyId: string;

  @ApiProperty({
    description: 'Whether property is marked as top',
    example: false,
  })
  isTop: boolean;
}

export class AdminTopPropertiesListQueryDto {
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

export class AdminTopPropertiesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of top properties',
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

