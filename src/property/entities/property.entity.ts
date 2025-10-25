import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterPropertyListingType } from './master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from './master-property-category-new.entity';
import { MasterCity } from './master-city.entity';
import { MasterSociety } from './master-society.entity';
import { MasterLocality } from './master-locality.entity';
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

  // Society/Building/Apartment Name
  @Column({ type: 'uuid' })
  societyId: string;

  @ManyToOne(() => MasterSociety)
  @JoinColumn({ name: 'societyId' })
  society: MasterSociety;

  // Locality/Sector
  @Column({ type: 'uuid' })
  localityId: string;

  @ManyToOne(() => MasterLocality)
  @JoinColumn({ name: 'localityId' })
  locality: MasterLocality;

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

  // Custom BHK if user selected "Other"
  @Column({ type: 'varchar', length: 50, nullable: true })
  customBhk: string;

  // Number of bathrooms
  @Column({ type: 'int' })
  bathrooms: number;

  // Built-up Area
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  builtUpAreaSqFt: number;

  // Carpet Area
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carpetAreaSqFt: number;

  // Age of Property (in Years)
  @Column({ type: 'int' })
  ageOfProperty: number;

  // User who created the listing
  @Column({ type: 'uuid' })
  userId: string;

  // Property status
  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'inactive', 'sold', 'rented'],
    default: 'draft',
  })
  status: string;
}
