import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class FreeListingInfoDto {
  @ApiProperty({ description: 'Number of listings used', example: 1 })
  used: number;

  @ApiProperty({ description: 'Total free listings allowed (null when unlimited)', example: 5, nullable: true })
  total: number | null;

  @ApiProperty({ description: 'Remaining free listings (null when unlimited)', example: 4, nullable: true })
  remaining: number | null;

  @ApiProperty({ description: 'Whether posting is unlimited', example: false })
  isUnlimited: boolean;
}

export class LeadsSummaryDto {
  @ApiProperty({ description: 'Residential leads count', example: 0 })
  residential: number;

  @ApiProperty({ description: 'Commercial leads count', example: 0 })
  commercial: number;
}

export class LeadsSummaryPeriodsDto {
  @ApiProperty({ description: 'Leads summary for last day (24h)', type: LeadsSummaryDto })
  lastDay: LeadsSummaryDto;

  @ApiProperty({ description: 'Leads summary for last week (7 days)', type: LeadsSummaryDto })
  lastWeek: LeadsSummaryDto;

  @ApiProperty({ description: 'Leads summary for last month (30 days)', type: LeadsSummaryDto })
  lastMonth: LeadsSummaryDto;
}

export class DashboardResponseDto {
  @ApiProperty({ description: 'Greeting name of the user', example: 'Raaj' })
  name: string | null;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Current plan', example: 'FREE', enum: ['FREE', 'CHANNEL_PARTNER'] })
  plan: 'FREE' | 'CHANNEL_PARTNER';

  @ApiProperty({ description: 'Free listing usage and limits', type: FreeListingInfoDto })
  freeListings: FreeListingInfoDto;

  @ApiProperty({ description: 'Leads summary for dashboard cards across periods', type: LeadsSummaryPeriodsDto })
  leadsSummary: LeadsSummaryPeriodsDto;
}


