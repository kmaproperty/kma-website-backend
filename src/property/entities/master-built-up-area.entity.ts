import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterBhkType } from './master-bhk-type.entity';
import { MasterSociety } from './master-society.entity';

@Entity('master_built_up_areas')
export class MasterBuiltUpArea extends BaseEntity {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'super_built_up_area',
  })
  superBuiltUpArea: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'carpet_area' })
  carpetArea: number;

  @Column({ type: 'int', name: 'no_of_bathrooms' })
  noOfBathrooms: number;

  @Column({ type: 'uuid', name: 'bhk_type_id' })
  bhkTypeId: string;

  @Column({ type: 'uuid', name: 'society_id' })
  societyId: string;

  @ManyToOne(() => MasterBhkType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bhk_type_id' })
  bhkType: MasterBhkType;

  @ManyToOne(() => MasterSociety, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'society_id' })
  society: MasterSociety;
}
