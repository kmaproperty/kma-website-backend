import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class FurnishingResponseDto {
  @ApiProperty({ description: 'Furnishing ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Furnishing name', example: 'Water Purifier' })
  name: string;

  @ApiProperty({ description: 'Furnishing code', example: 'water-purifier' })
  code: string;

  @ApiPropertyOptional({ 
    description: 'Icon name or path', 
    example: 'water-purifier-icon',
    nullable: true 
  })
  icon: string | null;

  @ApiProperty({ description: 'Sort order for display', example: 1 })
  sortOrder: number;
}

export class AmenityResponseDto {
  @ApiProperty({ description: 'Amenity ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Amenity name', example: 'Swimming Pool' })
  name: string;

  @ApiProperty({ description: 'Amenity code', example: 'swimming-pool' })
  code: string;

  @ApiPropertyOptional({ 
    description: 'Icon name or path', 
    example: 'swimming-pool-icon',
    nullable: true 
  })
  icon: string | null;

  @ApiProperty({ description: 'Sort order for display', example: 1 })
  sortOrder: number;
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
  @ApiProperty({ 
    description: 'Locality ID (like Housing.com)', 
    example: 3018,
    type: Number,
  })
  id: number | string;

  @ApiProperty({ 
    description: 'Formatted locality name with city (like Housing.com)', 
    example: 'Sector 89, Gurgaon',
  })
  name: string;

  @ApiProperty({ 
    description: 'UUID identifier (like Housing.com)', 
    example: '2475ee745ec374a2d50e',
  })
  uuid: string;

  @ApiProperty({ 
    description: 'Super type (always "polygon" for localities)', 
    example: 'polygon',
  })
  super_type: string;

  @ApiProperty({ 
    description: 'Feature type', 
    example: 'locality',
    enum: ['locality', 'sublocality', 'neighbourhood'],
  })
  type: string;

  @ApiProperty({ 
    description: 'City ID (null for Google results)', 
    example: null,
    required: false,
  })
  city_id: string | null;

  @ApiProperty({ 
    description: 'Bounding box UUIDs (array of city/polygon UUIDs)', 
    example: ['526acdc6c33455e9e4e9'],
    type: [String],
    required: false,
  })
  bounding_box_uuids?: string[];

  @ApiProperty({ 
    description: 'Longitude and Latitude as array [lon, lat] (like Housing.com)', 
    example: [76.94570376016718, 28.418284308101104],
    type: [Number],
    required: false,
  })
  lon_lat?: [number, number];

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 28.418284308101104,
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 76.94570376016718,
    required: false,
  })
  longitude?: number;

  @ApiProperty({ 
    description: 'Is valid result', 
    example: true,
  })
  is_valid: boolean;

  @ApiProperty({ 
    description: 'Time taken in milliseconds (like Housing.com)', 
    example: 26,
    type: Number,
  })
  took: number;

  @ApiProperty({ 
    description: 'Full name with complete address (like Housing.com)', 
    example: 'Sector 89, New Gurgaon, Gurgaon, Gurgaon District, Haryana, India, 122001',
    required: false,
  })
  full_name?: string;

  // Keep legacy fields for backward compatibility (optional)
  @ApiProperty({
    description: 'Display name (backward compatibility)',
    example: 'Sector 15, Gurgaon',
    required: false,
  })
  displayName?: string;

  @ApiProperty({
    description: 'Data source',
    example: 'database',
    enum: ['database', 'google'],
    required: false,
  })
  source?: string;
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
    enum: ['draft', 'pending_review', 'active', 'rejected', 'deactivated'],
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
  })
  completionStep: number;

  @ApiProperty({
    description: 'Progress percentage based on completion step (0-100%)',
    example: 25,
    minimum: 0,
  })
  progressPercentage: number;
}

// Minimal property response for step updates
export class PropertyStatusResponseDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({
    description: 'Property status',
    example: 'draft',
    enum: ['draft', 'pending_review', 'active', 'rejected', 'deactivated'],
  })
  status: string;

  @ApiProperty({
    description: 'Completion step',
    example: 2,
    minimum: 0,
  })
  completionStep: number;

  @ApiProperty({
    description: 'Progress percentage based on completion step (0-100%)',
    example: 50,
    minimum: 0,
  })
  progressPercentage: number;
}

