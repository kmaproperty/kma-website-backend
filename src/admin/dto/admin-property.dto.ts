import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
    enum: ['pending_review', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsIn(['pending_review', 'approved', 'rejected'])
  status?: string;
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

