import { ApiProperty } from '@nestjs/swagger';

// Listing Type Response DTO
export class ListingTypeResponseDto {
  @ApiProperty({ description: 'Listing type ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Listing type name', example: 'Sale' })
  name: string;

  @ApiProperty({ description: 'Listing type code', example: 'sale' })
  code: string;
}

// Category Response DTO
export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Category name', example: 'Residential' })
  name: string;

  @ApiProperty({ description: 'Category code', example: 'residential' })
  code: string;
}

// Base response DTOs
export class PropertyTypeResponseDto {
  @ApiProperty({ description: 'Property type ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Property type name', example: 'Apartment' })
  name: string;

  @ApiProperty({ description: 'Property type code', example: 'apartment' })
  code: string;
}

export class CityResponseDto {
  @ApiProperty({ description: 'City ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'City name', example: 'Gurgaon' })
  name: string;

  @ApiProperty({ description: 'City code', example: 'gurgaon' })
  code: string;

  @ApiProperty({
    description: 'State name',
    example: 'Haryana',
    required: false,
  })
  state?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 28.4595,
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 77.0266,
    required: false,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Data source',
    example: 'database',
    enum: ['database', 'google'],
  })
  source: string;

  @ApiProperty({
    description: 'Country name (for Google results)',
    example: 'India',
    required: false,
  })
  country?: string;

  @ApiProperty({
    description: 'Google Place ID (for Google results)',
    example: 'ChIJ...',
    required: false,
  })
  placeId?: string;
}

export class SocietyResponseDto {
  @ApiProperty({ description: 'Society ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Society name', example: 'Green Park Society' })
  name: string;

  @ApiProperty({
    description: 'City ID',
    example: 'uuid-string',
    required: false,
  })
  cityId?: string;

  @ApiProperty({
    description: 'Locality ID',
    example: 'uuid-string',
    required: false,
  })
  localityId?: string;

  @ApiProperty({
    description: 'Society address',
    example: 'Sector 15, Gurgaon',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 28.4595,
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 77.0266,
    required: false,
  })
  longitude?: number;

  @ApiProperty({ description: 'Pincode', example: '122001', required: false })
  pincode?: string;

  @ApiProperty({
    description: 'Verification status',
    example: true,
    required: false,
  })
  isVerified?: boolean;

  @ApiProperty({
    description: 'Data source',
    example: 'database',
    enum: ['database', 'google'],
  })
  source: string;

  @ApiProperty({
    description: 'City name (for Google results)',
    example: 'Gurgaon',
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'State name (for Google results)',
    example: 'Haryana',
    required: false,
  })
  state?: string;

  @ApiProperty({
    description: 'Country name (for Google results)',
    example: 'India',
    required: false,
  })
  country?: string;

  @ApiProperty({
    description: 'Google Place ID (for Google results)',
    example: 'ChIJ...',
    required: false,
  })
  placeId?: string;
}

export class LocalityResponseDto {
  @ApiProperty({ description: 'Locality ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Locality name', example: 'Sector 15' })
  name: string;

  @ApiProperty({
    description: 'Sector name',
    example: 'Sector 15',
    required: false,
  })
  sector?: string;

  @ApiProperty({
    description: 'City ID',
    example: 'uuid-string',
    required: false,
  })
  cityId?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 28.4595,
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 77.0266,
    required: false,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Data source',
    example: 'database',
    enum: ['database', 'google'],
  })
  source: string;

  @ApiProperty({
    description: 'City name (for Google results)',
    example: 'Gurgaon',
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'State name (for Google results)',
    example: 'Haryana',
    required: false,
  })
  state?: string;

  @ApiProperty({
    description: 'Country name (for Google results)',
    example: 'India',
    required: false,
  })
  country?: string;

  @ApiProperty({
    description: 'Google Place ID (for Google results)',
    example: 'ChIJ...',
    required: false,
  })
  placeId?: string;

  @ApiProperty({
    description: 'Address (for Google results)',
    example: 'Sector 15, Gurgaon, Haryana, India',
    required: false,
  })
  address?: string;
}

// Unified Location Response DTO (for societies with locality name)
export class LocationResponseDto {
  @ApiProperty({ description: 'Result ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({
    description: 'Society/location name',
    example: 'Green Park Society',
  })
  name: string;

  @ApiProperty({
    description: 'Locality name',
    example: 'Sector 15',
    required: false,
  })
  localityName?: string | null;

