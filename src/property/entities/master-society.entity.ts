import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterCity } from './master-city.entity';
import { MasterLocality } from './master-locality.entity';

@Entity('master_societies')
export class MasterSociety extends BaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'uuid' })
  cityId: string;

  @ManyToOne(() => MasterCity)
  @JoinColumn({ name: 'cityId' })
  city: MasterCity;

  @Column({ type: 'uuid' })
  localityId: string;

  @ManyToOne(() => MasterLocality)
  @JoinColumn({ name: 'localityId' })
  locality: MasterLocality;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string;
}
