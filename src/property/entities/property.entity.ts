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

  // Property status
  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'inactive', 'sold', 'rented'],
    default: 'draft',
  })
  status: string;

  // Step 2 fields
  @Column({ type: 'int', nullable: true })
  floorNumber: number | null;

  @Column({ type: 'int', nullable: true })
  totalFloors: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  flatNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  towerBlock: string | null;

  @Column({ type: 'int', nullable: true })
  propertyAreaAcre: number | null;

  @Column({
    type: 'enum',
    enum: ['family', 'bachelors', 'company'],
    nullable: true,
  })
  tenantType: 'family' | 'bachelors' | 'company' | null;

  @Column({
    type: 'enum',
    enum: ['open_for_both', 'men_only', 'women_only'],
    nullable: true,
  })
  companyOccupancy: 'open_for_both' | 'men_only' | 'women_only' | null;

  @Column({ type: 'enum', enum: ['immediately', 'later'], nullable: true })
  rentAvailability: 'immediately' | 'later' | null;

  @Column({ type: 'date', nullable: true })
  availableFromDate: Date | null;

  @Column({ type: 'int', nullable: true })
  monthlyRent: number | null;

  @Column({
    type: 'enum',
    enum: ['include_in_rent', 'separate'],
    nullable: true,
  })
  maintenanceType: 'include_in_rent' | 'separate' | null;

  @Column({ type: 'int', nullable: true })
  maintenanceChargeAmount: number | null;

  @Column({
    type: 'enum',
    enum: ['none', '1_month', '2_month', '6_month', 'custom'],
    nullable: true,
  })
  securityDepositType:
    | 'none'
    | '1_month'
    | '2_month'
    | '6_month'
    | 'custom'
    | null;

  @Column({ type: 'int', nullable: true })
  securityDepositAmount: number | null;

  @Column({
    type: 'enum',
    enum: ['none', '1_month', '2_month', '6_month', 'custom'],
    nullable: true,
  })
  lockInType: 'none' | '1_month' | '2_month' | '6_month' | 'custom' | null;

  @Column({ type: 'int', nullable: true })
  lockInMonths: number | null;

  @Column({
    type: 'enum',
    enum: ['none', '15_days', '30_days', 'custom'],
    nullable: true,
  })
  brokerageType: 'none' | '15_days' | '30_days' | 'custom' | null;

  @Column({ type: 'int', nullable: true })
  brokerageAmount: number | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  isBrokerageNegotiable: boolean | null;
}
