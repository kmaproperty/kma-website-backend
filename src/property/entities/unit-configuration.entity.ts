import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterSociety } from './master-society.entity';
import { MasterPropertyType } from './master-property-type.entity';
import { MasterBhkType } from './master-bhk-type.entity';

@Entity('unit_configurations')
export class UnitConfiguration extends BaseEntity {
  @Column({ type: 'uuid' })
  societyId: string;

  @ManyToOne(() => MasterSociety)
  @JoinColumn({ name: 'societyId' })
  society: MasterSociety;

  @Column({ type: 'uuid' })
  propertyTypeId: string;

  @ManyToOne(() => MasterPropertyType)
  @JoinColumn({ name: 'propertyTypeId' })
  propertyType: MasterPropertyType;

  @Column({ type: 'uuid' })
  bhkTypeId: string;

  @ManyToOne(() => MasterBhkType)
  @JoinColumn({ name: 'bhkTypeId' })
  bhkType: MasterBhkType;

  @Column({ type: 'int' })
  bathrooms: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  builtUpAreaSqFt: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carpetAreaSqFt: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;
}
