import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

export type ReferralPropertyType = 'Buy' | 'Sell' | 'Rent';
export type ReferralEnquiryStatus = 'Pending' | 'In Process' | 'Deal Closed';

@Entity('referral_enquiries')
export class ReferralEnquiry extends BaseEntity {
  @Column({ name: 'referrer_name', type: 'varchar', length: 255 })
  referrerName: string;

  @Column({ name: 'referrer_phone', type: 'varchar', length: 20 })
  referrerPhone: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255 })
  clientName: string;

  @Column({ name: 'client_mobile', type: 'varchar', length: 20 })
  clientMobile: string;

  @Column({ name: 'property_type', type: 'varchar', length: 20 })
  propertyType: ReferralPropertyType;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ name: 'channel_partner_id', type: 'varchar', length: 100, nullable: true })
  channelPartnerId: string | null;

  @Column({ name: 'status', type: 'varchar', length: 30, default: "'Pending'" })
  status: ReferralEnquiryStatus;

  @Column({ name: 'coins_credited', type: 'int', default: 0 })
  coinsCredited: number;
}
