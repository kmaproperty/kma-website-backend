import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterCity } from './master-city.entity';

@Entity('master_localities')
export class MasterLocality extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  sector: string;

  @Column({ type: 'uuid' })
  cityId: string;

  @ManyToOne(() => MasterCity)
  @JoinColumn({ name: 'cityId' })
  city: MasterCity;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;
}
