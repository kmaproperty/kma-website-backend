import { Injectable, BadRequestException } from '@nestjs/common';
import { PropertyListingTypeRepository } from './repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { BhkTypeRepository } from './repositories/bhk-type.repository';
import { BuiltUpAreaRepository } from './repositories/built-up-area.repository';
import { CityRepository } from './repositories/city.repository';
import { LocalityRepository } from './repositories/locality.repository';
import { SocietyRepository } from './repositories/society.repository';
import { MasterDataSeederService } from './services/master-data-seeder.service';
import { GooglePlacesService } from './services/google-places.service';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyListingTypeRepository: PropertyListingTypeRepository,
    private readonly propertyCategoryRepository: PropertyCategoryNewRepository,
    private readonly propertyTypeRepository: PropertyTypeRepository,
    private readonly bhkTypeRepository: BhkTypeRepository,
    private readonly builtUpAreaRepository: BuiltUpAreaRepository,
    private readonly cityRepository: CityRepository,
    private readonly localityRepository: LocalityRepository,
    private readonly societyRepository: SocietyRepository,
    private readonly masterDataSeederService: MasterDataSeederService,
    private readonly googlePlacesService: GooglePlacesService,
  ) {}

  async getFilteredMasterData(listingTypeCode: string, categoryCode: string): Promise<any> {
    // Validate and get listing type
    const listingType = await this.propertyListingTypeRepository.findByCode(listingTypeCode);
    if (!listingType) {
      throw new BadRequestException(`Invalid property listing type: ${listingTypeCode}`);
    }

    // Validate and get category
    const category = await this.propertyCategoryRepository.findByCode(categoryCode);
    if (!category) {
      throw new BadRequestException(`Invalid property category: ${categoryCode}`);
    }

    // Get filtered property types based on listing type and category
    const propertyTypes = await this.propertyTypeRepository.findByListingTypeAndCategory(
      listingType.id,
      category.id,
    );

    // Structure the response - only return property types
    return {
      propertyTypes: propertyTypes.map(pt => ({
        id: pt.id,
        name: pt.name,
        code: pt.code,
      })),
    };
  }

  /**
   * Reseed all master data (delete existing and insert fresh data)
   */
  async reseedMasterData(): Promise<{ message: string; details: any }> {
    return await this.masterDataSeederService.reseedAll();
  }

  /**
   * Search cities - first from database, then from Google Places API
   */
  async searchCities(query: string, limit: number = 10): Promise<any[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters long');
    }

    // First, search in local database
    const localCities = await this.cityRepository.searchByName(query.trim(), limit);

    // If we have enough results from local DB, return them
    if (localCities.length >= 5) {
      return localCities.map(city => ({
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state,
        latitude: city.latitude,
        longitude: city.longitude,
        source: 'database',
      }));
    }

    // If not enough results, search from Google Places API
    const googleCities = await this.googlePlacesService.searchCities(query.trim());

    // Combine results, prioritizing local database
    const combinedResults = [
      ...localCities.map(city => ({
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state,
        latitude: city.latitude,
        longitude: city.longitude,
        source: 'database',
      })),
      ...googleCities.map(city => ({
        name: city.name,
        state: city.state,
        country: city.country,
        latitude: city.latitude,
        longitude: city.longitude,
        placeId: city.placeId,
        source: 'google',
      })),
    ];

    // Remove duplicates based on city name (case-insensitive)
    const uniqueCities = combinedResults.reduce((acc, city) => {
      const existingCity = acc.find(
        c => c.name.toLowerCase() === city.name.toLowerCase()
      );
      if (!existingCity) {
        acc.push(city);
      }
      return acc;
    }, [] as any[]);

    return uniqueCities.slice(0, limit);
  }
}