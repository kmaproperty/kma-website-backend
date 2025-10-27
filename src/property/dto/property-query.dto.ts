import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class MasterDataQueryDto {
  @ApiProperty({ 
    description: 'Property listing type code (e.g., "sale" or "rent")', 
    example: 'sale',
    required: true
  })
  @IsString()
  'property-listing-type': string;

  @ApiProperty({ 
    description: 'Property category code (e.g., "residential" or "commercial")', 
    example: 'residential',
    required: true
  })
  @IsString()
  'property-category': string;
}

export class CitySearchQueryDto {
  @ApiProperty({ 
    description: 'Search query (minimum 2 characters)', 
    example: 'Gurg',
    required: true
  })
  @IsString()
  q: string;

  @ApiProperty({ 
    description: 'Maximum number of results (default: 10)', 
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class SocietySearchQueryDto {
  @ApiProperty({ 
    description: 'Search query (minimum 2 characters)', 
    example: 'Green Park',
    required: true
  })
  @IsString()
  q: string;

  @ApiProperty({ 
    description: 'City ID to filter societies within a specific city', 
    example: 'uuid-of-city',
    required: false
  })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiProperty({ 
    description: 'City name to filter societies within a specific city (alternative to cityId)', 
    example: 'Gurgaon',
    required: false
  })
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiProperty({ 
    description: 'Maximum number of results (default: 10)', 
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class LocalitySearchQueryDto {
  @ApiProperty({ 
    description: 'Search query (minimum 2 characters)', 
    example: 'Sector 15',
    required: true
  })
  @IsString()
  q: string;

  @ApiProperty({ 
    description: 'City ID to filter localities within a specific city', 
    example: 'uuid-of-city',
    required: false
  })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiProperty({ 
    description: 'City name to filter localities within a specific city (alternative to cityId)', 
    example: 'Gurgaon',
    required: false
  })
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiProperty({ 
    description: 'Society ID to filter localities within a specific society', 
    example: 'uuid-of-society',
    required: false
  })
  @IsOptional()
  @IsString()
  societyId?: string;

  @ApiProperty({ 
    description: 'Society name to filter localities within a specific society (alternative to societyId)', 
    example: 'Green Park Society',
    required: false
  })
  @IsOptional()
  @IsString()
  societyName?: string;

  @ApiProperty({ 
    description: 'Maximum number of results (default: 10)', 
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class BhkTypesQueryDto {
  @ApiProperty({ 
    description: 'Society ID to get BHK types for', 
    example: 'uuid-of-society',
    required: true
  })
  @IsString()
  societyId: string;

  @ApiProperty({ 
    description: 'Optional property type ID to filter BHK types', 
    example: 'uuid-of-property-type',
    required: false
  })
  @IsOptional()
  @IsString()
  propertyTypeId?: string;
}

export class LocationSearchQueryDto {
  @ApiProperty({ 
    description: 'Search query (minimum 2 characters)', 
    example: 'Green Park',
    required: true
  })
  @IsString()
  q: string;

  @ApiProperty({ 
    description: 'City ID to filter results within a specific city', 
    example: 'uuid-of-city',
    required: false
  })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiProperty({ 
    description: 'City name to filter results within a specific city (alternative to cityId)', 
    example: 'Gurgaon',
    required: false
  })
  @IsOptional()
  @IsString()
  cityName?: string;

  @ApiProperty({ 
    description: 'Maximum number of results (default: 10)', 
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
