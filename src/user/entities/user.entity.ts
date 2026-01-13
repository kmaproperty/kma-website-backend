import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { UserRole } from '../enum/user-role.enum';
import { UserIntent } from '../enum/user-intent.enum';
import { KycStatus } from '../enum/kyc-status.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email: string | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
  })
  phone: string;

  @Column({
    name: 'intent',
    type: 'enum',
    enum: UserIntent,
    nullable: true,
  })
  intent: UserIntent | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'is_blocked',
    type: 'boolean',
    default: false,
  })
  isBlocked: boolean;

  @Column({
    name: 'phone_verified',
    type: 'boolean',
    default: false,
  })
  phoneVerified: boolean;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.OWNER,
  })
  role: UserRole;

  @Column({
    name: 'token',
    type: 'text',
    nullable: true,
  })
  token: string | null;

  @Column({
    name: 'refresh_token',
    type: 'text',
    nullable: true,
  })
  refreshToken: string | null;

  @Column({
    name: 'channel_partner_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  channelPartnerCode: string | null;

  @Column({
    name: 'firm_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  firmName: string | null;

  @Column({
    name: 'cities',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  cities: string | null;

  @Column({
    name: 'business_since',
    type: 'date',
    nullable: true,
  })
  businessSince: string | null;

  @Column({
    name: 'about_yourself',
    type: 'text',
    nullable: true,
  })
  aboutYourSelf: string | null;

  @Column({
    name: 'profile_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  profileImage: string | null;

  // Step 1: Live Photo Upload
  @Column({
    name: 'live_photo_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  livePhotoUrl: string | null;

  @Column({
    name: 'live_photo_approved',
    type: 'boolean',
    default: false,
  })
  livePhotoApproved: boolean;

  // Step 2: Aadhaar Verification
  @Column({
    name: 'aadhaar_number',
    type: 'varchar',
    length: 12,
    nullable: true,
  })
  aadhaarNumber: string | null;

  @Column({
    name: 'aadhaar_verified',
    type: 'boolean',
    default: false,
  })
  aadhaarVerified: boolean;

  // Step 3: Bank Details
  @Column({
    name: 'bank_details_filled',
    type: 'boolean',
    default: false,
  })
  bankDetailsFilled: boolean;

  // Step 4: DocuSign Agreement
  @Column({
    name: 'docusign_agreement_signed',
    type: 'boolean',
    default: false,
  })
  docusignAgreementSigned: boolean;

  // KYC Completion Status (true when all 4 steps are completed and approved)
  @Column({
    name: 'kyc_completed',
    type: 'boolean',
    default: false,
  })
  kycCompleted: boolean;

  // KYC Status (pending, in_review, approved, rejected)
  @Column({
    name: 'kyc_status',
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
    nullable: true,
  })
  kycStatus: KycStatus | null;
}
