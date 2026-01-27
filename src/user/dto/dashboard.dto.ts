import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class FreeListingInfoDto {
  @ApiProperty({ description: 'Number of listings used', example: 1 })
  used: number;

  @ApiProperty({ description: 'Total free listings allowed (null when unlimited)', example: 3, nullable: true })
  total: number | null;

  @ApiProperty({ description: 'Remaining free listings (null when unlimited)', example: 2, nullable: true })
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

export class ListingsSummaryDto {
  @ApiProperty({ description: 'Residential listings count', example: 41 })
  residential: number;

  @ApiProperty({ description: 'Commercial listings count', example: 2 })
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

export class KycStatusDto {
  @ApiProperty({
    description: 'Step 1: Live photo status',
    example: {
      live_photo_url: 'https://example.com/live-photo.jpg',
      live_photo_approved: false,
    },
  })
  step1_live_photo: {
    live_photo_url: string | null;
    live_photo_approved: boolean;
  };

  @ApiProperty({
    description: 'Step 2: Aadhaar verification status',
    example: {
      aadhaar_number: '123456789012',
      aadhaar_verified: true,
    },
  })
  step2_aadhaar: {
    aadhaar_number: string | null;
    aadhaar_verified: boolean;
  };

  @ApiProperty({
    description: 'Step 3: Bank details status',
    example: {
      bank_details_filled: true,
    },
  })
  step3_bank_details: {
    bank_details_filled: boolean;
  };

  @ApiProperty({
    description: 'Step 4: DocuSign agreement status',
    example: {
      docusign_agreement_signed: false,
    },
  })
  step4_docusign_agreement: {
    docusign_agreement_signed: boolean;
  };

  @ApiProperty({
    description: 'KYC completion status (true when all 4 steps are completed and approved)',
    example: false,
  })
  kyc_completed: boolean;

  @ApiProperty({
    description: 'KYC progress percentage (0-100)',
    example: 75,
  })
  kyc_progress: number;

  @ApiProperty({
    description: 'Number of completed steps out of 4',
    example: 3,
  })
  kyc_steps_completed: number;

  @ApiProperty({
    description: 'Total number of KYC steps',
    example: 4,
  })
  kyc_total_steps: number;

  @ApiProperty({
    description: 'KYC status: pending, in_review, approved, rejected',
    example: 'in_review',
  })
  kyc_status: string;
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

  @ApiProperty({ description: 'Listings summary by category (Residential and Commercial)', type: ListingsSummaryDto })
  listingsSummary: ListingsSummaryDto;

  @ApiProperty({ description: 'KYC verification status', type: KycStatusDto })
  kycStatus: KycStatusDto;
}


