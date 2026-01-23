import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Property } from './property.entity';
import { User } from '../../user/entities/user.entity';
import { Admin } from '../../admin/entities/admin.entity';

export enum PropertyVerificationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted', // Media uploaded, waiting for admin review
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('property_verification_requests')
@Index(['propertyId', 'status'])
@Index(['verificationToken'], { unique: true })
export class PropertyVerificationRequest extends BaseEntity {
  @Column({
    name: 'property_id',
    type: 'uuid',
    nullable: false,
  })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: false })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({
    name: 'requested_by',
    type: 'uuid',
    nullable: false,
  })
  requestedBy: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'requested_by' })
  requestedByUser: User;

  @Column({
    name: 'verification_token',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  verificationToken: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PropertyVerificationStatus,
    default: PropertyVerificationStatus.PENDING,
    nullable: false,
  })
  status: PropertyVerificationStatus;

  @Column({
    name: 'live_photos',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of live photo objects with fileKey and metadata',
  })
  livePhotos: Array<{
    fileKey: string;
    view?: string;
    uploadedAt: Date;
  }> | null;

  @Column({
    name: 'live_videos',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of live video objects with fileKey and metadata',
  })
  liveVideos: Array<{
    fileKey: string;
    format?: string;
    uploadedAt: Date;
  }> | null;

  @Column({
    name: 'submitted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  submittedAt: Date | null;

  @Column({
    name: 'reviewed_by',
    type: 'uuid',
    nullable: true,
  })
  reviewedBy: string | null;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedByAdmin: Admin | null;

  @Column({
    name: 'reviewed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  reviewedAt: Date | null;

  @Column({
    name: 'rejection_reason',
    type: 'text',
    nullable: true,
  })
  rejectionReason: string | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    nullable: false,
    comment: 'Verification link expiration time (24 hours from creation)',
  })
  expiresAt: Date;
}