export class PropertyMediaItemDto {
  @ApiProperty({ description: 'S3 file key', example: 'properties/uuid/image1.jpg' })
  fileKey: string;

  @ApiProperty({ description: 'View or label', example: 'living_room', required: false })
  view?: string;

  @ApiProperty({ description: 'Whether this is cover image', example: true, required: false })
  isCoverImage?: boolean;
}

export class OwnerPropertyListingItemDto {
  @ApiProperty({ description: 'Property ID', example: '17840748' })
  id: string;

  @ApiProperty({
    description: 'Human readable title composed from property details',
    example: '1.5 BHK Independent Floor',
  })
  title: string;

  @ApiProperty({
    description: 'Property status',
    example: 'pending_review',
    enum: [
      'draft',
      'pending_review',
      'active',
      'rejected',
      'deactivated',
    ],
  })
  status: string;

  @ApiProperty({
    description: 'Property listing type details',
    type: ListingTypeResponseDto,
    required: false,
  })
  listingType?: ListingTypeResponseDto;

  @ApiProperty({
    description: 'Property category details',
    type: CategoryResponseDto,
    required: false,
  })
  category?: CategoryResponseDto;

  @ApiProperty({
    description: 'Property type details',
    type: PropertyTypeResponseDto,
    required: false,
  })
  propertyType?: PropertyTypeResponseDto | null;

  @ApiProperty({
    description: 'BHK type name',
    example: '1.5 BHK',
    required: false,
  })
  bhkTypeName?: string | null;

  @ApiProperty({
    description: 'Furnishing type',
    example: 'Unfurnished',
    required: false,
  })
  furnishingType?: string | null;

  @ApiProperty({
    description: 'Construction/project status',
    example: 'ready_to_move',
    required: false,
  })
  constructionStatus?: string | null;

  @ApiProperty({
    description: 'Primary price (sale price or lease amount)',
    example: 4500000,
    required: false,
  })
  price?: number | null;

  @ApiProperty({
    description: 'Monthly rent, if applicable',
    example: 45000,
    required: false,
  })
  monthlyRent?: number | null;

  @ApiProperty({
    description: 'Computed price source (price or monthlyRent)',
    example: 'price',
    required: false,
  })
  priceSource?: 'price' | 'monthlyRent' | null;

  @ApiProperty({
    description: 'Total media counts',
    example: { photos: 15, videos: 2 },
    required: false,
  })
  mediaCounts?: {
    photos: number;
    videos: number;
  };

  @ApiProperty({
    description: 'Cover photo file key (if available)',
    example: 'properties/uuid/cover.jpg',
    required: false,
  })
  coverPhotoKey?: string | null;

  @ApiProperty({
    description: 'All property photos',
    type: [PropertyMediaItemDto],
    required: false,
  })
  photos?: PropertyMediaItemDto[];

  @ApiProperty({
    description: 'Society / locality / city formatted string',
    example: '742 Evergreen Terrace, Springfield, IL',
    required: false,
  })
  address?: string | null;

  @ApiProperty({
    description: 'Built-up area or super built-up area value',
    example: 450,
    required: false,
  })
  area?: number | null;

  @ApiProperty({
    description: 'Area unit',
    example: 'sq.ft',
    required: false,
  })
  areaUnit?: string | null;

  @ApiProperty({
    description: 'Completion step (0-5)',
    example: 3,
  })
  completionStep: number;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 60,
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2025-07-18T10:15:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2025-07-20T08:45:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Expiry date for active properties (15 days from activation)',
    example: '2025-08-05T10:15:00.000Z',
    required: false,
  })
  expiresAt?: Date | null;

  @ApiProperty({
    description: 'Date when property was deactivated (updatedAt when status is deactivated)',
    example: '2025-08-05T10:15:00.000Z',
    required: false,
  })
  deactivatedOn?: Date | null;

  @ApiProperty({
    description: 'Expiry date for active properties (alias for expiresAt)',
    example: '2025-08-05T10:15:00.000Z',
    required: false,
  })
  expiredOn?: Date | null;

  @ApiProperty({
    description: 'Verification status of the property',
    example: 'verified',
    enum: ['verified', 'unverified', 'pending'],
    required: false,
  })
  isVerified?: string | null;
}

export class OwnerPropertyListingPaginationDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total pages', example: 10 })
  totalPages: number;
}

export class OwnerPropertyListingResponseDto {
  @ApiProperty({
    description: 'Property listings for the current owner/channel partner',
    type: [OwnerPropertyListingItemDto],
  })
  items: OwnerPropertyListingItemDto[];

  @ApiProperty({
    description: 'Pagination details',
    type: OwnerPropertyListingPaginationDto,
  })
  pagination: OwnerPropertyListingPaginationDto;

  @ApiProperty({
    description: 'Counts for each status bucket',
    example: {
      total: 30,
      byStatus: {
        draft: 5,
        pending_review: 10,
        active: 12,
        rejected: 3,
      },
    },
  })
  summary: {
    total: number;
    byStatus: Record<string, number>;
  };
}

export class OwnerPropertyDetailResponseDto {
  @ApiProperty({ description: 'Property ID', example: '17840748' })
  id: string;

  @ApiProperty({ description: 'Title', example: '2 BHK Apartment' })
  title: string;

  @ApiProperty({ description: 'Status', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Area number', example: 444, required: false })
  area?: number | null;

  @ApiProperty({ description: 'Area unit', example: 'sq.ft', required: false })
  areaUnit?: string | null;

  @ApiProperty({ description: 'Category label', example: 'Residential', required: false })
  category?: string | null;

  @ApiProperty({ description: 'Construction status', example: 'Under Construction', required: false })
  constructionStatus?: string | null;

  @ApiProperty({ description: 'Furnishing', example: 'Fully Furnished', required: false })
  furnishingType?: string | null;

  @ApiProperty({ description: 'Photos', type: [PropertyMediaItemDto] })
  photos: PropertyMediaItemDto[];

  @ApiProperty({ description: 'Videos', type: [PropertyMediaItemDto], required: false })
  videos?: PropertyMediaItemDto[];

  @ApiProperty({ description: 'Primary price (sale price)', example: 4500000, required: false })
  price?: number | null;

  @ApiProperty({ description: 'Monthly rent amount', example: 25000, required: false })
  monthlyRent?: number | null;

  @ApiProperty({ description: 'Possession date', example: '2025-07-22', required: false })
  possessionDate?: string | null;

  @ApiProperty({ description: 'Created at ISO date', example: '2025-07-18' })
  createdOn: string;

  @ApiProperty({ description: 'Last updated at ISO date', example: '2025-07-19' })
  lastAddedOn: string;

  @ApiProperty({ description: 'Completion step', example: 3 })
  completionStep: number;

  @ApiProperty({ description: 'Progress percentage', example: 60 })
  progressPercentage: number;

  @ApiPropertyOptional({
    description: 'Rejection reason (if property was rejected)',
    example: 'Incomplete property information',
    required: false,
  })
  rejectionReason?: string | null;

  @ApiPropertyOptional({
    description: 'Expiry date for active properties (15 days from activation)',
    example: '2025-08-05T10:15:00.000Z',
    required: false,
  })
  expiresAt?: Date | null;
}

// Property Step 2 Response DTO
export class PropertyStep2ResponseDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  propertyId: string;

  @ApiProperty({
    description: 'Floor number of the unit',
    example: 5,
    required: false,
  })
  floorNumber?: number | null;

  @ApiProperty({
    description: 'Total floors in the building',
    example: 10,
    required: false,
  })
  totalFloors?: number | null;

  @ApiProperty({
    description: 'Flat/Unit number',
    example: 'A-501',
    required: false,
  })
  flatNumber?: string | null;

  @ApiProperty({
    description: 'Tower/Block number or name',
    example: 'Tower A',
    required: false,
  })
  towerBlock?: string | null;

  @ApiProperty({
    description: 'Property area (in Acres)',
    example: 0.5,
    required: false,
  })
  propertyAreaAcre?: number | null;

  @ApiProperty({
    description: 'Lift availability in the building',
    example: true,
    required: false,
  })
  isLiftAvailable?: boolean | null;

  @ApiProperty({
    description: 'Tenant type preferences',
    example: ['family', 'company'],
    enum: ['family', 'bachelors', 'company'],
    isArray: true,
    required: false,
  })
  tenantType?: Array<'family' | 'bachelors' | 'company'> | null;

  @ApiProperty({
    description: 'Company occupancy type',
    example: 'open_for_both',
    enum: ['open_for_both', 'men_only', 'women_only'],
    required: false,
  })
  companyOccupancy?: 'open_for_both' | 'men_only' | 'women_only' | null;

  @ApiProperty({
    description: 'Rent availability',
    example: 'immediately',
    enum: ['immediately', 'later'],
    required: false,
  })
  rentAvailability?: 'immediately' | 'later' | null;

  @ApiProperty({
    description: 'Available from date (when rentAvailability is later)',
    example: '2025-12-31',
    required: false,
  })
  availableFromDate?: string | null;

  @ApiProperty({
    description: 'Monthly rent amount',
    example: 25000,
    required: false,
  })
  monthlyRent?: number | null;

  @ApiProperty({
    description: 'Maintenance type',
    example: 'include_in_rent',
    enum: ['include_in_rent', 'separate'],
    required: false,
  })
  maintenanceType?: 'include_in_rent' | 'separate' | null;

  @ApiProperty({
    description: 'Maintenance charge amount (when maintenanceType is separate)',
    example: 2000,
    required: false,
  })
  maintenanceChargeAmount?: number | null;

  @ApiProperty({
    description: 'Security deposit type',
    example: '2_month',
    enum: ['none', '1_month', '2_month', '6_month', 'custom'],
    required: false,
  })
  securityDepositType?: 'none' | '1_month' | '2_month' | '6_month' | 'custom' | null;

  @ApiProperty({
    description: 'Security deposit amount (when securityDepositType is custom)',
    example: 50000,
    required: false,
  })
  securityDepositAmount?: number | null;

  @ApiProperty({
    description: 'Lock-in period type',
    example: '1_month',
    enum: ['none', '1_month', '2_month', '6_month', 'custom'],
    required: false,
  })
  lockInType?: 'none' | '1_month' | '2_month' | '6_month' | 'custom' | null;

  @ApiProperty({
    description: 'Lock-in period in months (when lockInType is custom)',
    example: 12,
    required: false,
  })
  lockInMonths?: number | null;

  @ApiProperty({
    description: 'Brokerage type',
    example: '15_days',
    enum: ['none', '15_days', '30_days', 'custom'],
    required: false,
  })
  brokerageType?: 'none' | '15_days' | '30_days' | 'custom' | null;

  @ApiProperty({
    description: 'Brokerage amount (when brokerageType is custom)',
    example: 25000,
    required: false,
  })
  brokerageAmount?: number | null;

  @ApiProperty({
    description: 'Is brokerage negotiable',
    example: true,
    required: false,
  })
  isBrokerageNegotiable?: boolean | null;

  @ApiProperty({
    description: 'Expected Return on Investment (e.g., "12%" or "150000")',
    example: '12%',
    required: false,
  })
  expectedReturnOnInvestment?: string | null;

  @ApiProperty({
    description: 'Property facing direction',
    example: 'North',
    required: false,
  })
  facing?: string | null;

  @ApiProperty({
    description: 'Property status',
    example: 'draft',
    enum: ['draft', 'pending_review', 'active', 'rejected', 'deactivated'],
  })
  status: string;

  @ApiProperty({
    description: 'Completion step',
    example: 2,
    minimum: 0,
  })
  completionStep: number;

  @ApiProperty({
    description: 'Progress percentage based on completion step (0-100%)',
    example: 50,
    minimum: 0,
  })
  progressPercentage: number;

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
}
