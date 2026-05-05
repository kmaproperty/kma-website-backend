import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitRatingReviewDto {
  @ApiProperty({
    description: 'Rating (1.0 to 5.0)',
    example: 4.5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Review text',
    example: 'Great service! Very satisfied with KMA.',
  })
  @IsOptional()
  @IsString()
  review?: string;
}

export class SubmitRatingReviewResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Rating and review submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created rating and review ID',
    example: 'uuid-string',
  })
  ratingReviewId: string;
}

export class MyKmaRatingReviewItemDto {
  @ApiProperty({ description: 'Rating review ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Rating (1.0 to 5.0)', example: 4.5 })
  rating: number;

  @ApiPropertyOptional({ description: 'Review text', example: 'Great service!' })
  review: string | null;

  @ApiProperty({ description: 'Whether review is approved/visible', example: true })
  isApproved: boolean;

  @ApiProperty({ description: 'Created at', example: '2025-01-20T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated at', example: '2025-01-22T08:00:00.000Z' })
  updatedAt: Date;
}

export class GetMyKmaRatingReviewResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Existing review for the logged-in user (null if none yet)',
    type: MyKmaRatingReviewItemDto,
    nullable: true,
  })
  review: MyKmaRatingReviewItemDto | null;
}

