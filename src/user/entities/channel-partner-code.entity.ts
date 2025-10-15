import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('channel_partner_codes')
export class ChannelPartnerCode extends BaseEntity {
  @Column({
    name: 'code',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  code: string;
}
