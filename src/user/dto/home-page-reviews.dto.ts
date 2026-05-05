import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HomePageReviewItemDto {
  @ApiProperty({ description: 'Rating review ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Rating (1.0 to 5.0)', example: 4.5 })
  rating: number;

  @ApiPropertyOptional({ description: 'Review text', example: 'Great service!' })
  review?: string | null;

  @ApiProperty({ description: 'Reviewer name', example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ description: 'Reviewer email', example: 'john.doe@example.com' })
  email?: string | null;

  @ApiPropertyOptional({
    description: 'End user details (if logged in)',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john.doe@example.com',
      profileImage: 'https://example.com/profile-pic.jpg',
    },
  })
  endUser?: {
    id: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
  } | null;

  @ApiPropertyOptional({
    description: 'Profile picture URL (from endUser or null)',
    example: 'https://example.com/profile-pic.jpg',
  })
  profileImage?: string | null;

  @ApiProperty({ description: 'Created at', example: '2025-01-20T10:15:00.000Z' })
  createdAt: Date;
}

export class HomePageReviewsStatisticsDto {
  @ApiProperty({ description: 'Total count of approved reviews', example: 3857 })
  totalCount: number;

  @ApiProperty({ description: 'Average rating', example: 4.4 })
  averageRating: number;

  @ApiProperty({ description: 'Total number of end users', example: 5000 })
  totalEndUsers: number;

  @ApiProperty({
    description: 'Counts of approved reviews per integer rating bucket (1-5)',
    example: { 1: 4, 2: 6, 3: 18, 4: 80, 5: 120 },
  })
  ratingDistribution: Record<number, number>;
}

export class HomePageReviewsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Top approved reviews for home page (minimum 4)',
    type: [HomePageReviewItemDto],
  })
  reviews: HomePageReviewItemDto[];

  @ApiProperty({
    description: 'Statistics for approved reviews',
    type: HomePageReviewsStatisticsDto,
  })
  statistics: HomePageReviewsStatisticsDto;

  @ApiProperty({
    description: 'Trust message text',
    example: 'Trusted By Client around the World',
  })
  trustedByText: string;
}

