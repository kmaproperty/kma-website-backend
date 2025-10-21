import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterPropertyCategoryNew } from './master-property-category-new.entity';
import { MasterPropertyListingType } from './master-property-listing-type.entity';

@Entity('master_property_types')
export class MasterPropertyType extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => MasterPropertyCategoryNew)
  @JoinColumn({ name: 'categoryId' })
  category: MasterPropertyCategoryNew;

  @Column({ type: 'uuid' })
  listingTypeId: string;

  @ManyToOne(() => MasterPropertyListingType)
  @JoinColumn({ name: 'listingTypeId' })
  listingType: MasterPropertyListingType;
}