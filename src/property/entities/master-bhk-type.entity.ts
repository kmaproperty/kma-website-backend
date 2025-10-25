import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterPropertyType } from './master-property-type.entity';
import { MasterSociety } from './master-society.entity';

@Entity('master_bhk_types')
export class MasterBhkType extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'int' })
  sortOrder: number;

  @Column({ type: 'uuid' })
  propertyTypeId: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @ManyToOne(() => MasterPropertyType)
  @JoinColumn({ name: 'propertyTypeId' })
  propertyType: MasterPropertyType;

  @ManyToOne(() => MasterSociety, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'societyId' })
  society: MasterSociety;
}