  @ApiProperty({
    description: 'Address',
    example: 'Sector 15, Gurgaon',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Data source',
    example: 'database',
    enum: ['database', 'google'],
  })
  source: string;
}

export class BuiltUpAreaResponseDto {
  @ApiProperty({ description: 'Built-up area ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Super built-up area in sq ft', example: 1200 })
  superBuiltUpArea: number;

  @ApiProperty({ description: 'Carpet area in sq ft', example: 1000 })
  carpetArea: number;

  @ApiProperty({ description: 'Number of bathrooms', example: 2 })
  noOfBathrooms: number;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 2,
    required: false,
  })
  noOfBedrooms?: number | null;

  @ApiProperty({
    description: 'Number of balconies',
    example: 2,
    required: false,
  })
  balconies?: number | null;

  @ApiProperty({ description: 'BHK type ID', example: 'uuid-string' })
  bhkTypeId: string;

  @ApiProperty({ description: 'Society ID', example: 'uuid-string' })
  societyId: string;
}

export class BhkTypeResponseDto {
  @ApiProperty({ description: 'BHK type ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'BHK type name', example: '2 BHK' })
  name: string;

  @ApiProperty({ description: 'BHK type code', example: '2bhk' })
  code: string;

  @ApiProperty({ description: 'Sort order', example: 2 })
  sortOrder: number;

  @ApiProperty({
    description: 'Property type ID',
    example: 'uuid-string',
    required: false,
  })
  propertyTypeId?: string;

  @ApiProperty({
    description: 'Society ID',
    example: 'uuid-string',
    required: false,
  })
  societyId?: string;

  @ApiProperty({
    description: 'Built-up areas for this BHK type',
    type: [BuiltUpAreaResponseDto],
    required: false,
  })
  builtUpAreas?: BuiltUpAreaResponseDto[];
}

// Master data response DTOs
export class MasterDataResponseDto {
  @ApiProperty({
    description: 'Filtered property types based on listing type and category',
    type: [PropertyTypeResponseDto],
  })
  propertyTypes: PropertyTypeResponseDto[];
}

export class ReseedMasterDataResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Master data reseeded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Reseed operation details',
    example: {
      duration: '2.5s',
      counts: {
        propertyListingTypes: 2,
        propertyCategories: 2,
        propertyTypes: 8,
        cities: 150,
        localities: 500,
        societies: 200,
        bhkTypes: 100,
        builtUpAreas: 300,
      },
    },
  })
  details: any;
}

// Property creation response DTO
export class PropertyResponseDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Listing type ID', example: 'uuid-string' })
  listingTypeId: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid-string' })
  categoryId: string;

  @ApiProperty({ description: 'City ID', example: 'uuid-string' })
  cityId: string;

  @ApiProperty({ description: 'Society ID', example: 'uuid-string' })
  societyId: string;

  @ApiProperty({ description: 'Locality ID', example: 'uuid-string' })
  localityId: string;

  @ApiProperty({ description: 'Property type ID', example: 'uuid-string' })
  propertyTypeId: string;

  @ApiProperty({ description: 'BHK type ID', example: 'uuid-string' })
  bhkTypeId: string;

  @ApiProperty({
    description: 'Custom BHK description',
    example: '2.5 BHK',
    required: false,
  })
  customBhk?: string;

  @ApiProperty({ description: 'Number of bathrooms', example: 2 })
  bathrooms: number;

  @ApiProperty({ description: 'Built-up area in sq ft', example: 1200 })
  builtUpAreaSqFt: number;

  @ApiProperty({
    description: 'Carpet area in sq ft',
    example: 1000,
    required: false,
  })
  carpetAreaSqFt?: number;

  @ApiProperty({ description: 'Age of property in years', example: 5 })
  ageOfProperty: number;

  @ApiProperty({
    description: 'User ID who created the property',
    example: 'uuid-string',
  })
  userId: string;

  @ApiProperty({
    description: 'Property status',
    example: 'draft',
    enum: ['draft', 'active', 'inactive', 'sold', 'rented'],
  })
  status: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description:
      'Completion step (0=not started, 1-4=in progress, 5=completed)',
    example: 1,
    minimum: 0,
    maximum: 5,
  })
  completionStep: number;
}

// Minimal property response for step updates
export class PropertyStatusResponseDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({
    description: 'Property status',
    example: 'draft',
    enum: ['draft', 'active', 'inactive', 'sold', 'rented'],
  })
  status: string;
}
