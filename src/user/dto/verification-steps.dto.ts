import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

// Step 1: Live Photo Upload
export class UploadLivePhotoDto {
  @ApiProperty({
    description: 'Live photo URL or relative path',
    example: 'https://example.com/live-photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  live_photo_url: string;
}

export class UploadLivePhotoResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Live photo uploaded successfully. Waiting for admin approval.',
  })
  message: string;

  @ApiProperty({
    description: 'Live photo URL',
    example: 'https://example.com/live-photo.jpg',
  })
  live_photo_url: string;

  @ApiProperty({
    description: 'Whether the photo is approved by admin',
    example: false,
  })
  live_photo_approved: boolean;
}

// Step 2: Aadhaar Verification
export class VerifyAadhaarDto {
  @ApiProperty({
    description: 'Aadhaar number',
    example: '123456789012',
  })
  @IsString()
  @IsNotEmpty()
  aadhaar_number: string;

  @ApiProperty({
    description: 'OTP code (use 1234 for verification)',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class VerifyAadhaarResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Aadhaar verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether Aadhaar is verified',
    example: true,
  })
  aadhaar_verified: boolean;
}

// Step 3: Bank Details
export class BankDetailsDto {
  @ApiProperty({
    description: 'Bank account number',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty({
    description: 'IFSC code',
    example: 'SBIN0001234',
  })
  @IsString()
  @IsNotEmpty()
  ifsc_code: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'State Bank of India',
  })
  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  account_holder_name: string;

  @ApiProperty({
    description: 'Branch name',
    example: 'Main Branch',
    required: false,
  })
  @IsString()
  @IsOptional()
  branch_name?: string;
}

export class BankDetailsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Bank details saved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether bank details are filled',
    example: true,
  })
  bank_details_filled: boolean;
}

// Step 4: DocuSign Agreement (status check)
export class DocuSignAgreementStatusResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Whether DocuSign agreement is signed',
    example: true,
  })
  docusign_agreement_signed: boolean;

  @ApiProperty({
    description: 'Agreement envelope ID if available',
    example: 'abc123-def456',
    required: false,
  })
  envelope_id?: string | null;
}

// Get all verification steps status
export class VerificationStepsStatusResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

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

  @ApiPropertyOptional({
    description: 'KYC rejection reason (only present when kyc_status is rejected)',
    example: 'Documents are not clear. Please upload clear images.',
  })
  kyc_rejection_reason?: string | null;
}

// GET endpoints response DTOs
export class GetLivePhotoResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Live photo URL',
    example: 'https://example.com/live-photo.jpg',
    nullable: true,
  })
  live_photo_url: string | null;

  @ApiProperty({
    description: 'Whether the photo is approved by admin',
    example: false,
  })
  live_photo_approved: boolean;
}

export class GetAadhaarDetailsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Aadhaar number',
    example: '123456789012',
    nullable: true,
  })
  aadhaar_number: string | null;

  @ApiProperty({
    description: 'Whether Aadhaar is verified',
    example: true,
  })
  aadhaar_verified: boolean;
}

export class GetBankDetailsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Bank details (decrypted)',
    example: {
      account_number: '1234567890',
      ifsc_code: 'SBIN0001234',
      bank_name: 'State Bank of India',
      account_holder_name: 'John Doe',
      branch_name: 'Main Branch',
    },
    nullable: true,
  })
  bank_details: {
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_holder_name: string;
    branch_name?: string;
  } | null;
}

