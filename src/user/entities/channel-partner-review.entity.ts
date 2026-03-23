import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';

@Entity('channel_partner_reviews')
export class ChannelPartnerReview extends BaseEntity {
  @Column({
    name: 'channel_partner_id',
    type: 'uuid',
    nullable: false,
  })
  channelPartnerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'channel_partner_id' })
  channelPartner: User;

  @Column({
    name: 'reviewer_id',
    type: 'uuid',
    nullable: false,
  })
  reviewerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({
    name: 'rating',
    type: 'numeric',
    nullable: false,
  })
  rating: number;

  @Column({
    name: 'review',
    type: 'text',
    nullable: true,
  })
  review: string | null;
}
