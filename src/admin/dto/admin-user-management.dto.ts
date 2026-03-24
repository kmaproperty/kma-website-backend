import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class AdminEditUserDto {
  @ApiPropertyOptional({
    description: 'User name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'User email',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Firm name (for channel partners)',
    example: 'ABC Realty',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firmName?: string;

  @ApiPropertyOptional({
    description: 'Cities (for channel partners)',
    example: 'Delhi, Mumbai',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cities?: string;

  @ApiPropertyOptional({
    description: 'Business since date (for channel partners)',
    example: '2020-01-01',
  })
  @IsOptional()
  @IsString()
  businessSince?: string;

  @ApiPropertyOptional({
    description: 'About yourself (for channel partners)',
    example: 'Experienced real estate agent',
  })
  @IsOptional()
  @IsString()
  aboutYourSelf?: string;

  @ApiPropertyOptional({
    description: 'Set user active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Set phone verified status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;
}

export class AdminUserDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  name: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiPropertyOptional({ nullable: true })
  intent: string | null;

  @ApiPropertyOptional({ nullable: true })
  channelPartnerCode: string | null;

  @ApiPropertyOptional({ nullable: true })
  firmName: string | null;

  @ApiPropertyOptional({ nullable: true })
  cities: string | null;

  @ApiPropertyOptional({ nullable: true })
  businessSince: string | null;

  @ApiPropertyOptional({ nullable: true })
  aboutYourSelf: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    description: 'Whether KYC is completed',
    example: false,
  })
  kyc_completed: boolean;

  @ApiProperty({
    description: 'KYC verification steps status',
    example: {
      step1_live_photo: {
        live_photo_url: 'https://example.com/live-photo.jpg',
        live_photo_approved: false,
      },
      step2_aadhaar: {
        aadhaar_number: '123456789012',
        aadhaar_verified: true,
        digilocker_clientid: 'client_abc123',
        digilocker_metadata: {
          name: 'sdsds',
          gender: 'M',
          dob: '1992-03-10',
          mobile_number: 'sdsddsdsds',
        },
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
      digilocker_clientid: string | null;
      digilocker_metadata: {
        name?: string;
        gender?: string;
        dob?: string;
        mobile_number?: string;
      } | null;
    };
    step3_bank_details: {
      bank_details_filled: boolean;
    };
    step4_docusign_agreement: {
      docusign_agreement_signed: boolean;
    };
  };

  @ApiPropertyOptional({
    description: 'Live photo URL',
    example: 'https://example.com/live-photo.jpg',
    nullable: true,
  })
  live_photo_url: string | null;

  @ApiPropertyOptional({
    description: 'Aadhaar number',
    example: '123456789012',
    nullable: true,
  })
  aadhaar_number: string | null;

  @ApiPropertyOptional({
    description: 'DigiLocker client ID',
    example: 'client_abc123',
    nullable: true,
  })
  digilocker_clientid: string | null;

  @ApiPropertyOptional({
    description: 'DigiLocker metadata (name, gender, dob, mobile_number)',
    example: {
      name: 'Paras Gambhir',
      gender: 'M',
      dob: '1992-07-10',
      mobile_number: '9467813457',
    },
    nullable: true,
  })
  digilocker_metadata: {
    name?: string;
    gender?: string;
    dob?: string;
    mobile_number?: string;
  } | null;

  @ApiPropertyOptional({
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

  @ApiPropertyOptional({ description: 'Bank details admin approval status', nullable: true })
  bank_details_approved: boolean | null;

  @ApiPropertyOptional({ description: 'Bank details rejection reason', nullable: true })
  bank_rejection_reason: string | null;

  @ApiPropertyOptional({ description: 'Aadhaar admin approval status', nullable: true })
  aadhaar_admin_approved: boolean | null;

  @ApiPropertyOptional({ description: 'Aadhaar rejection reason', nullable: true })
  aadhaar_rejection_reason: string | null;

  @ApiPropertyOptional({ description: 'KYC rejection reason', nullable: true })
  kyc_rejection_reason: string | null;

  @ApiPropertyOptional({ description: 'Profile image URL', nullable: true })
  profileImage: string | null;
}

export class AdminBlockUserResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  isBlocked: boolean;
}

export class AdminUnblockUserResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  isBlocked: boolean;
}

export class AdminEditUserResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AdminUserDetailResponseDto })
  data: AdminUserDetailResponseDto;
}

