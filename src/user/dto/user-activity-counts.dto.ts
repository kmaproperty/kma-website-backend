import { ApiProperty } from '@nestjs/swagger';

/**
 * Counts for the user activity panel (Recently Search, Recently Viewed, Saved Properties, Contacted Properties).
 * For non-logged-in users: pass sessionId (header or query); recentlySearch and recentlyViewed use sessionId; savedProperties and contactedProperties are 0.
 * For logged-in users: use auth token; all counts use userId.
 */
export class UserActivityCountsResponseDto {
  @ApiProperty({
    description: 'Number of recent searches (search history)',
    example: 6,
  })
  recentlySearch: number;

  @ApiProperty({
    description: 'Number of properties recently viewed',
    example: 15,
  })
  recentlyViewed: number;

  @ApiProperty({
    description: 'Number of saved/favorite properties (logged-in only; 0 for anonymous)',
    example: 0,
  })
  savedProperties: number;

  @ApiProperty({
    description: 'Number of properties the user has contacted/inquired (logged-in only; 0 for anonymous)',
    example: 8,
  })
  contactedProperties: number;
}
