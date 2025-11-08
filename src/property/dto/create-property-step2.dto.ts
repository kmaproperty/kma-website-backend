import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export enum TenantType {
  FAMILY = 'family',
  BACHELORS = 'bachelors',
  COMPANY = 'company',
}

export enum CompanyOccupancy {
  OPEN_FOR_BOTH = 'open_for_both',
  MEN_ONLY = 'men_only',
  WOMEN_ONLY = 'women_only',
}

export enum RentAvailability {
  IMMEDIATELY = 'immediately',
  LATER = 'later',
}

export enum MaintenanceType {
  INCLUDE_IN_RENT = 'include_in_rent',
  SEPARATE = 'separate',
}

export enum SecurityDepositType {
  NONE = 'none',
  ONE_MONTH = '1_month',
  TWO_MONTH = '2_month',
  SIX_MONTH = '6_month',
  CUSTOM = 'custom',
}

export enum LockInType {
  NONE = 'none',
  ONE_MONTH = '1_month',
  TWO_MONTH = '2_month',
  SIX_MONTH = '6_month',
  CUSTOM = 'custom',
}

export enum BrokerageType {
  NONE = 'none',
  FIFTEEN_DAYS = '15_days',
  THIRTY_DAYS = '30_days',
  CUSTOM = 'custom',
}

export enum PlotAreaUnit {
  ACRES = 'acres',
  SQ_FT = 'sqft',
  SQ_YARDS = 'sq_yards',
  SQ_M = 'sq_m',
  MARLA = 'marla',
}

export enum YesNo {
  YES = 'yes',
  NO = 'no',
}

export enum PossessionStatus {
  IMMEDIATE = 'immediate',
  FUTURE = 'future',
}

