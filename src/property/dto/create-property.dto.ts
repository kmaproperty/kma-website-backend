import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsObject,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
  ValidateIf,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enum/transaction-type.enum';
import { ConstructionStatus } from '../enum/construction-status.enum';
import { PossessionStatus } from './create-property-step2.dto';
import { LocationHub } from '../enum/location-hub.enum';
import { ZoneType } from '../enum/zone-type.enum';
import { PropertyCondition } from '../enum/property-condition.enum';
import { WallConstructionStatus } from '../enum/wall-construction-status.enum';
import { Ownership } from '../enum/ownership.enum';
import { AreaUnit } from '../enum/area-unit.enum';
import { SuitableFor } from '../enum/suitable-for.enum';
import { DistanceUnit } from '../enum/distance-unit.enum';
import { LocatedNear } from '../enum/located-near.enum';
import { PlotLandType } from '../enum/plot-land-type.enum';
import { ConstructionTypeOption } from '../enum/construction-type.enum';

export class CityInfo {
  @ApiProperty({ 
    description: 'City ID (if city already exists in database)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ 
    description: 'City name (if creating new city)', 
    example: 'Gurgaon',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'State name', 
    example: 'Haryana',
    required: false
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ 
    description: 'Latitude coordinate', 
    example: 28.4595,
    required: false
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ 
    description: 'Longitude coordinate', 
    example: 77.0266,
    required: false
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class SocietyInfo {
  @ApiProperty({ 
    description: 'Society ID (if society already exists in database)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ 
    description: 'Society name (if creating new society)', 
    example: 'Green Park Society',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Locality name (e.g., Sector 15, Phase 3). This is stored in the society table.', 
    example: 'Sector 15',
    required: false
  })
  @IsOptional()
  @IsString()
  localityName?: string;

  @ApiProperty({ 
    description: 'Society address', 
    example: 'Sector 15, Gurgaon',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    description: 'Pincode', 
    example: '122001',
    required: false
  })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ 
    description: 'Latitude coordinate', 
    example: 28.4595,
    required: false
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ 
    description: 'Longitude coordinate', 
    example: 77.0266,
    required: false
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class LocalityInfo {
  @ApiProperty({ 
    description: 'Locality ID (if locality already exists in database)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ 
    description: 'Locality name (if creating new locality)', 
    example: 'Sector 15',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Sector name', 
    example: 'Sector 15',
    required: false
  })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiProperty({ 
    description: 'Latitude coordinate', 
    example: 28.4595,
    required: false
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ 
    description: 'Longitude coordinate', 
    example: 77.0266,
    required: false
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}


export class BhkTypeInfo {
  @ApiProperty({ 
    description: 'BHK type ID (if BHK type already exists in database)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ 
    description: 'BHK type name (if creating new BHK type)', 
    example: '2 BHK',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'BHK type code', 
    example: '2bhk',
    required: false
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ 
    description: 'Sort order for display', 
    example: 2,
    required: false
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class BhkInfo {
  @ApiProperty({ 
    description: 'BHK ID (if BHK already exists in database)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ 
    description: 'BHK name (e.g., "2 BHK", "3 BHK")', 
    example: '2 BHK',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Built-up area in square feet', 
    example: 1200,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  buildUpAreaSqFt?: number;

  @ApiProperty({ 
    description: 'Carpet area in square feet', 
    example: 1000,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  carpetAreaSqFt?: number;

  @ApiProperty({ 
    description: 'Number of bathrooms', 
    example: 2,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  noOfBathrooms?: number;

  @ApiProperty({ 
    description: 'Number of bedrooms', 
    example: 2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  noOfBedrooms?: number;

  @ApiProperty({ 
    description: 'Number of balconies', 
    example: 2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  balconies?: number;
}

export class BuiltUpAreaInfo {
  @ApiProperty({ 
    description: 'Built-up area ID (if built-up area already exists in database)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ 
    description: 'Super built-up area in sq ft', 
    example: 1200,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  superBuiltUpArea?: number;

  @ApiProperty({ 
    description: 'Carpet area in sq ft', 
    example: 1000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  carpetArea?: number;

  @ApiProperty({ 
    description: 'Number of bathrooms', 
    example: 2,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  noOfBathrooms?: number;

  @ApiProperty({ 
    description: 'Number of bedrooms', 
    example: 2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  noOfBedrooms?: number;

  @ApiProperty({ 
    description: 'Number of balconies', 
    example: 2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balconies?: number;
}

export class CreatePropertyStep1Dto {
  @ApiProperty({ 
    description: 'Property ID (optional - required for updates, omit for new property creation)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ 
    description: 'Property listing type ID (Sale/Rent)', 
    example: 'uuid-string',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  listingTypeId: string;

  @ApiProperty({ 
    description: 'Property category ID (Residential/Commercial)', 
    example: 'uuid-string',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ 
    description: 'Property type ID (Apartment/Villa/etc)', 
    example: 'uuid-string',
    required: false
  })
  @IsOptional()
  @IsString()
  propertyTypeId?: string;

  @ApiProperty({ 
    description: 'BHK information with area and room details', 
    type: BhkInfo,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BhkInfo)
  bhk?: BhkInfo;

  @ApiProperty({ 
    description: 'Transaction Type', 
    example: 'new_booking',
    enum: TransactionType,
    required: false
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiProperty({ 
    description: 'Construction Status', 
    example: 'ready_to_move',
    enum: ConstructionStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(ConstructionStatus)
  constructionStatus?: ConstructionStatus;

  @ApiProperty({ 
    description: 'Age of property in years', 
    example: 5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ageOfProperty?: number;

  @ApiProperty({ 
    description: 'Possession By', 
    example: 'Q1 2025',
    required: false
  })
  @IsOptional()
  @IsString()
  possessionBy?: string;

  @ApiProperty({ 
    description: 'Possession Time', 
    example: 'Q1 2025',
    required: false
  })
  @IsOptional()
  @IsString()
  possessionTime?: string;

  @ApiProperty({ 
    description: 'Possession Status', 
    example: 'immediate',
    enum: PossessionStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(PossessionStatus)
  possessionStatus?: PossessionStatus;

  @ApiProperty({ 
    description: 'Possession Date', 
    example: '2025-06-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  possessionDate?: string;

  @ApiProperty({ 
    description: 'Property facing direction (e.g., North, South, East, West, North-East, etc.)', 
    example: 'North',
    required: false
  })
  @IsOptional()
  @IsString()
  facing?: string;

  @ApiProperty({ 
    description: 'Property status', 
    example: 'draft',
    enum: [
      'draft',
      'pending_review',
      'approved',
      'rejected',
      'active',
      'inactive',
      'sold',
      'rented',
    ],
    required: false,
    default: 'draft'
  })
  @IsOptional()
  @IsEnum([
    'draft',
    'pending_review',
    'approved',
    'rejected',
    'active',
    'inactive',
    'sold',
    'rented',
  ])
  status?: string;

  @ApiProperty({ 
    description: 'City information (can be ID or name for new city creation)', 
    type: CityInfo,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CityInfo)
  city?: CityInfo;

  @ApiProperty({ 
    description: 'Society information (can be ID or name for new society creation)', 
    type: SocietyInfo,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocietyInfo)
  society?: SocietyInfo;

  @ApiProperty({ 
    description: 'Locality information (can be ID or name for new locality creation)', 
    type: LocalityInfo,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalityInfo)
  locality?: LocalityInfo;

  @ApiProperty({ 
    description: 'Plot Area (Saleable area should be at least 10)', 
    example: 1200,
    required: false,
    minimum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  plotArea?: number;

  @ApiProperty({ 
    description: 'Plot Area Unit (e.g., "sq ft", "sq yd", "sq m", "acre")', 
    example: 'sq ft',
    required: false
  })
  @IsOptional()
  @IsString()
  plotAreaUnit?: string;

  @ApiProperty({ 
    description: 'Plot Length (should be at least 1)', 
    example: 60,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  plotLength?: number;

  @ApiProperty({ 
    description: 'Plot Length Unit', 
    example: 'ft',
    enum: DistanceUnit,
    required: false
  })
  @IsOptional()
  @IsEnum(DistanceUnit)
  plotLengthUnit?: DistanceUnit;

  @ApiProperty({ 
    description: 'Plot Width (should be at least 1)', 
    example: 40,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  plotWidth?: number;

  @ApiProperty({ 
    description: 'Plot Width Unit', 
    example: 'ft',
    enum: DistanceUnit,
    required: false
  })
  @IsOptional()
  @IsEnum(DistanceUnit)
  plotWidthUnit?: DistanceUnit;

  @ApiProperty({ 
    description: 'Width of Facing Road', 
    example: '30 ft',
    required: false
  })
  @IsOptional()
  @IsString()
  plotFacingRoadWidth?: string;

  @ApiProperty({ 
    description: 'Location Hub', 
    example: 'it_park',
    enum: LocationHub,
    required: false
  })
  @IsOptional()
  @IsEnum(LocationHub)
  locationHub?: LocationHub;

  @ApiProperty({ 
    description: 'Other Location Hub (when locationHub is "others")', 
    example: 'Custom Hub Name',
    required: false
  })
  @IsOptional()
  @IsString()
  otherLocationHub?: string;

  @ApiProperty({ 
    description: 'Zone Type', 
    example: 'residential',
    enum: ZoneType,
    required: false
  })
  @IsOptional()
  @IsEnum(ZoneType)
  zoneType?: ZoneType;

  @ApiProperty({ 
    description: 'Property Condition', 
    example: 'ready_to_use',
    enum: PropertyCondition,
    required: false
  })
  @IsOptional()
  @IsEnum(PropertyCondition)
  propertyCondition?: PropertyCondition;

  @ApiProperty({ 
    description: 'Wall Construction Status', 
    example: 'brick_wall',
    enum: WallConstructionStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(WallConstructionStatus)
  wallConstructionStatus?: WallConstructionStatus;

  @ApiProperty({ 
    description: 'Ownership', 
    example: 'freehold',
    enum: Ownership,
    required: false
  })
  @IsOptional()
  @IsEnum(Ownership)
  ownership?: Ownership;

  @ApiProperty({ 
    description: 'Built Up Area', 
    example: 1200,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  builtUpArea?: number;

  @ApiProperty({ 
    description: 'Built Up Area Unit', 
    example: 'sq_ft',
    enum: AreaUnit,
    required: false
  })
  @IsOptional()
  @IsEnum(AreaUnit)
  builtUpAreaUnit?: AreaUnit;

  @ApiProperty({ 
    description: 'Carpet Area', 
    example: 1000,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  carpetArea?: number;

  @ApiProperty({ 
    description: 'Carpet Area Unit', 
    example: 'sq_ft',
    enum: AreaUnit,
    required: false
  })
  @IsOptional()
  @IsEnum(AreaUnit)
  carpetAreaUnit?: AreaUnit;

  @ApiProperty({ 
    description: 'Suitable For (array of purposes)', 
    example: ['gym', 'clinic'],
    enum: SuitableFor,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(SuitableFor, { each: true })
  suitableFor?: SuitableFor[];

  @ApiProperty({ 
    description: 'Entrance Width', 
    example: 10.5,
    required: false,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  entranceWidth?: number;

  @ApiProperty({ 
    description: 'Entrance Width Unit', 
    example: 'ft',
    enum: DistanceUnit,
    required: false
  })
  @IsOptional()
  @IsEnum(DistanceUnit)
  entranceWidthUnit?: DistanceUnit;

  @ApiProperty({ 
    description: 'Ceiling Height', 
    example: 12.0,
    required: false,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ceilingHeight?: number;

  @ApiProperty({ 
    description: 'Ceiling Height Unit', 
    example: 'ft',
    enum: DistanceUnit,
    required: false
  })
  @IsOptional()
  @IsEnum(DistanceUnit)
  ceilingHeightUnit?: DistanceUnit;

  @ApiProperty({ 
    description: 'Located Near (array of locations)', 
    example: ['elevator', 'entrance'],
    enum: LocatedNear,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(LocatedNear, { each: true })
  locatedNear?: LocatedNear[];

  @ApiProperty({ 
    description: 'Plot/Land Type', 
    example: 'industrial_land_plots',
    enum: PlotLandType,
    required: false
  })
  @IsOptional()
  @IsEnum(PlotLandType)
  plotLandType?: PlotLandType;

  @ApiProperty({ 
    description: 'Number of Open Sides', 
    example: 2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  noOfOpenSides?: number;

  @ApiProperty({ 
    description: 'Any Construction Done On This Property', 
    example: 'yes',
    enum: ['yes', 'no'],
    required: false
  })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  constructionDone?: 'yes' | 'no';

  @ApiProperty({ 
    description: 'Construction Type Options (array of construction types)', 
    example: ['shed', 'room'],
    enum: ConstructionTypeOption,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ConstructionTypeOption, { each: true })
  constructionTypeOptions?: ConstructionTypeOption[];
}
