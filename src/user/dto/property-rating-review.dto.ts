import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** Request body for POST /properties/:propertyId/rating-review — propertyId comes from path. */
export class SubmitPropertyRatingReviewBodyDto {
  @ApiProperty({
    description: 'Role of the reviewer for this property',
    example: 'owner',
    enum: ['owner', 'tenant', 'other'],
  })
  @IsIn(['owner', 'tenant', 'other'])
  role: 'owner' | 'tenant' | 'other';

  @ApiProperty({
    description: 'Connectivity rating (1-5)',
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  connectivityRating: number;

  @ApiProperty({
    description: 'Neighbourhood rating (1-5)',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  neighbourhoodRating: number;

  @ApiProperty({
    description: 'Safety rating (1-5)',
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  safetyRating: number;

  @ApiProperty({
    description: 'Livability rating (1-5)',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  livabilityRating: number;

  @ApiPropertyOptional({
    description: 'What do you like about the locality?',
    example: 'Wide roads, good connectivity to metro, plenty of shops nearby.',
  })
  @IsOptional()
  @IsString()
  likeText?: string;

  @ApiPropertyOptional({
    description: 'What do you dislike about the locality?',
    example: 'Traffic congestion during peak hours.',
  })
  @IsOptional()
  @IsString()
  dislikeText?: string;
}

/** Full review shape (includes propertyId); used for GET my-review response. */
export class SubmitPropertyRatingReviewDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-property-id' })
  propertyId: string;

  @ApiProperty({ description: 'Role', enum: ['owner', 'tenant', 'other'] })
  role: 'owner' | 'tenant' | 'other';

  @ApiProperty({ description: 'Connectivity rating (1-5)', example: 4 })
  connectivityRating: number;

  @ApiProperty({ description: 'Neighbourhood rating (1-5)', example: 5 })
  neighbourhoodRating: number;

  @ApiProperty({ description: 'Safety rating (1-5)', example: 4 })
  safetyRating: number;

  @ApiProperty({ description: 'Livability rating (1-5)', example: 5 })
  livabilityRating: number;

  @ApiPropertyOptional({ description: 'What you like about the locality' })
  likeText?: string;

  @ApiPropertyOptional({ description: 'What you dislike about the locality' })
  dislikeText?: string;
}

export class SubmitPropertyRatingReviewResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Review submitted' })
  message: string;

  @ApiProperty({
    description: 'Created/updated rating review ID',
    example: 'uuid-string',
  })
  ratingReviewId: string;
}

export class GetMyPropertyRatingReviewResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Existing review data for this property and user (if any)',
    type: SubmitPropertyRatingReviewDto,
  })
  review?: SubmitPropertyRatingReviewDto | null;
}

/** Query for GET /properties/:propertyId/rating-reviews */
export class GetPropertyRatingReviewsQueryDto {
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
}

export class PropertyRatingReviewsSummaryDto {
  @ApiProperty({ description: 'Average overall rating (1–5)', example: 4.2 })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews', example: 120 })
  totalReviews: number;

  @ApiProperty({
    description: 'Count of reviews per star (5–1)',
    example: { 5: 60, 4: 40, 3: 12, 2: 5, 1: 3 },
  })
  starDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

export class PropertyRatingReviewsFeatureRatingsDto {
  @ApiProperty({ description: 'Connectivity rating (1–5)', example: 4.3 })
  connectivity: number;

  @ApiProperty({ description: 'Neighbourhood rating (1–5)', example: 4.3 })
  neighbourhood: number;

  @ApiProperty({ description: 'Safety rating (1–5)', example: 4.3 })
  safety: number;

  @ApiProperty({ description: 'Livability rating (1–5)', example: 4.3 })
  livability: number;
}

export class PropertyRatingReviewItemDto {
  @ApiProperty({ description: 'Review ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Reviewer name', example: 'Meera' })
  reviewerName: string;

  @ApiPropertyOptional({ description: 'Profile image URL', example: 'https://example.com/meera.jpg' })
  reviewerProfileImage?: string | null;

  @ApiPropertyOptional({
    description: 'Reviewer detail (e.g. profession, location)',
    example: 'Teacher from India',
  })
  reviewerDetail?: string | null;

  @ApiProperty({ description: 'Overall rating (1–5)', example: 5 })
  overallRating: number;

  @ApiProperty({ description: 'Reviewer role', enum: ['owner', 'tenant', 'other'] })
  role: 'owner' | 'tenant' | 'other';

  @ApiPropertyOptional({ description: 'What reviewer likes about the locality' })
  likeText?: string | null;

  @ApiPropertyOptional({ description: 'What reviewer dislikes about the locality' })
  dislikeText?: string | null;

  @ApiProperty({ description: 'Created at', example: '2026-01-20T10:15:00.000Z' })
  createdAt: Date;
}

export class GetPropertyRatingReviewsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Overall summary (average rating, total reviews, star distribution)',
    type: PropertyRatingReviewsSummaryDto,
  })
  summary: PropertyRatingReviewsSummaryDto;

  @ApiProperty({
    description: 'Average ratings by feature',
    type: PropertyRatingReviewsFeatureRatingsDto,
  })
  featureRatings: PropertyRatingReviewsFeatureRatingsDto;

  @ApiProperty({
    description: "What's good – aggregated from review likes",
    example: ['Spacious & Large Room Sizes', 'Well-maintained and clean area'],
    type: [String],
  })
  whatsGood: string[];

  @ApiProperty({
    description: "What's bad – aggregated from review dislikes",
    example: ['Smaller Room Sizes', 'Water supply system issues'],
    type: [String],
  })
  whatsBad: string[];

  @ApiProperty({
    description: 'Paginated list of individual reviews',
    type: [PropertyRatingReviewItemDto],
  })
  reviews: PropertyRatingReviewItemDto[];

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of reviews', example: 120 })
  total: number;

  @ApiProperty({ description: 'Total pages', example: 12 })
  totalPages: number;
}


