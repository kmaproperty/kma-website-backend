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

  async getAllMasterData(): Promise<any> {
    const listingTypes = await this.propertyListingTypeRepository.findAll();
    const categories = await this.propertyCategoryRepository.findAll();
    const propertyTypes = await this.propertyTypeRepository.findAll();
    const allBhkTypes = await this.bhkTypeRepository.findAll();
    const cities = await this.cityRepository.findAll();
    const localities = await this.localityRepository.findAll();
    const societies = await this.societyRepository.findAll();
    const allBuiltUpAreas = await this.builtUpAreaRepository.findAll();

    // Structure the data hierarchically
    const structuredData = listingTypes.map(listingType => ({
      id: listingType.id,
      name: listingType.name,
      code: listingType.code,
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        code: category.code,
        propertyTypes: propertyTypes.filter(pt => 
          pt.listingTypeId === listingType.id && pt.categoryId === category.id
        ).map(pt => ({
          id: pt.id,
          name: pt.name,
          code: pt.code,
          bhkTypes: allBhkTypes.filter(bhk => bhk.propertyTypeId === pt.id).map(bhk => ({
            id: bhk.id,
            name: bhk.name,
            code: bhk.code,
            sortOrder: bhk.sortOrder,
          })),
        })),
      })),
      cities: cities.map(city => ({
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state,
        localities: localities.filter(loc => loc.cityId === city.id).map(loc => ({
          id: loc.id,
          name: loc.name,
          sector: loc.sector,
          societies: societies
            .filter(soc => soc.localityId === loc.id)
            .map(soc => ({
              id: soc.id,
              name: soc.name,
              address: soc.address,
              pincode: soc.pincode,
              isVerified: soc.isVerified,
              builtUpAreas: allBuiltUpAreas
                .filter(bua => bua.societyId === soc.id)
                .map(bua => {
                  const bhkType = allBhkTypes.find(bhk => bhk.id === bua.bhkTypeId);
                  return {
                    id: bua.id,
                    superBuiltUpArea: bua.superBuiltUpArea,
                    carpetArea: bua.carpetArea,
                    noOfBathrooms: bua.noOfBathrooms,
                    bhkType: bhkType ? {
                      id: bhkType.id,
                      name: bhkType.name,
                      code: bhkType.code,
                    } : null,
                  };
                }),
            })),
        })),
      })),
    }));

    return structuredData;
  }

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

    // Get BHK types for the filtered property types
    const propertyTypeIds = propertyTypes.map(pt => pt.id);
    const bhkTypes = propertyTypeIds.length > 0 
      ? await this.bhkTypeRepository.findByPropertyTypeIds(propertyTypeIds)
      : [];

    // Get all cities with localities and societies
    const cities = await this.cityRepository.findAll();
    const localities = await this.localityRepository.findAll();
    const societies = await this.societyRepository.findAll();
    const allBuiltUpAreas = await this.builtUpAreaRepository.findAll();

    // Structure the response
    return {
      propertyTypes: propertyTypes.map(pt => ({
        id: pt.id,
        name: pt.name,
        code: pt.code,
        bhkTypes: bhkTypes
          .filter(bhk => bhk.propertyTypeId === pt.id)
          .map(bhk => ({
            id: bhk.id,
            name: bhk.name,
            code: bhk.code,
            sortOrder: bhk.sortOrder,
          })),
      })),
      cities: cities.map(city => ({
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state,
        localities: localities
          .filter(loc => loc.cityId === city.id)
          .map(loc => ({
            id: loc.id,
            name: loc.name,
            sector: loc.sector,
            societies: societies
              .filter(soc => soc.localityId === loc.id)
              .map(soc => ({
                id: soc.id,
                name: soc.name,
                address: soc.address,
                pincode: soc.pincode,
                isVerified: soc.isVerified,
                builtUpAreas: allBuiltUpAreas
                  .filter(bua => bua.societyId === soc.id)
                  .map(bua => {
                    const bhkType = bhkTypes.find(bhk => bhk.id === bua.bhkTypeId);
                    return {
                      id: bua.id,
                      superBuiltUpArea: bua.superBuiltUpArea,
                      carpetArea: bua.carpetArea,
                      noOfBathrooms: bua.noOfBathrooms,
                      bhkType: bhkType ? {
                        id: bhkType.id,
                        name: bhkType.name,
                        code: bhkType.code,
                      } : null,
                    };
                  }),
              })),
          })),
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