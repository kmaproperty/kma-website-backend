import { ApiProperty } from '@nestjs/swagger';
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
}

