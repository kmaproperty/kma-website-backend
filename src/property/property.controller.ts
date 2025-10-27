import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
  Body,
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

@ApiTags('Properties')
@Controller('properties')
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
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid listing type or category',
  })
  async getFilteredMasterData(
    @Query('property-listing-type') listingType: string,
    @Query('property-category') category: string,
  ): Promise<any> {
    return await this.propertyService.getFilteredMasterData(
      listingType,
      category,
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
  })
  @ApiResponse({
    status: 500,
    description: 'Error during reseeding process',
  })
  async reseedMasterData(): Promise<any> {
    return await this.propertyService.reseedMasterData();
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
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query (must be at least 2 characters)',
  })
  async searchCities(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return await this.propertyService.searchCities(
      query,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  @Get('societies/search')
  @ApiOperation({
    summary: 'Search societies with autocomplete',
    description:
      'Search for societies by name. First searches local database, then falls back to Google Places API if needed. Can be filtered by city.',
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
    description: 'City ID to filter societies within a specific city',
    example: 'uuid-of-city',
  })
  @ApiQuery({
    name: 'cityName',
    required: false,
    description:
      'City name to filter societies within a specific city (alternative to cityId)',
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
      'Societies found successfully. Results include source (database or google)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query (must be at least 2 characters)',
  })
  async searchSocieties(
    @Query('q') query: string,
    @Query('cityId') cityId?: string,
    @Query('cityName') cityName?: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return await this.propertyService.searchSocieties(
      query,
      cityId,
      cityName,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  @Get('localities/search')
  @ApiOperation({
    summary: 'Search localities with autocomplete',
    description:
      'Search for localities by name. First searches local database, then falls back to Google Places API if needed. Can be filtered by city and society.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (minimum 2 characters)',
    example: 'Sector 15',
  })
  @ApiQuery({
    name: 'cityId',
    required: false,
    description: 'City ID to filter localities within a specific city',
    example: 'uuid-of-city',
  })
  @ApiQuery({
    name: 'cityName',
    required: false,
    description:
      'City name to filter localities within a specific city (alternative to cityId)',
    example: 'Gurgaon',
  })
  @ApiQuery({
    name: 'societyId',
    required: false,
    description: 'Society ID to filter localities within a specific society',
    example: 'uuid-of-society',
  })
  @ApiQuery({
    name: 'societyName',
    required: false,
    description:
      'Society name to filter localities within a specific society (alternative to societyId)',
    example: 'Green Park Society',
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
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query (must be at least 2 characters)',
  })
  async searchLocalities(
    @Query('q') query: string,
    @Query('cityId') cityId?: string,
    @Query('cityName') cityName?: string,
    @Query('societyId') societyId?: string,
    @Query('societyName') societyName?: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return await this.propertyService.searchLocalities(
      query,
      cityId,
      cityName,
      societyId,
      societyName,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  @Get('bhk-types-and-areas/society/:societyId')
  @ApiOperation({
    summary: 'Get BHK types and built-up areas for a specific society',
    description:
      'Returns BHK types and their corresponding built-up areas available for a specific society. If no data found for the society, returns default BHK options (1,2,3,4,5) with default built-up areas. If data found, returns only the BHK types and built-up areas that exist in DB for that society.',
  })
  @ApiQuery({
    name: 'propertyTypeId',
    required: false,
    description: 'Optional property type ID to filter BHK types',
    example: 'uuid-of-property-type',
  })
  @ApiResponse({
    status: 200,
    description: 'BHK types and built-up areas retrieved successfully for the society',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'string' },
          sortOrder: { type: 'number' },
          propertyTypeId: { type: 'string' },
          societyId: { type: 'string' },
          builtUpAreas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                superBuiltUpArea: { type: 'number' },
                carpetArea: { type: 'number' },
                noOfBathrooms: { type: 'number' },
                bhkTypeId: { type: 'string' },
                societyId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid society ID or society not found',
  })
  async getBhkTypesAndBuiltUpAreasBySociety(
    @Param('societyId') societyId: string,
    @Query('propertyTypeId') propertyTypeId?: string,
  ): Promise<any> {
    return await this.propertyService.getBhkTypesAndBuiltUpAreasBySociety(
      societyId,
      propertyTypeId,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new property',
    description:
      'Creates a new property with automatic master data creation if needed. Can accept either IDs or names for city, society, locality, BHK type, and built-up area. If names are provided, new entries will be created in master tables.',
  })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid property data or missing required fields',
  })
  async createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
  ): Promise<any> {
    return await this.propertyService.createProperty(createPropertyDto);
  }
}
