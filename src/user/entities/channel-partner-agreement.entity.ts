import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('channel_partner_agreements')
export class ChannelPartnerAgreement extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  envelopeId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'sent',
  })
  status: 'created' | 'sent' | 'completed' | 'declined' | 'voided';

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  returnUrl: string | null;
}


