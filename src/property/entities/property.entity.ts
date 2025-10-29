import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterPropertyListingType } from './master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from './master-property-category-new.entity';
import { MasterCity } from './master-city.entity';
import { MasterSociety } from './master-society.entity';
import { MasterPropertyType } from './master-property-type.entity';
import { MasterBhkType } from './master-bhk-type.entity';

@Entity('properties')
export class Property extends BaseEntity {
  // Property Listing For (Sale/Rent)
  @Column({ type: 'uuid' })
  listingTypeId: string;

  @ManyToOne(() => MasterPropertyListingType)
  @JoinColumn({ name: 'listingTypeId' })
  listingType: MasterPropertyListingType;

  // Property Category (Residential/Commercial)
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => MasterPropertyCategoryNew)
  @JoinColumn({ name: 'categoryId' })
  category: MasterPropertyCategoryNew;

  // City
  @Column({ type: 'uuid' })
  cityId: string;

  @ManyToOne(() => MasterCity)
  @JoinColumn({ name: 'cityId' })
  city: MasterCity;

  // Society/Building/Apartment Name (includes locality name)
  @Column({ type: 'uuid' })
  societyId: string;

  @ManyToOne(() => MasterSociety)
  @JoinColumn({ name: 'societyId' })
  society: MasterSociety;

  // Property Type (Flat/Apartment, Villa, etc.)
  @Column({ type: 'uuid' })
  propertyTypeId: string;

  @ManyToOne(() => MasterPropertyType)
  @JoinColumn({ name: 'propertyTypeId' })
  propertyType: MasterPropertyType;

  // Rooms / BHK
  @Column({ type: 'uuid' })
  bhkTypeId: string;

  @ManyToOne(() => MasterBhkType)
  @JoinColumn({ name: 'bhkTypeId' })
  bhkType: MasterBhkType;

  // Age of Property (in Years)
  @Column({ type: 'int' })
  ageOfProperty: number;

  // User who created the listing
  @Column({ type: 'uuid' })
  userId: string;

  // Property status (lifecycle: draft, active, inactive, sold, rented)
  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'inactive', 'sold', 'rented'],
    default: 'draft',
  })
  status: string;

  // Completion step tracks progress through posting workflow (1-5)
  // Step 1: Basic details, Step 2: Additional details, Step 3: Media, Step 4: Review, Step 5: Completed
  @Column({
    type: 'int',
    name: 'completion_step',
    default: 0,
    comment: 'Current completion step (0=not started, 1-4=in progress, 5=completed)',
  })
  completionStep: number;

  // Property facing direction (optional)
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'facing',
  })
  facing: string | null;
}
