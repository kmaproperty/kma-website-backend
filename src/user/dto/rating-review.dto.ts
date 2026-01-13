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

