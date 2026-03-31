import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { MasterPropertyListingType } from './master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from './master-property-category-new.entity';
import { MasterCity } from './master-city.entity';
import { MasterSociety } from './master-society.entity';
import { MasterLocality } from './master-locality.entity';
import { MasterPropertyType } from './master-property-type.entity';
import { MasterBhkType } from './master-bhk-type.entity';
import { MasterBuiltUpArea } from './master-built-up-area.entity';
import { TransactionType } from '../enum/transaction-type.enum';
import { ConstructionStatus } from '../enum/construction-status.enum';
import { LocationHub } from '../enum/location-hub.enum';
import { ZoneType } from '../enum/zone-type.enum';
import { PropertyCondition } from '../enum/property-condition.enum';
import { WallConstructionStatus } from '../enum/wall-construction-status.enum';
import { Ownership } from '../enum/ownership.enum';
import { AreaUnit } from '../enum/area-unit.enum';
import { DistanceUnit } from '../enum/distance-unit.enum';
import { PlotLandType } from '../enum/plot-land-type.enum';
import { PropertyStatus, DeactivationReason, VerificationStatus } from '../enum/property-status.enum';
import { User } from '../../user/entities/user.entity';

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
  @Column({ type: 'uuid', nullable: true })
  cityId: string | null;

  @ManyToOne(() => MasterCity, { nullable: true })
  @JoinColumn({ name: 'cityId' })
  city: MasterCity | null;

  // Society/Building/Apartment Name (includes locality name)
  @Column({ type: 'uuid', nullable: true })
  societyId: string | null;

  @ManyToOne(() => MasterSociety, { nullable: true })
  @JoinColumn({ name: 'societyId' })
  society: MasterSociety | null;

  // Locality
  @Column({ type: 'uuid', nullable: true })
  localityId: string | null;

  @ManyToOne(() => MasterLocality, { nullable: true })
  @JoinColumn({ name: 'localityId' })
  locality: MasterLocality | null;

  // Property Type (Flat/Apartment, Villa, etc.)
  @Column({ type: 'uuid', nullable: true })
  propertyTypeId: string | null;

  @ManyToOne(() => MasterPropertyType, { nullable: true })
  @JoinColumn({ name: 'propertyTypeId' })
  propertyType: MasterPropertyType | null;

  // Rooms / BHK
  @Column({ type: 'uuid', nullable: true })
  bhkTypeId: string | null;

  @ManyToOne(() => MasterBhkType, { nullable: true })
  @JoinColumn({ name: 'bhkTypeId' })
  bhkType: MasterBhkType | null;

  @Column({ type: 'uuid', nullable: true })
  builtUpAreaId: string | null;

  @ManyToOne(() => MasterBuiltUpArea, { nullable: true })
  @JoinColumn({ name: 'builtUpAreaId' })
  builtUpAreaMetadata: MasterBuiltUpArea | null;

  // Age of Property (in Years)
  @Column({ type: 'int', nullable: true })
  ageOfProperty: number | null;

  // User who created the listing
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Property status (lifecycle: draft, pending_review, active, rejected, deactivated)
  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.DRAFT,
  })
  status: PropertyStatus;

  // Rejection reason when property is rejected
  @Column({
    type: 'text',
    nullable: true,
    name: 'rejection_reason',
  })
  rejectionReason: string | null;

  // Verification status
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
    name: 'is_verified',
  })
  isVerified: VerificationStatus;

  // Listing score (0-100): 80% when all steps completed, 100% when verified
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    name: 'listing_score',
    comment: 'Listing score: 80% when all steps completed, 100% when verified',
  })
  listingScore: number;

  // Timestamp when property was activated
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'activated_at',
  })
  activatedAt: Date | null;

  // Deactivation reason when property is deactivated
  @Column({
    type: 'enum',
    enum: DeactivationReason,
    nullable: true,
    name: 'deactivation_reason',
  })
  deactivationReason: DeactivationReason | null;

  // Timestamp when property was deactivated
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'deactivated_on',
  })
  deactivatedOn: Date | null;

  @Column({
    type: 'boolean',
    name: 'is_deleted',
    default: false,
  })
  isDeleted: boolean;

  @Column({
    type: 'boolean',
    name: 'is_top',
    default: false,
  })
  isTop: boolean;

  @Column({
    type: 'boolean',
    name: 'is_featured',
    default: false,
  })
  isFeatured: boolean;

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
    type: 'text',
    array: true,
    nullable: true,
    name: 'tenantType',
  })
  tenantType: string[] | null;

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

  // Property price
  @Column({ type: 'int', nullable: true })
  price: number | null;

  // Plot number
  @Column({ type: 'varchar', length: 100, nullable: true })
  plotNumber: string | null;

  // House number
  @Column({ type: 'varchar', length: 100, nullable: true })
  houseNumber: string | null;

  // Villa number
  @Column({ type: 'varchar', length: 100, nullable: true })
  villaNumber: string | null;

  // Possession status (immediate/future)
  @Column({
    type: 'enum',
    enum: ['immediate', 'future'],
    nullable: true,
  })
  possessionStatus: 'immediate' | 'future' | null;

  // Possession date
  @Column({ type: 'date', nullable: true })
  possessionDate: Date | null;

  // Plot price
  @Column({ type: 'int', nullable: true })
  plotPrice: number | null;

  // Brokerage (yes/no)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  brokerage: 'yes' | 'no' | null;

  // Loan available (yes/no)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  loanAvailable: 'yes' | 'no' | null;

  // Boundary wall (yes/no)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  boundaryWall: 'yes' | 'no' | null;

  // Number of open sides
  @Column({ type: 'int', nullable: true })
  noOfOpenSides: number | null;

  // Floors allowed for construction
  @Column({ type: 'int', nullable: true })
  floorsAllowedForConstruction: number | null;

  // Construction done (yes/no)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  constructionDone: 'yes' | 'no' | null;

  // Construction type
  @Column({ type: 'varchar', length: 100, nullable: true })
  constructionType: string | null;

  // Corner property (yes/no)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  cornerProperty: 'yes' | 'no' | null;

  // Property description
  @Column({ type: 'text', nullable: true })
  propertyDescription: string | null;

  // Step 3 fields
  // Additional rooms (stored as simple comma-separated array)
  @Column({ type: 'simple-array', nullable: true })
  additionalRooms: string[] | null;

  // Reserved parking counts
  @Column({ type: 'int', nullable: true })
  reservedParkingCovered: number | null;

  @Column({ type: 'int', nullable: true })
  reservedParkingOpen: number | null;

  // Private parking (Step 2)
  @Column({ type: 'int', nullable: true })
  privateParking: number | null;

  // Public parking (Step 2)
  @Column({ type: 'int', nullable: true })
  publicParking: number | null;

  // Power backup
  @Column({
    type: 'enum',
    enum: ['No Back-up', 'Available'],
    nullable: true,
  })
  powerBackup: 'No Back-up' | 'Available' | null;

  // Furnish type
  @Column({
    type: 'enum',
    enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    nullable: true,
  })
  furnishType: 'Furnished' | 'Semi-Furnished' | 'Unfurnished' | null;

  // Furnishings with counts (stored as JSON)
  @Column({ type: 'jsonb', nullable: true })
  furnishingsCounts: { item: string; count: number }[] | null;

  // Seating capacity details
  @Column({ type: 'int', nullable: true })
  minNumberOfSeats: number | null;

  @Column({ type: 'int', nullable: true })
  maxNumberOfSeats: number | null;

  @Column({ type: 'int', nullable: true })
  numberOfCabins: number | null;

  @Column({ type: 'int', nullable: true })
  numberOfMeetingRooms: number | null;

  @Column({ type: 'int', nullable: true })
  conferenceRoom: number | null;

  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  receptionArea: 'yes' | 'no' | null;

  // Amenities selection
  @Column({ type: 'simple-array', nullable: true })
  amenities: string[] | null;

  // Water source
  @Column({
    type: 'enum',
    enum: ['Municipal Supply', 'BoreWell/ Underground', 'other'],
    nullable: true,
  })
  waterSource: 'Municipal Supply' | 'BoreWell/ Underground' | 'other' | null;

  // Lift availability
  @Column({ type: 'boolean', nullable: true })
  isLiftAvailable: boolean | null;

  // Number of Staircases (optional)
  @Column({ type: 'int', nullable: true })
  noOfStaircases: number | null;

  // Rent Negotiable (optional)
  @Column({ type: 'boolean', nullable: true })
  isRentNegotiable: boolean | null;

  // Private washrooms count (optional)
  @Column({ type: 'int', nullable: true })
  privateWashrooms: number | null;

  // Public washrooms count (optional)
  @Column({ type: 'int', nullable: true })
  publicWashrooms: number | null;

  // DG & UPS Charge included (optional)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  dgUpsChargeIncluded: 'yes' | 'no' | null;

  // Electricity charges included (optional)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  electricityChargeIncluded: 'yes' | 'no' | null;

  // Water charges included (optional)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  waterChargeIncluded: 'yes' | 'no' | null;

  // Expected Rent Increase (optional, in percentage or amount)
  @Column({ type: 'varchar', length: 100, nullable: true })
  expectedRentIncrease: string | null;

  // Expected Return on Investment (optional, in percentage or amount)
  @Column({ type: 'varchar', length: 100, nullable: true })
  expectedReturnOnInvestment: string | null;

  // Tax & Govt. charge included (optional)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  taxGovtChargeIncluded: 'yes' | 'no' | null;

  // Is it pre-leased/pre-rented (optional)
  @Column({
    type: 'enum',
    enum: ['yes', 'no'],
    nullable: true,
  })
  isPreLeasedRented: 'yes' | 'no' | null;

  // Current Rent per Month (optional, when pre-leased)
  @Column({ type: 'int', nullable: true })
  currentRentPerMonth: number | null;

  // Lease Years (optional, when pre-leased)
  @Column({ type: 'int', nullable: true })
  leaseYears: number | null;

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
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  possessionBy: string | null;

  // Possession Time (for Under Construction properties)
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  possessionTime: string | null;

  // Plot Area (optional)
  @Column({ type: 'int', nullable: true })
  plotArea: number | null;

  // Plot Area Unit (optional, e.g., "sq ft", "sq yd", "sq m", "acre")
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  plotAreaUnit: string | null;

  // Plot Length (optional)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  plotLength: number | null;

  // Plot Length Unit (optional)
  @Column({
    type: 'enum',
    enum: DistanceUnit,
    nullable: true,
  })
  plotLengthUnit: DistanceUnit | null;

  // Plot Width (optional)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  plotWidth: number | null;

  // Plot Width Unit (optional)
  @Column({
    type: 'enum',
    enum: DistanceUnit,
    nullable: true,
  })
  plotWidthUnit: DistanceUnit | null;

  // Width of Facing Road (optional)
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  plotFacingRoadWidth: string | null;

  // Location Hub (optional)
  @Column({
    type: 'enum',
    enum: LocationHub,
    nullable: true,
  })
  locationHub: LocationHub | null;

  // Other Location Hub (when locationHub is 'others')
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  otherLocationHub: string | null;

  // Zone Type (optional)
  @Column({
    type: 'enum',
    enum: ZoneType,
    nullable: true,
  })
  zoneType: ZoneType | null;

  // Property Condition (optional)
  @Column({
    type: 'enum',
    enum: PropertyCondition,
    nullable: true,
  })
  propertyCondition: PropertyCondition | null;

  // Wall Construction Status (optional)
  @Column({
    type: 'enum',
    enum: WallConstructionStatus,
    nullable: true,
  })
  wallConstructionStatus: WallConstructionStatus | null;

  // Ownership (optional)
  @Column({
    type: 'enum',
    enum: Ownership,
    nullable: true,
  })
  ownership: Ownership | null;

  // Built Up Area (optional)
  @Column({ type: 'int', nullable: true })
  builtUpArea: number | null;

  // Built Up Area Unit (optional)
  @Column({
    type: 'enum',
    enum: AreaUnit,
    nullable: true,
  })
  builtUpAreaUnit: AreaUnit | null;

  // Carpet Area (optional)
  @Column({ type: 'int', nullable: true })
  carpetArea: number | null;

  // Carpet Area Unit (optional)
  @Column({
    type: 'enum',
    enum: AreaUnit,
    nullable: true,
  })
  carpetAreaUnit: AreaUnit | null;

  // Suitable For (array of options)
  @Column({ type: 'simple-array', nullable: true })
  suitableFor: string[] | null;

  // Entrance Width (optional)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  entranceWidth: number | null;

  // Entrance Width Unit (optional)
  @Column({
    type: 'enum',
    enum: DistanceUnit,
    nullable: true,
  })
  entranceWidthUnit: DistanceUnit | null;

  // Ceiling Height (optional)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ceilingHeight: number | null;

  // Ceiling Height Unit (optional)
  @Column({
    type: 'enum',
    enum: DistanceUnit,
    nullable: true,
  })
  ceilingHeightUnit: DistanceUnit | null;

  // Located Near (array of options)
  @Column({ type: 'simple-array', nullable: true })
  locatedNear: string[] | null;

  // Plot/Land Type (optional)
  @Column({
    type: 'enum',
    enum: PlotLandType,
    nullable: true,
  })
  plotLandType: PlotLandType | null;

  // Construction Type Options (array - Shed, Room, Washroom, Other)
  @Column({ type: 'simple-array', nullable: true })
  constructionTypeOptions: string[] | null;

  // Step 4 fields - Photos and Videos
  // Property photos with metadata (stored as JSONB)
  @Column({ type: 'jsonb', nullable: true })
  photos: { fileKey: string; view: string; isCoverImage?: boolean }[] | null;

  // Property videos with metadata (stored as JSONB)
  @Column({ type: 'jsonb', nullable: true })
  videos: { fileKey: string; format: string }[] | null;

  @Column({ type: 'text', nullable: true })
  adminReviewComment: string | null;

  @Column({ type: 'uuid', nullable: true })
  adminReviewedBy: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  adminReviewedAt: Date | null;

  // Expiry date for approved properties (15 days from approval)
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  expiresAt: Date | null;
}
