import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterPropertyListingType } from './master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from './master-property-category-new.entity';
import { MasterCity } from './master-city.entity';
import { MasterSociety } from './master-society.entity';
import { MasterPropertyType } from './master-property-type.entity';
import { MasterBhkType } from './master-bhk-type.entity';
import { TransactionType } from '../enum/transaction-type.enum';
import { ConstructionStatus } from '../enum/construction-status.enum';
import { PossessionTime } from '../enum/possession-time.enum';

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
  // Completion step tracks progress through posting workflow (1-5)
  // Step 1: Basic details, Step 2: Additional details, Step 3: Media, Step 4: Review, Step 5: Completed
  @Column({
    type: 'int',
    name: 'completion_step',
    default: 0,
    comment:
      'Current completion step (0=not started, 1-4=in progress, 5=completed)',
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

  // Transaction Type (New Booking/Resale)
  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: true,
  })
  transactionType: TransactionType | null;

  // Construction Status (Ready to Move/Under Construction)
  @Column({
    type: 'enum',
    enum: ConstructionStatus,
    nullable: true,
  })
  constructionStatus: ConstructionStatus | null;

  // Possession By (for Under Construction properties)
  @Column({
    type: 'enum',
    enum: PossessionTime,
    nullable: true,
  })
  possessionBy: PossessionTime | null;

  // Possession Time (for Under Construction properties)
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  possessionTime: string | null;
}
