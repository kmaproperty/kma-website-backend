import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterBhkType } from './master-bhk-type.entity';
import { MasterSociety } from './master-society.entity';
import { MasterLocality } from './master-locality.entity';

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

  @Column({ type: 'int', name: 'no_of_bedrooms', nullable: true })
  noOfBedrooms: number | null;

  @Column({ type: 'int', name: 'balconies', nullable: true })
  balconies: number | null;

  @Column({ type: 'uuid', name: 'bhk_type_id' })
  bhkTypeId: string;

  @Column({ type: 'uuid', name: 'society_id', nullable: true })
  societyId: string | null;

  @Column({ type: 'uuid', name: 'locality_id', nullable: true })
  localityId: string | null;

  @ManyToOne(() => MasterBhkType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bhk_type_id' })
  bhkType: MasterBhkType;

  @ManyToOne(() => MasterSociety, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'society_id' })
  society: MasterSociety | null;

  @ManyToOne(() => MasterLocality, { nullable: true })
  @JoinColumn({ name: 'locality_id' })
  locality: MasterLocality | null;
}
