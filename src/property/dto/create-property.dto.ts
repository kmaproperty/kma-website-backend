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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Built-up area in square feet', 
    example: 1200,
    required: true,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  buildUpAreaSqFt: number;

  @ApiProperty({ 
    description: 'Carpet area in square feet', 
    example: 1000,
    required: true,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  carpetAreaSqFt: number;

  @ApiProperty({ 
    description: 'Number of bathrooms', 
    example: 2,
    required: true,
    minimum: 1,
    maximum: 10
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  noOfBathrooms: number;

  @ApiProperty({ 
    description: 'Number of balconies', 
    example: 2,
    required: true,
    minimum: 0,
    maximum: 10
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  noOfBalconies: number;
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
}

export class CreatePropertyStep1Dto {
  @ApiProperty({ 
    description: 'Property ID (if updating existing property, leave empty for new property)', 
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
    required: true
  })
  @IsString()
  @IsNotEmpty()
  propertyTypeId: string;

  @ApiProperty({ 
    description: 'BHK information with area and room details', 
    type: BhkInfo,
    required: true
  })
  @ValidateNested()
  @Type(() => BhkInfo)
  bhk: BhkInfo;

  @ApiProperty({ 
    description: 'Age of property in years', 
    example: 5,
    required: true,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  ageOfProperty: number;



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
    required: true
  })
  @ValidateNested()
  @Type(() => CityInfo)
  city: CityInfo;

  @ApiProperty({ 
    description: 'Society information (can be ID or name for new society creation)', 
    type: SocietyInfo,
    required: true
  })
  @ValidateNested()
  @Type(() => SocietyInfo)
  society: SocietyInfo;



}
