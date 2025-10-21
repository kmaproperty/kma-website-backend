import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('master/property-types')
  @ApiOperation({ summary: 'Get filtered master data based on listing type and category' })
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
    description: 'Filtered property types retrieved successfully based on listing type and category',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid listing type or category',
  })
  async getFilteredMasterData(
    @Query('property-listing-type') listingType: string,
    @Query('property-category') category: string,
  ) {
    return await this.propertyService.getFilteredMasterData(listingType, category);
  }

  @Post('master/reseed')
  @ApiOperation({ 
    summary: 'Delete and reseed all master data',
    description: 'This endpoint deletes all existing master data in reverse dependency order and then reseeds it with fresh data. Use with caution as this will delete all existing data.'
  })
  @ApiResponse({
    status: 200,
    description: 'Master data reseeded successfully with counts and duration',
  })
  @ApiResponse({
    status: 500,
    description: 'Error during reseeding process',
  })
  async reseedMasterData() {
    return await this.propertyService.reseedMasterData();
  }

  @Get('cities/search')
  @ApiOperation({ 
    summary: 'Search cities with autocomplete',
    description: 'Search for cities by name. First searches local database, then falls back to Google Places API if needed. Returns combined unique results.'
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
    description: 'Cities found successfully. Results include source (database or google)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query (must be at least 2 characters)',
  })
  async searchCities(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return await this.propertyService.searchCities(query, limit ? parseInt(limit.toString(), 10) : 10);
  }
}