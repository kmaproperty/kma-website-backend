import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';

export enum AgreementStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  VOIDED = 'voided',
}

@Entity('channel_partner_agreements')
export class ChannelPartnerAgreement extends BaseEntity {
  @Column({
    name: 'userId',
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    name: 'envelopeId',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  envelopeId: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    nullable: false,
    default: AgreementStatus.SENT,
  })
  status: AgreementStatus;

  @Column({
    name: 'completedAt',
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt: Date | null;

  @Column({
    name: 'returnUrl',
    type: 'text',
    nullable: true,
  })
  returnUrl: string | null;
}

