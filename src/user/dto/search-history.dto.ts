import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordSearchDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'Jai bhavani nagar, Pashan, Pune',
  })
  @IsString()
  searchQuery: string;

  @ApiPropertyOptional({
    description: 'Location/Area',
    example: 'Jai bhavani nagar, Pashan',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Pune',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Price range',
    example: 'Any Price',
  })
  @IsString()
  @IsOptional()
  priceRange?: string;

  @ApiPropertyOptional({
    description: 'Additional search filters',
    example: { propertyType: 'apartment', bhk: '2' },
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}

export class GetSearchHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'recent',
    default: 'recent',
    enum: ['recent', 'relevance'],
  })
  @IsString()
  @IsIn(['recent', 'relevance'])
  @IsOptional()
  sortBy?: 'recent' | 'relevance' = 'recent';

  @ApiPropertyOptional({
    description: 'Filter by listing type (from stored filters)',
    example: 'rent',
  })
  @IsString()
  @IsOptional()
  listingType?: string;
}

export class SearchHistoryItemDto {
  @ApiProperty({
    description: 'Search history record ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Search query string',
    example: 'Jai bhavani nagar, Pashan, Pune, Any Price',
  })
  searchQuery: string;

  @ApiPropertyOptional({
    description: 'Location/Area',
    example: 'Jai bhavani nagar, Pashan',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Pune',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'Price range',
    example: 'Any Price',
  })
  priceRange?: string;

  @ApiPropertyOptional({
    description: 'Additional search filters',
    example: { propertyType: 'apartment', bhk: '2' },
  })
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Search timestamp',
    example: '2024-01-30T10:30:00Z',
  })
  createdAt: Date;
}

export class GetSearchHistoryResponseDto {
  @ApiProperty({
    description: 'List of recent searches',
    type: [SearchHistoryItemDto],
  })
  searches: SearchHistoryItemDto[];

  @ApiProperty({
    description: 'Total number of search records',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of results per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

export class RecordSearchResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Search recorded successfully',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Session ID for non-logged-in users',
    example: 'abc123def456',
  })
  sessionId?: string;
}

export class ClearSearchHistoryResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Search history cleared successfully',
  })
  message: string;
}
