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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enum/transaction-type.enum';
import { ConstructionStatus } from '../enum/construction-status.enum';

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
  @Min(1)
  buildUpAreaSqFt?: number;

  @ApiProperty({ 
    description: 'Carpet area in square feet', 
    example: 1000,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  carpetAreaSqFt?: number;

  @ApiProperty({ 
    description: 'Number of bathrooms', 
    example: 2,
    required: false,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  noOfBathrooms?: number;

  @ApiProperty({ 
    description: 'Number of bedrooms', 
    example: 2,
    required: false,
    minimum: 0,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  noOfBedrooms?: number;

  @ApiProperty({ 
    description: 'Number of balconies', 
    example: 2,
    required: false,
    minimum: 0,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
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
  @Max(10)
  noOfBathrooms?: number;

  @ApiProperty({ 
    description: 'Number of bedrooms', 
    example: 2,
    required: false,
    minimum: 0,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  noOfBedrooms?: number;

  @ApiProperty({ 
    description: 'Number of balconies', 
    example: 2,
    required: false,
    minimum: 0,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
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
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
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
    enum: ['draft', 'active', 'inactive', 'sold', 'rented'],
    required: false,
    default: 'draft'
  })
  @IsOptional()
  @IsEnum(['draft', 'active', 'inactive', 'sold', 'rented'])
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
    description: 'Plot Area (Saleable area should be between 10 and 100000)', 
    example: 1200,
    required: false,
    minimum: 10,
    maximum: 100000
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100000)
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
    description: 'Plot Length (should be between 1 and 10000)', 
    example: 60,
    required: false,
    minimum: 1,
    maximum: 10000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  plotLength?: number;

  @ApiProperty({ 
    description: 'Plot Width (should be between 1 and 10000)', 
    example: 40,
    required: false,
    minimum: 1,
    maximum: 10000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  plotWidth?: number;

  @ApiProperty({ 
    description: 'Width of Facing Road', 
    example: '30 ft',
    required: false
  })
  @IsOptional()
  @IsString()
  plotFacingRoadWidth?: string;
}
