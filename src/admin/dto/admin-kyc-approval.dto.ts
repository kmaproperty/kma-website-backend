import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminApproveLivePhotoDto {
  @ApiProperty({
    description: 'User ID of the channel partner',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Whether to approve the live photo',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiPropertyOptional({
    description: 'Optional comment for approval/rejection',
    example: 'Live photo approved after verification',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class AdminApproveLivePhotoRequestDto {
  @ApiProperty({
    description: 'Whether to approve the live photo',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiPropertyOptional({
    description: 'Optional comment for approval/rejection',
    example: 'Live photo approved after verification',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class AdminApproveLivePhotoResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Live photo approved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  userId: string;

  @ApiProperty({
    description: 'Whether live photo is approved',
    example: true,
  })
  live_photo_approved: boolean;

  @ApiProperty({
    description: 'Updated KYC completion status',
    example: false,
  })
  kyc_completed: boolean;
}

export class AdminApproveKycDto {
  @ApiProperty({
    description: 'User ID of the channel partner',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Whether to approve the KYC',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiPropertyOptional({
    description: 'Optional comment for approval/rejection',
    example: 'KYC approved after thorough verification',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class AdminApproveKycRequestDto {
  @ApiProperty({
    description: 'Whether to approve the KYC',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiPropertyOptional({
    description: 'Optional comment for approval/rejection',
    example: 'KYC approved after thorough verification',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class AdminApproveKycResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'KYC approved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  userId: string;

  @ApiProperty({
    description: 'Whether KYC is approved',
    example: true,
  })
  kyc_completed: boolean;

  @ApiProperty({
    description: 'KYC verification steps status',
    example: {
      step1_live_photo: { live_photo_url: 'https://example.com/photo.jpg', live_photo_approved: true },
      step2_aadhaar: { aadhaar_number: '123456789012', aadhaar_verified: true },
      step3_bank_details: { bank_details_filled: true },
      step4_docusign_agreement: { docusign_agreement_signed: true },
    },
  })
  kyc_status: {
    step1_live_photo: {
      live_photo_url: string | null;
      live_photo_approved: boolean;
    };
    step2_aadhaar: {
      aadhaar_number: string | null;
      aadhaar_verified: boolean;
    };
    step3_bank_details: {
      bank_details_filled: boolean;
    };
    step4_docusign_agreement: {
      docusign_agreement_signed: boolean;
    };
  };
}

export class AdminKycStatusResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'User ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  userId: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  user_name: string | null;

  @ApiProperty({
    description: 'User phone',
    example: '+919876543210',
  })
  user_phone: string;

  @ApiProperty({
    description: 'Whether KYC is completed',
    example: false,
  })
  kyc_completed: boolean;

  @ApiProperty({
    description: 'KYC status details',
    example: {
      step1_live_photo: {
        live_photo_url: 'https://example.com/live-photo.jpg',
        live_photo_approved: false,
      },
      step2_aadhaar: {
        aadhaar_number: '123456789012',
        aadhaar_verified: true,
      },
      step3_bank_details: {
        bank_details_filled: true,
      },
      step4_docusign_agreement: {
        docusign_agreement_signed: false,
      },
    },
  })
  kyc_status: {
    step1_live_photo: {
      live_photo_url: string | null;
      live_photo_approved: boolean;
    };
    step2_aadhaar: {
      aadhaar_number: string | null;
      aadhaar_verified: boolean;
    };
    step3_bank_details: {
      bank_details_filled: boolean;
    };
    step4_docusign_agreement: {
      docusign_agreement_signed: boolean;
    };
  };
}

