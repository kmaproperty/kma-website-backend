import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';

@Entity('kma_rating_reviews')
export class KmaRatingReview extends BaseEntity {
  @Column({
    name: 'rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: false,
  })
  rating: number;

  @Column({
    name: 'review',
    type: 'text',
    nullable: true,
  })
  review: string | null;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  phoneNumber: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'end_user_id',
    type: 'uuid',
    nullable: true,
  })
  endUserId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'end_user_id' })
  endUser: User | null;

  @Column({
    name: 'is_approved',
    type: 'boolean',
    default: false,
  })
  isApproved: boolean;

  @Column({
    name: 'approved_by_id',
    type: 'uuid',
    nullable: true,
  })
  approvedById: string | null;

  @Column({
    name: 'approved_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  approvedAt: Date | null;
}

