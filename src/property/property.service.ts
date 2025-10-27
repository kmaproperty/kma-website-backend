import { Injectable, BadRequestException } from '@nestjs/common';
import { PropertyListingTypeRepository } from './repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { BhkTypeRepository } from './repositories/bhk-type.repository';
import { BuiltUpAreaRepository } from './repositories/built-up-area.repository';
import { CityRepository } from './repositories/city.repository';
import { LocalityRepository } from './repositories/locality.repository';
import { SocietyRepository } from './repositories/society.repository';
import { PropertyRepository } from './repositories/property.repository';
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
    private readonly propertyRepository: PropertyRepository,
    private readonly masterDataSeederService: MasterDataSeederService,
    private readonly googlePlacesService: GooglePlacesService,
  ) {}

  async getFilteredMasterData(
    listingTypeCode: string,
    categoryCode: string,
  ): Promise<any> {
    // Validate and get listing type
    const listingType =
      await this.propertyListingTypeRepository.findByCode(listingTypeCode);
    if (!listingType) {
      throw new BadRequestException(
        `Invalid property listing type: ${listingTypeCode}`,
      );
    }

    // Validate and get category
    const category =
      await this.propertyCategoryRepository.findByCode(categoryCode);
    if (!category) {
      throw new BadRequestException(
        `Invalid property category: ${categoryCode}`,
      );
    }

    // Get filtered property types based on listing type and category
    const propertyTypes =
      await this.propertyTypeRepository.findByListingTypeAndCategory(
        listingType.id,
        category.id,
      );

    // Structure the response - only return property types
    return {
      propertyTypes: propertyTypes.map((pt) => ({
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
      throw new BadRequestException(
        'Search query must be at least 2 characters long',
      );
    }

    // First, search in local database
    const localCities = await this.cityRepository.searchByName(
      query.trim(),
      limit,
    );

    // If we have enough results from local DB, return them
    if (localCities.length >= 5) {
      return localCities.map((city) => ({
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
    const googleCities = await this.googlePlacesService.searchCities(
      query.trim(),
    );
    console.log(googleCities);

    // Combine results, prioritizing local database
    const combinedResults = [
      ...localCities.map((city) => ({
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state,
        latitude: city.latitude,
        longitude: city.longitude,
        source: 'database',
      })),
      ...googleCities.map((city) => ({
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
        (c) => c.name.toLowerCase() === city.name.toLowerCase(),
      );
      if (!existingCity) {
        acc.push(city);
      }
      return acc;
    }, [] as any[]);

    return uniqueCities.slice(0, limit);
  }

  /**
   * Search societies - first from database, then from Google Places API
   */
  async searchSocieties(
    query: string,
    cityId?: string,
    cityName?: string,
    limit: number = 10,
  ): Promise<any[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters long',
      );
    }

    let localSocieties: any[] = [];

    // First, search in local database
    if (cityId) {
      localSocieties = await this.societyRepository.searchByNameAndCity(
        query.trim(),
        cityId,
        limit,
      );
    } else {
      localSocieties = await this.societyRepository.searchByName(
        query.trim(),
        limit,
      );
    }

    // If we have enough results from local DB, return them
    if (localSocieties.length >= 5) {
      return localSocieties.map((society) => ({
        id: society.id,
        name: society.name,
        cityId: society.cityId,
        localityId: society.localityId,
        address: society.address,
        latitude: society.latitude,
        longitude: society.longitude,
        pincode: society.pincode,
        isVerified: society.isVerified,
        source: 'database',
      }));
    }

    // Get city name for Google search context
    let googleCityName: string | undefined;
    if (cityId) {
      const city = await this.cityRepository.findById(cityId);
      googleCityName = city?.name;
    } else if (cityName) {
      googleCityName = cityName;
    }

    // If not enough results, search from Google Places API
    const googleSocieties = await this.googlePlacesService.searchSocieties(
      query.trim(),
      googleCityName,
    );

    // Combine results, prioritizing local database
    const combinedResults = [
      ...localSocieties.map((society) => ({
        id: society.id,
        name: society.name,
        cityId: society.cityId,
        localityId: society.localityId,
        address: society.address,
        latitude: society.latitude,
        longitude: society.longitude,
        pincode: society.pincode,
        isVerified: society.isVerified,
        source: 'database',
      })),
      ...googleSocieties.map((society) => ({
        name: society.name,
        city: society.city,
        state: society.state,
        country: society.country,
        latitude: society.latitude,
        longitude: society.longitude,
        placeId: society.placeId,
        address: society.address,
        source: 'google',
      })),
    ];

    // Remove duplicates based on society name (case-insensitive)
    const uniqueSocieties = combinedResults.reduce((acc, society) => {
      const existingSociety = acc.find(
        (s) => s.name.toLowerCase() === society.name.toLowerCase(),
      );
      if (!existingSociety) {
        acc.push(society);
      }
      return acc;
    }, [] as any[]);

    return uniqueSocieties.slice(0, limit);
  }

  /**
   * Search localities - first from database, then from Google Places API
   */
  async searchLocalities(
    query: string,
    cityId?: string,
    cityName?: string,
    societyId?: string,
    societyName?: string,
    limit: number = 10,
  ): Promise<any[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters long',
      );
    }

    let localLocalities: any[] = [];

    // First, search in local database
    if (cityId && societyId) {
      localLocalities =
        await this.localityRepository.searchByNameAndCityAndSociety(
          query.trim(),
          cityId,
          societyId,
          limit,
        );
    } else if (cityId) {
      localLocalities = await this.localityRepository.searchByNameAndCity(
        query.trim(),
        cityId,
        limit,
      );
    } else {
      localLocalities = await this.localityRepository.searchByName(
        query.trim(),
        limit,
      );
    }

    // If we have enough results from local DB, return them
    if (localLocalities.length >= 5) {
      return localLocalities.map((locality) => ({
        id: locality.id,
        name: locality.name,
        sector: locality.sector,
        cityId: locality.cityId,
        latitude: locality.latitude,
        longitude: locality.longitude,
        source: 'database',
      }));
    }

    // Get city and society names for Google search context
    let googleCityName: string | undefined;
    let googleSocietyName: string | undefined;

    if (cityId) {
      const city = await this.cityRepository.findById(cityId);
      googleCityName = city?.name;
    } else if (cityName) {
      googleCityName = cityName;
    }

    if (societyId) {
      const society = await this.societyRepository.findById(societyId);
      googleSocietyName = society?.name;
    } else if (societyName) {
      googleSocietyName = societyName;
    }

    // If not enough results, search from Google Places API
    const googleLocalities = await this.googlePlacesService.searchLocalities(
      query.trim(),
      googleCityName,
      googleSocietyName,
    );

    // Combine results, prioritizing local database
    const combinedResults = [
      ...localLocalities.map((locality) => ({
        id: locality.id,
        name: locality.name,
        sector: locality.sector,
        cityId: locality.cityId,
        latitude: locality.latitude,
        longitude: locality.longitude,
        source: 'database',
      })),
      ...googleLocalities.map((locality) => ({
        name: locality.name,
        city: locality.city,
        state: locality.state,
        country: locality.country,
        latitude: locality.latitude,
        longitude: locality.longitude,
        placeId: locality.placeId,
        address: locality.address,
        source: 'google',
      })),
    ];

    // Remove duplicates based on locality name (case-insensitive)
    const uniqueLocalities = combinedResults.reduce((acc, locality) => {
      const existingLocality = acc.find(
        (l) => l.name.toLowerCase() === locality.name.toLowerCase(),
      );
      if (!existingLocality) {
        acc.push(locality);
      }
      return acc;
    }, [] as any[]);

    return uniqueLocalities.slice(0, limit);
  }

  /**
   * Get BHK types and their built-up areas for a specific society
   * If no data found for the society, returns default BHK options (1,2,3,4,5) with default built-up areas
   * If data found, returns only the BHK types and their built-up areas that exist in DB for that society
   */
  async getBhkTypesAndBuiltUpAreasBySociety(
    societyId: string,
    propertyTypeId?: string,
  ): Promise<any> {
    if (!societyId) {
      throw new BadRequestException('Society ID is required');
    }

    // Check if society exists
    const society = await this.societyRepository.findById(societyId);
    if (!society) {
      throw new BadRequestException(`Society with ID ${societyId} not found`);
    }

    let bhkTypes: any[] = [];

    if (propertyTypeId) {
      // Get BHK types for specific society and property type
      bhkTypes = await this.bhkTypeRepository.findBySocietyIdAndPropertyTypeId(
        societyId,
        propertyTypeId,
      );
    } else {
      // Get all BHK types for the society
      bhkTypes = await this.bhkTypeRepository.findBySocietyId(societyId);
    }

    // If no BHK types found for this society, return default options
    if (bhkTypes.length === 0) {
      const defaultBhkTypes = [
        { id: 'default-1', name: '1 BHK', code: '1bhk', sortOrder: 1 },
        { id: 'default-2', name: '2 BHK', code: '2bhk', sortOrder: 2 },
        { id: 'default-3', name: '3 BHK', code: '3bhk', sortOrder: 3 },
        { id: 'default-4', name: '4 BHK', code: '4bhk', sortOrder: 4 },
        { id: 'default-5', name: '5 BHK', code: '5bhk', sortOrder: 5 },
      ];

      const defaultBuiltUpAreas = [
        {
          id: 'default-1',
          superBuiltUpArea: 1000,
          carpetArea: 800,
          noOfBathrooms: 1,
          bhkTypeId: 'default-1',
          societyId: societyId,
        },
        {
          id: 'default-2',
          superBuiltUpArea: 1200,
          carpetArea: 1000,
          noOfBathrooms: 2,
          bhkTypeId: 'default-2',
          societyId: societyId,
        },
        {
          id: 'default-3',
          superBuiltUpArea: 1500,
          carpetArea: 1200,
          noOfBathrooms: 2,
          bhkTypeId: 'default-3',
          societyId: societyId,
        },
        {
          id: 'default-4',
          superBuiltUpArea: 1800,
          carpetArea: 1500,
          noOfBathrooms: 3,
          bhkTypeId: 'default-4',
          societyId: societyId,
        },
        {
          id: 'default-5',
          superBuiltUpArea: 2000,
          carpetArea: 1700,
          noOfBathrooms: 3,
          bhkTypeId: 'default-5',
          societyId: societyId,
        },
      ];

      // Return nested structure with BHK types and their built-up areas mapped
      return defaultBhkTypes.map(bhkType => ({
        ...bhkType,
        builtUpAreas: defaultBuiltUpAreas.filter(area => area.bhkTypeId === bhkType.id)
      }));
    }

    // Get built-up areas for each BHK type
    const bhkTypesWithBuiltUpAreas = await Promise.all(
      bhkTypes.map(async (bhkType) => {
        const builtUpAreas = await this.builtUpAreaRepository.findByBhkTypeIdAndSocietyId(
          bhkType.id,
          societyId,
        );

        // If no built-up areas found for this BHK type, return default options
        const areas = builtUpAreas.length === 0 ? [
          {
            id: `default-${bhkType.id}-1`,
            superBuiltUpArea: 1000,
            carpetArea: 800,
            noOfBathrooms: 1,
            bhkTypeId: bhkType.id,
            societyId: societyId,
          },
          {
            id: `default-${bhkType.id}-2`,
            superBuiltUpArea: 1200,
            carpetArea: 1000,
            noOfBathrooms: 2,
            bhkTypeId: bhkType.id,
            societyId: societyId,
          },
          {
            id: `default-${bhkType.id}-3`,
            superBuiltUpArea: 1500,
            carpetArea: 1200,
            noOfBathrooms: 2,
            bhkTypeId: bhkType.id,
            societyId: societyId,
          },
        ] : builtUpAreas.map((area) => ({
          id: area.id,
          superBuiltUpArea: area.superBuiltUpArea,
          carpetArea: area.carpetArea,
          noOfBathrooms: area.noOfBathrooms,
          bhkTypeId: area.bhkTypeId,
          societyId: area.societyId,
        }));

        return {
          id: bhkType.id,
          name: bhkType.name,
          code: bhkType.code,
          sortOrder: bhkType.sortOrder,
          propertyTypeId: bhkType.propertyTypeId,
          societyId: bhkType.societyId,
          builtUpAreas: areas,
        };
      }),
    );

    // Return nested structure with BHK types and their built-up areas mapped
    return bhkTypesWithBuiltUpAreas;
  }

  /**
   * Create a new property with automatic master data creation if needed
   */
  async createProperty(createPropertyDto: any): Promise<any> {
    const {
      listingTypeId,
      categoryId,
      propertyTypeId,
      bathrooms,
      builtUpAreaSqFt,
      carpetAreaSqFt,
      ageOfProperty,
      userId,
      customBhk,
      status = 'draft',
      city,
      society,
      locality,
      bhkType,
      builtUpArea,
    } = createPropertyDto;

    // Helper function to get or create city
    const getOrCreateCity = async (cityInfo: any) => {
      if (cityInfo.id) {
        const existingCity = await this.cityRepository.findById(cityInfo.id);
        if (!existingCity) {
          throw new BadRequestException(
            `City with ID ${cityInfo.id} not found`,
          );
        }
        return existingCity.id;
      } else if (cityInfo.name) {
        // Check if city exists by name
        const existingCity = await this.cityRepository.searchByName(
          cityInfo.name,
          1,
        );
        if (existingCity.length > 0) {
          return existingCity[0].id;
        }
        // Create new city
        const newCity = await this.cityRepository.createCity({
          name: cityInfo.name,
          code: cityInfo.name.toLowerCase().replace(/\s+/g, '-'),
          state: cityInfo.state,
          latitude: cityInfo.latitude,
          longitude: cityInfo.longitude,
        });
        return newCity.id;
      } else {
        throw new BadRequestException('City ID or name is required');
      }
    };

    // Helper function to get or create society
    const getOrCreateSociety = async (societyInfo: any, cityId: string) => {
      if (societyInfo.id) {
        const existingSociety = await this.societyRepository.findById(
          societyInfo.id,
        );
        if (!existingSociety) {
          throw new BadRequestException(
            `Society with ID ${societyInfo.id} not found`,
          );
        }
        return existingSociety.id;
      } else if (societyInfo.name) {
        // Check if society exists by name in the city
        const existingSociety =
          await this.societyRepository.searchByNameAndCity(
            societyInfo.name,
            cityId,
            1,
          );
        if (existingSociety.length > 0) {
          return existingSociety[0].id;
        }
        // Create new society (localityId will be set after locality is created)
        const newSociety = await this.societyRepository.createSociety({
          name: societyInfo.name,
          cityId: cityId,
          localityId: '', // Temporary empty string, will be updated later
          address: societyInfo.address,
          pincode: societyInfo.pincode,
          latitude: societyInfo.latitude,
          longitude: societyInfo.longitude,
          isVerified: false,
        });
        return newSociety.id;
      } else {
        throw new BadRequestException('Society ID or name is required');
      }
    };

    // Helper function to get or create locality
    const getOrCreateLocality = async (localityInfo: any, cityId: string) => {
      if (localityInfo.id) {
        const existingLocality = await this.localityRepository.findById(
          localityInfo.id,
        );
        if (!existingLocality) {
          throw new BadRequestException(
            `Locality with ID ${localityInfo.id} not found`,
          );
        }
        return existingLocality.id;
      } else if (localityInfo.name) {
        // Check if locality exists by name in the city
        const existingLocality =
          await this.localityRepository.searchByNameAndCity(
            localityInfo.name,
            cityId,
            1,
          );
        if (existingLocality.length > 0) {
          return existingLocality[0].id;
        }
        // Create new locality
        const newLocality = await this.localityRepository.createLocality({
          name: localityInfo.name,
          sector: localityInfo.sector,
          cityId: cityId,
          latitude: localityInfo.latitude,
          longitude: localityInfo.longitude,
        });
        return newLocality.id;
      } else {
        throw new BadRequestException('Locality ID or name is required');
      }
    };

    // Helper function to get or create BHK type
    const getOrCreateBhkType = async (bhkTypeInfo: any, societyId: string) => {
      if (bhkTypeInfo.id) {
        const existingBhkType = await this.bhkTypeRepository.findById(
          bhkTypeInfo.id,
        );
        if (!existingBhkType) {
          throw new BadRequestException(
            `BHK Type with ID ${bhkTypeInfo.id} not found`,
          );
        }
        return existingBhkType.id;
      } else if (bhkTypeInfo.name) {
        // Check if BHK type exists by name for the society
        const existingBhkType =
          await this.bhkTypeRepository.findBySocietyId(societyId);
        const matchingBhkType = existingBhkType.find(
          (bt) => bt.name.toLowerCase() === bhkTypeInfo.name.toLowerCase(),
        );
        if (matchingBhkType) {
          return matchingBhkType.id;
        }
        // Create new BHK type
        const newBhkType = await this.bhkTypeRepository.createBhkType({
          name: bhkTypeInfo.name,
          code:
            bhkTypeInfo.code ||
            bhkTypeInfo.name.toLowerCase().replace(/\s+/g, '-'),
          sortOrder: bhkTypeInfo.sortOrder || 1,
          propertyTypeId: propertyTypeId,
          societyId: societyId,
        });
        return newBhkType.id;
      } else {
        throw new BadRequestException('BHK Type ID or name is required');
      }
    };

    // Helper function to get or create built-up area
    const getOrCreateBuiltUpArea = async (
      builtUpAreaInfo: any,
      bhkTypeId: string,
      societyId: string,
    ) => {
      if (builtUpAreaInfo.id) {
        const existingBuiltUpArea = await this.builtUpAreaRepository.findById(
          builtUpAreaInfo.id,
        );
        if (!existingBuiltUpArea) {
          throw new BadRequestException(
            `Built-up Area with ID ${builtUpAreaInfo.id} not found`,
          );
        }
        return existingBuiltUpArea.id;
      } else {
        // Create new built-up area
        const newBuiltUpArea =
          await this.builtUpAreaRepository.createBuiltUpArea({
            superBuiltUpArea:
              builtUpAreaInfo.superBuiltUpArea || builtUpAreaSqFt,
            carpetArea: builtUpAreaInfo.carpetArea || carpetAreaSqFt,
            noOfBathrooms: builtUpAreaInfo.noOfBathrooms || bathrooms,
            bhkTypeId: bhkTypeId,
            societyId: societyId,
          });
        return newBuiltUpArea.id;
      }
    };

    try {
      // Get or create city
      const cityId = await getOrCreateCity(city);

      // Get or create locality
      const localityId = await getOrCreateLocality(locality, cityId);

      // Get or create society
      const societyId = await getOrCreateSociety(society, cityId);

      // Update society with locality ID
      await this.societyRepository.updateSociety(societyId, { localityId });

      // Get or create BHK type
      const bhkTypeId = await getOrCreateBhkType(bhkType, societyId);

      // Get or create built-up area (not used in property creation, but kept for future use)
      await getOrCreateBuiltUpArea(builtUpArea, bhkTypeId, societyId);

      // Create the property
      const property = await this.propertyRepository.createProperty({
        listingTypeId,
        categoryId,
        cityId,
        societyId,
        localityId,
        propertyTypeId,
        bhkTypeId,
        customBhk,
        bathrooms,
        builtUpAreaSqFt,
        carpetAreaSqFt,
        ageOfProperty,
        userId,
        status,
      });

      return {
        id: property.id,
        listingTypeId: property.listingTypeId,
        categoryId: property.categoryId,
        cityId: property.cityId,
        societyId: property.societyId,
        localityId: property.localityId,
        propertyTypeId: property.propertyTypeId,
        bhkTypeId: property.bhkTypeId,
        customBhk: property.customBhk,
        bathrooms: property.bathrooms,
        builtUpAreaSqFt: property.builtUpAreaSqFt,
        carpetAreaSqFt: property.carpetAreaSqFt,
        ageOfProperty: property.ageOfProperty,
        userId: property.userId,
        status: property.status,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create property: ${error.message}`,
      );
    }
  }
}
