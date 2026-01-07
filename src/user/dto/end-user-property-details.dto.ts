import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PropertyImageDto {
  @ApiProperty({
    description: 'Image file key/URL',
    example: 'properties/uuid/image1.jpg',
  })
  fileKey: string;

  @ApiPropertyOptional({
    description: 'View or label',
    example: 'living_room',
  })
  view?: string;

  @ApiPropertyOptional({
    description: 'Whether this is cover image',
    example: true,
  })
  isCoverImage?: boolean;
}

export class PropertyVideoDto {
  @ApiProperty({
    description: 'Video file key/URL',
    example: 'properties/uuid/video1.mp4',
  })
  fileKey: string;

  @ApiPropertyOptional({
    description: 'Video format/view',
    example: 'walkthrough',
  })
  view?: string;
}

export class PropertyLocationDto {
  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 28.4595,
  })
  latitude?: number | null;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: 77.0266,
  })
  longitude?: number | null;

  @ApiProperty({
    description: 'Full address',
    example: '742 Evergreen Terrace, Springfield, IL 62704',
  })
  address: string;
}

export class PropertyPriceInfoDto {
  @ApiPropertyOptional({
    description: 'Minimum price (for price range)',
    example: 5490000,
  })
  minPrice?: number | null;

  @ApiPropertyOptional({
    description: 'Maximum price (for price range)',
    example: 5629000,
  })
  maxPrice?: number | null;

  @ApiPropertyOptional({
    description: 'Single price (if not a range)',
    example: 5000000,
  })
  price?: number | null;

  @ApiPropertyOptional({
    description: 'Monthly rent (for rental properties)',
    example: 25000,
  })
  monthlyRent?: number | null;

  @ApiProperty({
    description: 'Price display text',
    example: '₹54.90 Lac - ₹56.29 Lac',
  })
  displayPrice: string;
}

export class PropertyUnitConfigDto {
  @ApiProperty({
    description: 'Unit configuration',
    example: '2 BHK Flats',
  })
  unitType: string;

  @ApiPropertyOptional({
    description: 'Size range or single size',
    example: '1143 Sq. Ft. to 1172 Sq. Ft. (Saleable)',
  })
  size?: string | null;

  @ApiPropertyOptional({
    description: 'Number of units',
    example: 229,
  })
  numberOfUnits?: number | null;
}

export class PropertyPriceListItemDto {
  @ApiProperty({
    description: 'Unit type with size',
    example: '3 BHK Apartment 1138 Sq. Ft.',
  })
  unitType: string;

  @ApiProperty({
    description: 'Price or "Price on Request"',
    example: 'Price on Request',
  })
  price: string;
}

export class EndUserPropertyDetailsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Remaining free views for unauthenticated users (-1 for unlimited for authenticated users)',
    example: 2,
  })
  remainingViews?: number;

  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({
    description: 'Property/Project name',
    example: 'Skyline Elevate',
  })
  name: string;

  @ApiProperty({
    description: 'Property title/description',
    example: 'Project names lorem ipsum',
  })
  title: string;

  @ApiProperty({
    description: 'Location information',
    type: PropertyLocationDto,
  })
  location: PropertyLocationDto;

  @ApiPropertyOptional({
    description: 'Logo URL (placeholder)',
    example: null,
  })
  logo?: string | null;

  @ApiProperty({
    description: 'Property images',
    type: [PropertyImageDto],
  })
  images: PropertyImageDto[];

  @ApiPropertyOptional({
    description: 'Property videos',
    type: [PropertyVideoDto],
  })
  videos?: PropertyVideoDto[];

  @ApiProperty({
    description: 'Price information',
    type: PropertyPriceInfoDto,
  })
  priceInfo: PropertyPriceInfoDto;

  @ApiProperty({
    description: 'Project status',
    example: 'Under Construction',
  })
  projectStatus: string;

  @ApiProperty({
    description: 'Unit configuration',
    type: PropertyUnitConfigDto,
  })
  unitConfig: PropertyUnitConfigDto;

  @ApiPropertyOptional({
    description: 'Total area (for projects)',
    example: '11.2 Acres',
  })
  totalArea?: string | null;

  @ApiPropertyOptional({
    description: 'About property description',
    example: 'Skyline Elevate is a budget-friendly project located on Ambala Highway...',
  })
  aboutProperty?: string | null;

  @ApiPropertyOptional({
    description: 'Price list for different unit types',
    type: [PropertyPriceListItemDto],
  })
  priceList?: PropertyPriceListItemDto[];

  @ApiProperty({
    description: 'Property category',
    example: 'Residential',
    required: false,
  })
  category?: string | null;

  @ApiProperty({
    description: 'Property type',
    example: 'Apartment',
    required: false,
  })
  propertyType?: string | null;

  @ApiProperty({
    description: 'BHK type',
    example: '2 BHK',
    required: false,
  })
  bhkType?: string | null;

  @ApiProperty({
    description: 'Construction status',
    example: 'under_construction',
    required: false,
  })
  constructionStatus?: string | null;

  @ApiProperty({
    description: 'Furnishing type',
    example: 'Fully Furnished',
    required: false,
  })
  furnishingType?: string | null;

  @ApiProperty({
    description: 'Listing type (Sale/Rent)',
    example: 'Sale',
    required: false,
  })
  listingType?: string | null;

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

  @ApiPropertyOptional({
    description: 'Verification status of the property',
    example: 'verified',
    enum: ['verified', 'unverified', 'pending'],
    required: false,
  })
  isVerified?: string | null;
}

