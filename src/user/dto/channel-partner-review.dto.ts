import {
  IsInt,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** Request body for POST /end-user/channel-partners/:id/review */
export class SubmitCPReviewDto {
  @ApiProperty({
    description: 'Rating (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Review text',
    example: 'Very professional and helpful throughout the process.',
  })
  @IsOptional()
  @IsString()
  review?: string;
}

export class SubmitCPReviewResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Review submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created/updated review ID',
    example: 'uuid-string',
  })
  reviewId: string;
}

/** Query for GET /end-user/channel-partners/:id/reviews */
export class CPReviewsListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
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
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Sort order for reviews',
    enum: ['newest', 'oldest', 'highest', 'lowest'],
    default: 'newest',
  })
  @IsIn(['newest', 'oldest', 'highest', 'lowest'])
  @IsOptional()
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest';
}

export class CPReviewItemDto {
  @ApiProperty({ description: 'Review ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Reviewer name', example: 'Rahul Sharma' })
  reviewerName: string;

  @ApiPropertyOptional({
    description: 'Reviewer profile image URL',
    example: 'https://example.com/avatar.jpg',
  })
  reviewerProfileImage?: string | null;

  @ApiProperty({ description: 'Rating (1-5)', example: 4 })
  rating: number;

  @ApiPropertyOptional({
    description: 'Review text',
    example: 'Very professional and helpful.',
  })
  review?: string | null;

  @ApiProperty({
    description: 'Created at',
    example: '2026-01-20T10:15:00.000Z',
  })
  createdAt: Date;
}

export class CPStarDistributionDto {
  @ApiProperty({ example: 60 })
  5: number;

  @ApiProperty({ example: 40 })
  4: number;

  @ApiProperty({ example: 12 })
  3: number;

  @ApiProperty({ example: 5 })
  2: number;

  @ApiProperty({ example: 3 })
  1: number;
}

export class CPReviewsListResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Average rating (1-5)', example: 4.2 })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews', example: 120 })
  totalReviews: number;

  @ApiProperty({
    description: 'Count of reviews per star (5-1)',
    type: CPStarDistributionDto,
  })
  starDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };

  @ApiProperty({
    description: 'Paginated list of reviews',
    type: [CPReviewItemDto],
  })
  reviews: CPReviewItemDto[];

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of reviews', example: 120 })
  total: number;

  @ApiProperty({ description: 'Total pages', example: 12 })
  totalPages: number;
}

export class GetMyCPReviewResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Existing review data (if any)',
  })
  review?: {
    id: string;
    rating: number;
    review: string | null;
    createdAt: Date;
  } | null;
}