export class CreatePropertyStep2Dto {
  @ApiProperty({
    description: 'Existing property ID to update',
    example: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiPropertyOptional({
    description: 'Floor number of the unit',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  floorNumber?: number;

  @ApiPropertyOptional({
    description: 'Total floors in the building',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalFloors?: number;

  @ApiPropertyOptional({ description: 'Flat/Unit number' })
  @IsOptional()
  @IsString()
  flatNumber?: string;

  @ApiPropertyOptional({ description: 'Tower/Block number or name' })
  @IsOptional()
  @IsString()
  towerBlock?: string;

  @ApiPropertyOptional({
    description: 'Property area (in Acres). Digits only.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  propertyAreaAcre?: number;

  @ApiPropertyOptional({ enum: TenantType })
  @IsOptional()
  @IsEnum(TenantType)
  tenantType?: TenantType;

  @ApiPropertyOptional({
    enum: CompanyOccupancy,
    description: 'Required when tenantType is company',
  })
  @IsOptional()
  @IsEnum(CompanyOccupancy)
  companyOccupancy?: CompanyOccupancy;

  @ApiPropertyOptional({ enum: RentAvailability })
  @IsOptional()
  @IsEnum(RentAvailability)
  rentAvailability?: RentAvailability;

  @ApiPropertyOptional({
    description: 'Required when rentAvailability is later',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  availableFromDate?: string;

  @ApiPropertyOptional({
    description: 'Monthly rent',
    minimum: 1500,
  })
  @IsOptional()
  @IsInt()
  @Min(1500)
  monthlyRent?: number;

  @ApiPropertyOptional({ enum: MaintenanceType })
  @IsOptional()
  @IsEnum(MaintenanceType)
  maintenanceType?: MaintenanceType;

  @ApiPropertyOptional({
    description: 'Required when maintenanceType is separate',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maintenanceChargeAmount?: number;

  @ApiPropertyOptional({ enum: SecurityDepositType })
  @IsOptional()
  @IsEnum(SecurityDepositType)
  securityDepositType?: SecurityDepositType;

  @ApiPropertyOptional({
    description: 'Required when securityDepositType is custom',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  securityDepositAmount?: number;

  @ApiPropertyOptional({ enum: LockInType })
  @IsOptional()
  @IsEnum(LockInType)
  lockInType?: LockInType;

  @ApiPropertyOptional({
    description: 'Required when lockInType is custom (months)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  lockInMonths?: number;

  @ApiPropertyOptional({ enum: BrokerageType })
  @IsOptional()
  @IsEnum(BrokerageType)
  brokerageType?: BrokerageType;

  @ApiPropertyOptional({ description: 'Required when brokerageType is custom' })
  @IsOptional()
  @IsInt()
  @Min(0)
  brokerageAmount?: number;

  @ApiPropertyOptional({ description: 'Is brokerage negotiable?' })
  @IsOptional()
  @IsBoolean()
  isBrokerageNegotiable?: boolean;

  @ApiPropertyOptional({ 
    description: 'Number of Staircases', 
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  noOfStaircases?: number;

  @ApiPropertyOptional({ 
    description: 'Private parking count', 
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  privateParking?: number;

  @ApiPropertyOptional({ 
    description: 'Public parking count', 
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  publicParking?: number;

  @ApiPropertyOptional({ description: 'Is rent negotiable?' })
  @IsOptional()
  @IsBoolean()
  isRentNegotiable?: boolean;

  @ApiPropertyOptional({ 
    description: 'DG & UPS Charge included?', 
    enum: ['yes', 'no']
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  dgUpsChargeIncluded?: 'yes' | 'no';

  @ApiPropertyOptional({ 
    description: 'Electricity charges included?', 
    enum: ['yes', 'no']
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  electricityChargeIncluded?: 'yes' | 'no';

  @ApiPropertyOptional({ 
    description: 'Water charges included?', 
    enum: ['yes', 'no']
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  waterChargeIncluded?: 'yes' | 'no';

  @ApiPropertyOptional({ 
    description: 'Expected Rent Increase (e.g., "10%" or "5000")', 
    example: '10%'
  })
  @IsOptional()
  @IsString()
  expectedRentIncrease?: string;

  @ApiPropertyOptional({ 
    description: 'Tax & Govt. charge included?', 
    enum: ['yes', 'no']
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  taxGovtChargeIncluded?: 'yes' | 'no';

  @ApiPropertyOptional({ 
    description: 'Is it pre-leased/pre-rented?', 
    enum: ['yes', 'no']
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  isPreLeasedRented?: 'yes' | 'no';

  @ApiPropertyOptional({ 
    description: 'Current Rent per Month (when pre-leased)', 
    example: 50000,
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentRentPerMonth?: number;

  @ApiPropertyOptional({ 
    description: 'Lease Years (when pre-leased)', 
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  leaseYears?: number;

  @ApiPropertyOptional({ 
    description: 'Property price', 
    example: 5000000,
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ 
    description: 'Plot Area (Saleable area should be at least 10)', 
    example: 1200,
    minimum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(10)
  plotArea?: number;

  @ApiPropertyOptional({ 
    description: 'Plot Area Unit',
    enum: PlotAreaUnit,
    example: 'sqft'
  })
  @IsOptional()
  @IsEnum(PlotAreaUnit)
  plotAreaUnit?: PlotAreaUnit;

  @ApiPropertyOptional({ 
    description: 'Plot number', 
    example: 'Plot-123'
  })
  @IsOptional()
  @IsString()
  plotNumber?: string;

  @ApiPropertyOptional({ 
    description: 'House number', 
    example: 'H-45'
  })
  @IsOptional()
  @IsString()
  houseNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Villa number', 
    example: 'Villa-12'
  })
  @IsOptional()
  @IsString()
  villaNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Transaction Type', 
    enum: ['new_booking', 'resale'],
    example: 'new_booking'
  })
  @IsOptional()
  @IsEnum(['new_booking', 'resale'])
  transactionType?: 'new_booking' | 'resale';

  @ApiPropertyOptional({ 
    description: 'Possession Status', 
    enum: PossessionStatus,
    example: 'immediate'
  })
  @IsOptional()
  @IsEnum(PossessionStatus)
  possessionStatus?: PossessionStatus;

  @ApiPropertyOptional({ 
    description: 'Possession Date', 
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  possessionDate?: string;

  @ApiPropertyOptional({ 
    description: 'Plot price', 
    example: 5000000,
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  plotPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Brokerage available', 
    enum: YesNo,
    example: 'yes'
  })
  @IsOptional()
  @IsEnum(YesNo)
  brokerage?: YesNo;

  @ApiPropertyOptional({ 
    description: 'Loan available', 
    enum: YesNo,
    example: 'yes'
  })
  @IsOptional()
  @IsEnum(YesNo)
  loanAvailable?: YesNo;

  @ApiPropertyOptional({ 
    description: 'Property facing direction (e.g., North, South, East, West)', 
    example: 'North'
  })
  @IsOptional()
  @IsString()
  facing?: string;

  @ApiPropertyOptional({ 
    description: 'Boundary wall present', 
    enum: YesNo,
    example: 'yes'
  })
  @IsOptional()
  @IsEnum(YesNo)
  boundaryWall?: YesNo;

  @ApiPropertyOptional({ 
    description: 'Number of open sides', 
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  noOfOpenSides?: number;

  @ApiPropertyOptional({ 
    description: 'Floors allowed for construction', 
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  floorsAllowedForConstruction?: number;

  @ApiPropertyOptional({ 
    description: 'Construction done', 
    enum: YesNo,
    example: 'yes'
  })
  @IsOptional()
  @IsEnum(YesNo)
  constructionDone?: YesNo;

  @ApiPropertyOptional({ 
    description: 'Construction type', 
    example: 'RCC'
  })
  @IsOptional()
  @IsString()
  constructionType?: string;

  @ApiPropertyOptional({ 
    description: 'Corner property', 
    enum: YesNo,
    example: 'yes'
  })
  @IsOptional()
  @IsEnum(YesNo)
  cornerProperty?: YesNo;

  @ApiPropertyOptional({ 
    description: 'Property description', 
    example: 'Beautiful property with modern amenities'
  })
  @IsOptional()
  @IsString()
  propertyDescription?: string;

  @ApiPropertyOptional({
    description: 'Age of the property in years',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  ageOfProperty?: number;
}
