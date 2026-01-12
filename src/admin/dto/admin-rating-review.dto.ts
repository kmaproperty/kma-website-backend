import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, Min, IsBoolean } from 'class-validator';

export class AdminKmaRatingReviewListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by name, email, phone number, or review text',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isApproved?: boolean;
}

export class KmaRatingReviewResponseDto {
  @ApiProperty({ description: 'Rating review ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Rating (1.0 to 5.0)', example: 4.5 })
  rating: number;

  @ApiPropertyOptional({ description: 'Review text', example: 'Great service!' })
  review?: string | null;

  @ApiProperty({ description: 'Name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Phone number', example: '9876543210' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@example.com' })
  email?: string | null;

  @ApiPropertyOptional({
    description: 'End user ID (if logged in)',
    example: 'uuid-string',
  })
  endUserId?: string | null;

  @ApiPropertyOptional({
    description: 'End user details (if logged in)',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
    },
  })
  endUser?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
  } | null;

  @ApiProperty({ description: 'Is approved for home page', example: false })
  isApproved: boolean;

  @ApiPropertyOptional({ description: 'Approved by admin ID', example: 'uuid-string' })
  approvedById?: string | null;

  @ApiPropertyOptional({ description: 'Approved at', example: '2025-01-20T10:15:00.000Z' })
  approvedAt?: Date | null;

  @ApiProperty({ description: 'Created at', example: '2025-01-20T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-01-20T10:15:00.000Z' })
  updatedAt: Date;
}

export class AdminKmaRatingReviewListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of KMA ratings and reviews',
    type: [KmaRatingReviewResponseDto],
  })
  data: KmaRatingReviewResponseDto[];

  @ApiProperty({ description: 'Total count', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;
}

export class AdminApproveRatingReviewDto {
  @ApiPropertyOptional({
    description: 'Optional comment',
    example: 'Approved for home page display',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class AdminApproveRatingReviewResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Rating review ID' })
  ratingReviewId: string;
}

