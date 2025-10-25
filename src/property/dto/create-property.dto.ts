import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CityInfo {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class SocietyInfo {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class LocalityInfo {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class BhkTypeInfo {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class BuiltUpAreaInfo {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsNumber()
  superBuiltUpArea?: number;

  @IsOptional()
  @IsNumber()
  carpetArea?: number;

  @IsOptional()
  @IsNumber()
  noOfBathrooms?: number;
}

export class CreatePropertyDto {
  // Required fields
  @IsString()
  listingTypeId: string;

  @IsString()
  categoryId: string;

  @IsString()
  propertyTypeId: string;

  @IsNumber()
  bathrooms: number;

  @IsNumber()
  builtUpAreaSqFt: number;

  @IsOptional()
  @IsNumber()
  carpetAreaSqFt?: number;

  @IsNumber()
  ageOfProperty: number;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  customBhk?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'inactive', 'sold', 'rented'])
  status?: string;

  // Location information (can be ID or name)
  @ValidateNested()
  @Type(() => CityInfo)
  city: CityInfo;

  @ValidateNested()
  @Type(() => SocietyInfo)
  society: SocietyInfo;

  @ValidateNested()
  @Type(() => LocalityInfo)
  locality: LocalityInfo;

  @ValidateNested()
  @Type(() => BhkTypeInfo)
  bhkType: BhkTypeInfo;

  @ValidateNested()
  @Type(() => BuiltUpAreaInfo)
  builtUpArea: BuiltUpAreaInfo;
}
