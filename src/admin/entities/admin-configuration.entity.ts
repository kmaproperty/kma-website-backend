import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('admin_configurations')
export class AdminConfiguration extends BaseEntity {
  @Column({
    name: 'mobile_app_available',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  mobileAppAvailable: boolean;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phoneNumber: string | null;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude: number | null;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude: number | null;
}

