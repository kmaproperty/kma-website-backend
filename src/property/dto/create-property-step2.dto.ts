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

export class CreatePropertyStep2Dto {
  @ApiProperty({
    description: 'Existing property ID to update',
    example: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'Floor number of the unit',
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  floorNumber: number;

  @ApiProperty({
    description: 'Total floors in the building',
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  totalFloors: number;

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

  @ApiProperty({ enum: RentAvailability })
  @IsEnum(RentAvailability)
  rentAvailability: RentAvailability;

  @ApiPropertyOptional({
    description: 'Required when rentAvailability is later',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  availableFromDate?: string;

  @ApiProperty({
    description: 'Monthly rent',
    minimum: 1500,
    maximum: 2000000,
  })
  @IsInt()
  @Min(1500)
  @Max(2000000)
  monthlyRent: number;

  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @ApiPropertyOptional({
    description: 'Required when maintenanceType is separate',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maintenanceChargeAmount?: number;

  @ApiProperty({ enum: SecurityDepositType })
  @IsEnum(SecurityDepositType)
  securityDepositType: SecurityDepositType;

  @ApiPropertyOptional({
    description: 'Required when securityDepositType is custom',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  securityDepositAmount?: number;

  @ApiProperty({ enum: LockInType })
  @IsEnum(LockInType)
  lockInType: LockInType;

  @ApiPropertyOptional({
    description: 'Required when lockInType is custom (months)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  lockInMonths?: number;

  @ApiProperty({ enum: BrokerageType })
  @IsEnum(BrokerageType)
  brokerageType: BrokerageType;

  @ApiPropertyOptional({ description: 'Required when brokerageType is custom' })
  @IsOptional()
  @IsInt()
  @Min(0)
  brokerageAmount?: number;

  @ApiPropertyOptional({ description: 'Is brokerage negotiable?' })
  @IsOptional()
  @IsBoolean()
  isBrokerageNegotiable?: boolean;
}
