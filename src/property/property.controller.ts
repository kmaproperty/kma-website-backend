import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { 
  MasterDataResponseDto, 
  ReseedMasterDataResponseDto, 
  CityResponseDto, 
  SocietyResponseDto, 
  LocalityResponseDto, 
  BhkTypeResponseDto, 
  PropertyResponseDto,
  ListingTypeResponseDto,
  CategoryResponseDto,
  LocationResponseDto 
} from './dto/property-response.dto';
import { 
  MasterDataQueryDto, 
  CitySearchQueryDto, 
  SocietySearchQueryDto, 
  LocalitySearchQueryDto, 
  BhkTypesQueryDto,
  LocationSearchQueryDto 
} from './dto/property-query.dto';

@ApiTags('Property')
@Controller('property')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('master/property-types')
  @ApiOperation({
    summary: 'Get filtered master data based on listing type and category',
  })
  @ApiQuery({
    name: 'property-listing-type',
    required: true,
    description: 'Property listing type code (e.g., "sale" or "rent")',
    example: 'sale',
  })
  @ApiQuery({
    name: 'property-category',
    required: true,
    description: 'Property category code (e.g., "residential" or "commercial")',
    example: 'residential',
  })
  @ApiResponse({
    status: 200,
    description:
      'Filtered property types retrieved successfully based on listing type and category',
    type: MasterDataResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid listing type or category',
  })
  async getFilteredMasterData(
    @Query() query: MasterDataQueryDto,
  ): Promise<MasterDataResponseDto> {
    return await this.propertyService.getFilteredMasterData(
      query['property-listing-type'],
      query['property-category'],
    );
  }

  @Post('master/reseed')
  @ApiOperation({
    summary: 'Delete and reseed all master data',
    description:
      'This endpoint deletes all existing master data in reverse dependency order and then reseeds it with fresh data. Use with caution as this will delete all existing data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Master data reseeded successfully with counts and duration',
    type: ReseedMasterDataResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error during reseeding process',
  })
  async reseedMasterData(): Promise<ReseedMasterDataResponseDto> {
    return await this.propertyService.reseedMasterData();
  }

  @Get('listing-types')
  @ApiOperation({
    summary: 'Get all property listing types',
    description:
      'Returns all available property listing types (e.g., Sale, Rent)',
  })
  @ApiResponse({
    status: 200,
    description: 'Listing types retrieved successfully',
    type: [ListingTypeResponseDto],
  })
  async getListingTypes(): Promise<ListingTypeResponseDto[]> {
    return await this.propertyService.getAllListingTypes();
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all property categories',
    description:
      'Returns all available property categories (e.g., Residential, Commercial)',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async getCategories(): Promise<CategoryResponseDto[]> {
    return await this.propertyService.getAllCategories();
  }

  @Get('cities/search')
  @ApiOperation({
    summary: 'Search cities with autocomplete',
    description:
      'Search for cities by name. First searches local database, then falls back to Google Places API if needed. Returns combined unique results.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (minimum 2 characters)',
    example: 'Gurg',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description:
      'Cities found successfully. Results include source (database or google)',
    type: [CityResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query (must be at least 2 characters)',
  })
  async searchCities(
    @Query() query: CitySearchQueryDto,
  ): Promise<CityResponseDto[]> {
    return await this.propertyService.searchCities(
      query.q,
      query.limit,
    );
  }

  @Get('locations/search')
  @ApiOperation({
    summary: 'Search locations (societies with locality names)',
    description:
      'Search for societies by name or by locality name. First searches local database, then falls back to Google Places API if needed. Can be filtered by city.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (minimum 2 characters)',
    example: 'Green Park',
  })
  @ApiQuery({
    name: 'cityId',
    required: false,
    description: 'City ID to filter results within a specific city',
    example: 'uuid-of-city',
  })
  @ApiQuery({
    name: 'cityName',
    required: false,
    description:
      'City name to filter results within a specific city (alternative to cityId)',
    example: 'Gurgaon',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description:
      'Locations found successfully. Results include society name and locality name. Results include source (database or google)',
    type: [LocationResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query (must be at least 2 characters)',
  })
  async searchLocations(
    @Query() query: LocationSearchQueryDto,
  ): Promise<LocationResponseDto[]> {
    return await this.propertyService.searchLocations(
      query.q,
      query.cityId,
      query.cityName,
      query.limit,
    );
  }

  @Get('bhk-types-and-areas')
  @ApiOperation({
    summary: 'Get BHK types and built-up areas',
    description:
      'Returns BHK types and their corresponding built-up areas. If societyId is not provided, returns default BHK options (1,2,3,4,5) with default built-up areas. If societyId is provided, can optionally filter by propertyTypeId. If no data found for the society, returns empty array. If data found, returns only the BHK types and built-up areas that exist in DB.',
  })
  @ApiQuery({
    name: 'societyId',
    required: false,
    description: 'Society ID to filter BHK types and built-up areas for a specific society (optional)',
    example: 'uuid-of-society',
  })
  @ApiQuery({
    name: 'propertyTypeId',
    required: false,
    description: 'Property type ID to filter BHK types when societyId is provided (optional)',
    example: 'uuid-of-property-type',
  })
  @ApiResponse({
    status: 200,
    description: 'BHK types and built-up areas retrieved successfully',
    type: [BhkTypeResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid society ID or society not found',
  })
  async getBhkTypesAndBuiltUpAreas(
    @Query('societyId') societyId?: string,
    @Query('propertyTypeId') propertyTypeId?: string,
  ): Promise<BhkTypeResponseDto[]> {
    return await this.propertyService.getBhkTypesAndBuiltUpAreasBySociety(
      societyId,
      propertyTypeId,
    );
  }

  @Post('/step-1')
  @ApiOperation({
    summary: 'Step 1: Create a new property',
    description:
      'Creates a new property with automatic master data creation if needed. Can accept either IDs or names for city, society, BHK type, and built-up area. Locality information should be provided via society.localityName field (no separate locality object needed). If names are provided, new entries will be created in master tables.',
  })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    type: PropertyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid property data or missing required fields',
  })
  async createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    return await this.propertyService.createProperty(createPropertyDto);
  }
}
