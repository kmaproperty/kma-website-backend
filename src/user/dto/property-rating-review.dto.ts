import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitPropertyRatingReviewDto {
  @ApiProperty({
    description: 'Property ID being rated',
    example: 'uuid-property-id',
  })
  @IsUUID()
  propertyId: string;

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


