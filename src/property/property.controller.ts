import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { CreatePropertyStep1Dto } from './dto/create-property.dto';
import { CreatePropertyStep2Dto } from './dto/create-property-step2.dto';
import { CreatePropertyStep3Dto } from './dto/create-property-step3.dto';
import { CreatePropertyStep4Dto } from './dto/create-property-step4.dto';
import { ResetPropertyDto } from './dto/reset-property.dto';
import {
  MasterDataResponseDto,
  ReseedMasterDataResponseDto,
  CityResponseDto,
  SocietyResponseDto,
  LocalityResponseDto,
  BhkTypeResponseDto,
  PropertyResponseDto,
  PropertyStatusResponseDto,
  PropertyStep2ResponseDto,
  ListingTypeResponseDto,
  CategoryResponseDto,
  LocationResponseDto,
} from './dto/property-response.dto';
import {
  MasterDataQueryDto,
  CitySearchQueryDto,
  SocietySearchQueryDto,
  LocalitySearchQueryDto,
  BhkTypesQueryDto,
  LocationSearchQueryDto,
} from './dto/property-query.dto';

@ApiTags('Property')
@Controller('property')
@UseGuards(JwtAuthGuard)
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
    return await this.propertyService.searchCities(query.q, query.limit);
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

  @Get('localities/search')
  @ApiOperation({
    summary: 'Search localities within a specific city',
    description:
      'Search for localities within a specific city. First searches the local database (master_localities table), then falls back to Google Places Autocomplete API if needed. Returns combined unique results with source indication (database or google).',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (minimum 2 characters)',
    example: 'Sector 15',
  })
  @ApiQuery({
    name: 'cityName',
    required: true,
    description: 'City name to search localities within',
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
      'Localities found successfully. Results include source (database or google)',
    type: [LocalityResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query or missing city name',
  })
  async searchLocalities(
    @Query() query: LocalitySearchQueryDto,
  ): Promise<LocalityResponseDto[]> {
    if (!query.cityName) {
      throw new BadRequestException('City name is required');
    }
    
    return await this.propertyService.searchLocalitiesAutocomplete(
      query.q,
      query.cityName,
      query.limit,
    );
  }

  @Get('bhk-types-and-areas')
  @ApiOperation({
    summary: 'Get BHK types and built-up areas',
    description:
      'Returns BHK types and their corresponding built-up areas. If neither localityId nor societyId is provided, returns default BHK options (1,2,3,4,5) with default built-up areas. If localityId is provided, searches by localityId (prioritized over societyId). If only societyId is provided, searches by societyId. Can optionally filter by propertyTypeId. If no data found, returns empty array. If data found, returns only the BHK types and built-up areas that exist in DB.',
  })
  @ApiQuery({
    name: 'localityId',
    required: false,
    description:
      'Locality ID to filter BHK types and built-up areas for a specific locality (optional, prioritized over societyId)',
    example: 'uuid-of-locality',
  })
  @ApiQuery({
    name: 'societyId',
    required: false,
    description:
      'Society ID to filter BHK types and built-up areas for a specific society (optional, used if localityId is not provided)',
    example: 'uuid-of-society',
  })
  @ApiQuery({
    name: 'propertyTypeId',
    required: false,
    description:
      'Property type ID to filter BHK types when localityId or societyId is provided (optional)',
    example: 'uuid-of-property-type',
  })
  @ApiResponse({
    status: 200,
    description: 'BHK types and built-up areas retrieved successfully',
    type: [BhkTypeResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid locality ID, society ID, or not found',
  })
  async getBhkTypesAndBuiltUpAreas(
    @Query('localityId') localityId?: string,
    @Query('societyId') societyId?: string,
    @Query('propertyTypeId') propertyTypeId?: string,
  ): Promise<BhkTypeResponseDto[]> {
    return await this.propertyService.getBhkTypesAndBuiltUpAreasBySociety(
      societyId,
      propertyTypeId,
      localityId,
    );
  }

  @Post('/step-1')
  @ApiOperation({
    summary: 'Step 1: Create or update a property',
    description:
      'Creates a new property or updates an existing property. Only listingTypeId and categoryId are required; propertyId and all other fields are optional. If propertyId is provided and exists, updates the existing property; otherwise creates a new one. Can accept either IDs or names for city, society, BHK type, and built-up area. Locality information should be provided via society.localityName field. If names are provided, new entries will be created in master tables.',
  })
  @ApiResponse({
    status: 201,
    description: 'Property created or updated successfully',
    type: PropertyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid property data, missing required fields, or property not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your own properties',
  })
  async createProperty(
    @Body() createPropertyDto: CreatePropertyStep1Dto,
    @Req() req: Request,
  ): Promise<PropertyResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.createProperty(
      createPropertyDto,
      req.user.id,
    );
  }

  @Post('/step-2')
  @ApiOperation({
    summary: 'Step 2: Update property with unit and rent details',
    description:
      'Updates property step 2 details. Only propertyId is required; all other fields are optional. Updates floor, total floors, unit identifiers, area, property age, tenant type, rent availability and date, rent amount, maintenance, security deposit, lock-in period, brokerage and negotiable flag with conditional validations based on provided fields.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated with step 2 completion',
    type: PropertyStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async updatePropertyStep2(
    @Body() body: CreatePropertyStep2Dto,
    @Req() req: Request,
  ): Promise<PropertyStatusResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.updatePropertyStep2(body, req.user.id);
  }

  @Post('/step-3')
  @ApiOperation({
    summary: 'Step 3: Update property with additional rooms, parking, power, furnishing',
    description:
      'Updates property step 3 details. Only propertyId is required; all other fields are optional. Includes additional rooms (array), reserved parking counts with bounds (0-100), power back-up, furnish type, optional furnishings, and property description (AI can auto-generate if omitted).',
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated with step 3 completion',
    type: PropertyStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async updatePropertyStep3(
    @Body() body: CreatePropertyStep3Dto,
    @Req() req: Request,
  ): Promise<PropertyStatusResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.updatePropertyStep3(body, req.user.id);
  }

  @Get('/step-3/:propertyId')
  @ApiOperation({
    summary: 'Get property step 3 details',
    description:
      'Retrieves the saved property step 3 details by property ID. Only the property owner can view their property details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property step 3 details retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Property not found or you can only view your own properties',
  })
  async getPropertyStep3Details(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
  ): Promise<any> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.getPropertyStep3Details(propertyId, req.user.id);
  }

  @Post('/step-4')
  @ApiOperation({
    summary: 'Step 4: Update property with photos and videos',
    description:
      'Updates property step 4 details (photos and videos). Requires minimum 2 photos with at least one cover image. Photos must include fileKey (from S3 upload) and view type. Videos are optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated with step 4 completion',
    type: PropertyStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async updatePropertyStep4(
    @Body() body: CreatePropertyStep4Dto,
    @Req() req: Request,
  ): Promise<PropertyStatusResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.updatePropertyStep4(body, req.user.id);
  }

  @Get('/step-4/:propertyId')
  @ApiOperation({
    summary: 'Get property step 4 details',
    description:
      'Retrieves the saved property step 4 details (photos and videos) by property ID. Only the property owner can view their property details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property step 4 details retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Property not found or you can only view your own properties',
  })
  async getPropertyStep4Details(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
  ): Promise<any> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.getPropertyStep4Details(propertyId, req.user.id);
  }

  @Post('/reset')
  @ApiOperation({
    summary: 'Reset property data for all steps',
    description:
      'Clears all saved property step data and reverts the completion progress back to step 1. Only the property owner can reset their property.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property data cleared successfully',
    type: PropertyStatusResponseDto,
  })
  async resetProperty(
    @Body() body: ResetPropertyDto,
    @Req() req: Request,
  ): Promise<PropertyStatusResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.resetProperty(body.propertyId, req.user.id);
  }

  @Get('/step-1/:propertyId')
  @ApiOperation({
    summary: 'Get property step 1 details',
    description:
      'Retrieves the saved property step 1 details by property ID. Only the property owner can view their property details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property step 1 details retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Property not found or you can only view your own properties',
  })
  async getPropertyStep1Details(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
  ): Promise<any> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.getPropertyStep1Details(propertyId, req.user.id);
  }

  @Get('/step-2/:propertyId')
  @ApiOperation({
    summary: 'Get property step 2 details',
    description:
      'Retrieves the saved property step 2 details by property ID. Only the property owner can view their property details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property step 2 details retrieved successfully',
    type: PropertyStep2ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Property not found or you can only view your own properties',
  })
  async getPropertyStep2Details(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
  ): Promise<PropertyStep2ResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.propertyService.getPropertyStep2Details(propertyId, req.user.id);
  }
}
