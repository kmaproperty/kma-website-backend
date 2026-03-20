import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AdminPropertyListQueryDto {
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
    description: 'Filter by property status',
    example: 'pending_review',
    enum: ['draft', 'pending_review', 'active', 'rejected', 'deactivated'],
  })
  @IsOptional()
  @IsIn(['draft', 'pending_review', 'active', 'rejected', 'deactivated'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by city ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  cityId?: string;
}

export class AdminPropertyListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Comprehensive property data with related entities',
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

  @ApiPropertyOptional({ description: 'Property summary counts' })
  summary?: {
    totalProperties: number;
    activeProperties: number;
    pendingProperties: number;
    verifiedProperties: number;
  };
}

export class AdminReviewPropertyDto {
  @ApiProperty({
    description: 'Admin review comment',
    example: 'Looks good, approved.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class AdminRejectPropertyDto extends AdminReviewPropertyDto {
  @ApiProperty({
    description: 'Admin rejection comment',
    example: 'Missing mandatory documents.',
  })
  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  comment: string;
}

export class AdminPropertyDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Comprehensive property data with all related entities',
    type: Object,
  })
  data: Record<string, any>;
}

