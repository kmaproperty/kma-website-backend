import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyVerificationStatus } from '../../property/entities/property-verification-request.entity';

export class StarDistributionDto {
  @ApiProperty({ description: 'Number of 5-star reviews', example: 50 })
  '5': number;

  @ApiProperty({ description: 'Number of 4-star reviews', example: 40 })
  '4': number;

  @ApiProperty({ description: 'Number of 3-star reviews', example: 20 })
  '3': number;

  @ApiProperty({ description: 'Number of 2-star reviews', example: 5 })
  '2': number;

  @ApiProperty({ description: 'Number of 1-star reviews', example: 5 })
  '1': number;
}

export class FeatureRatingsDto {
  @ApiProperty({ description: 'Average connectivity rating', example: 4.3 })
  connectivity: number;

  @ApiProperty({ description: 'Average neighbourhood rating', example: 4.3 })
  neighbourhood: number;

  @ApiProperty({ description: 'Average safety rating', example: 4.3 })
  safety: number;

  @ApiProperty({ description: 'Average livability rating', example: 4.3 })
  livability: number;
}

export class PropertyRatingStatisticsDto {
  @ApiProperty({ description: 'Total number of reviews', example: 120 })
  totalReviews: number;

  @ApiProperty({ description: 'Average overall rating out of 5', example: 4.2 })
  averageOverallRating: number;

  @ApiProperty({ description: 'Star distribution by rating', type: StarDistributionDto })
  starDistribution: StarDistributionDto;

  @ApiProperty({ description: 'Average ratings by feature', type: FeatureRatingsDto })
  featureRatings: FeatureRatingsDto;

  @ApiProperty({ description: 'What users like (positive feedback)', type: [String], example: ['Spacious & Large Room Sizes', 'Well-maintained and clean area'] })
  likes: string[];

  @ApiProperty({ description: 'What users dislike (negative feedback)', type: [String], example: ['Smaller Room Sizes', 'Water supply system issues'] })
  dislikes: string[];
}

export class PropertyReviewItemDto {
  @ApiProperty({ description: 'Review ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Reviewer user ID', example: 'uuid-string' })
  endUserId: string;

  @ApiProperty({ description: 'Reviewer name', example: 'Meera' })
  reviewerName: string | null;

  @ApiProperty({ description: 'Reviewer role', example: 'owner', enum: ['owner', 'tenant', 'other'] })
  role: string;

  @ApiProperty({ description: 'Overall rating', example: 5 })
  overallRating: number;

  @ApiProperty({ description: 'Connectivity rating', example: 5 })
  connectivityRating: number;

  @ApiProperty({ description: 'Neighbourhood rating', example: 5 })
  neighbourhoodRating: number;

  @ApiProperty({ description: 'Safety rating', example: 5 })
  safetyRating: number;

  @ApiProperty({ description: 'Livability rating', example: 5 })
  livabilityRating: number;

  @ApiPropertyOptional({ description: 'What the reviewer liked', example: 'Spacious rooms' })
  likeText?: string | null;

  @ApiPropertyOptional({ description: 'What the reviewer disliked', example: 'Noise pollution' })
  dislikeText?: string | null;

  @ApiProperty({ description: 'Review creation date', example: '2025-01-27T00:00:00.000Z' })
  createdAt: Date;
}

export class ChannelPartnerPropertyListingsDto {
  @ApiProperty({ description: 'Number of properties for rent', example: 21 })
  rent: number;

  @ApiProperty({ description: 'Number of properties for sale', example: 21 })
  sale: number;
}

export class ChannelPartnerDetailsDto {
  @ApiProperty({ description: 'Channel partner ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Channel partner name', example: 'Manjeet Skyzen' })
  name: string | null;

  @ApiProperty({ description: 'Firm name', example: 'Skyzen Real Estate', nullable: true })
  firmName: string | null;

  @ApiProperty({ description: 'Profile image URL', example: 'https://example.com/profile.jpg', nullable: true })
  profileImage: string | null;

  @ApiProperty({ description: 'Channel partner code', example: 'CP123456', nullable: true })
  channelPartnerCode: string | null;

  @ApiProperty({ description: 'Phone number', example: '9876543210' })
  phone: string;

  @ApiProperty({ description: 'Email address', example: 'contact@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ description: 'Number of buyers served (total leads)', example: 500 })
  buyersServed: number;

  @ApiProperty({ description: 'Years of experience', example: 21, nullable: true })
  yearsOfExperience: number | null;

  @ApiProperty({ description: 'Number of property holdings', example: 44 })
  propertyHoldings: number;

  @ApiProperty({ description: 'Number of areas of operation', example: 20 })
  areasOfOperation: number;

  @ApiProperty({ description: 'Property listings summary', type: ChannelPartnerPropertyListingsDto })
  propertyListings: ChannelPartnerPropertyListingsDto;
}

export class EndUserPropertyDetailsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description:
      'Full property entity object with all scalar fields and loaded relations (including photos, videos, and master data mappings).',
  })
  property: any;

  @ApiPropertyOptional({
    description: 'Verification status of the property from property verification request',
    enum: PropertyVerificationStatus,
    example: PropertyVerificationStatus.APPROVED,
    nullable: true,
  })
  verificationStatus?: PropertyVerificationStatus | null;

  @ApiPropertyOptional({
    description: 'Comments/rejection reason from property verification request',
    example: 'Property verified and approved',
    nullable: true,
  })
  comments?: string | null;

  @ApiPropertyOptional({
    description: 'Channel partner details (if property owner is a channel partner)',
    type: ChannelPartnerDetailsDto,
  })
  channelPartnerDetails?: ChannelPartnerDetailsDto;

  @ApiPropertyOptional({
    description: 'Ratings and reviews statistics for the property',
    type: PropertyRatingStatisticsDto,
  })
  ratingsAndReviews?: PropertyRatingStatisticsDto;

  @ApiPropertyOptional({
    description: 'Sample reviews (first 3 reviews)',
    type: [PropertyReviewItemDto],
  })
  sampleReviews?: PropertyReviewItemDto[];

  @ApiPropertyOptional({
    description:
      'Remaining free views for unauthenticated users (-1 for unlimited for authenticated users)',
    example: 2,
  })
  remainingViews?: number;

  @ApiPropertyOptional({
    description:
      'Session ID for non-logged-in users (store this and send in X-Session-Id header for subsequent requests)',
    example: 'abc123def456',
  })
  sessionId?: string;
}

