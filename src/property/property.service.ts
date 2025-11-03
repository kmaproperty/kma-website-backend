import { Injectable, BadRequestException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { PropertyCompletionStep } from './enum/property-completion-step.enum';
import { PropertyListingTypeRepository } from './repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { BhkTypeRepository } from './repositories/bhk-type.repository';
import { BuiltUpAreaRepository } from './repositories/built-up-area.repository';
import { CityRepository } from './repositories/city.repository';
import { SocietyRepository } from './repositories/society.repository';
import { LocalityRepository } from './repositories/locality.repository';
import { PropertyRepository } from './repositories/property.repository';
import { MasterDataSeederService } from './services/master-data-seeder.service';
import { GooglePlacesService } from './services/google-places.service';
import {
  CreatePropertyStep2Dto,
  MaintenanceType,
  RentAvailability,
  SecurityDepositType,
  LockInType,
  BrokerageType,
  TenantType,
} from './dto/create-property-step2.dto';
import { CreatePropertyStep3Dto, FurnishingCountDto, FurnishType, PowerBackupType } from './dto/create-property-step3.dto';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyListingTypeRepository: PropertyListingTypeRepository,
    private readonly propertyCategoryRepository: PropertyCategoryNewRepository,
    private readonly propertyTypeRepository: PropertyTypeRepository,
    private readonly bhkTypeRepository: BhkTypeRepository,
    private readonly builtUpAreaRepository: BuiltUpAreaRepository,
    private readonly cityRepository: CityRepository,
    private readonly societyRepository: SocietyRepository,
    private readonly localityRepository: LocalityRepository,
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
   * Search localities - first from database, then from Google Places API
   */
  async searchLocalitiesAutocomplete(
    query: string,
    cityName: string,
    limit: number = 10,
  ): Promise<any[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters long',
      );
    }

    if (!cityName || cityName.trim().length === 0) {
      throw new BadRequestException('City name is required');
    }

    const trimmedQuery = query.trim();
    const trimmedCityName = cityName.trim();

    // First, search for the city by name to get cityId
    const cities = await this.cityRepository.searchByName(
      trimmedCityName,
      1,
    );
    
    let localLocalities: any[] = [];
    
    if (cities.length > 0) {
      const cityId = cities[0].id;
      // Search localities in local database by query and cityId
      localLocalities = await this.localityRepository.searchByNameAndCity(
        trimmedQuery,
        cityId,
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
        city: locality.city
          ? {
              id: locality.city.id,
              name: locality.city.name,
              code: locality.city.code,
            }
          : null,
        latitude: locality.latitude,
        longitude: locality.longitude,
        source: 'database',
      }));
    }

    // If not enough results, search from Google Places API
    const googleLocalities =
      await this.googlePlacesService.searchLocalitiesAutocomplete(
        trimmedQuery,
        trimmedCityName,
        limit,
      );

    // Combine results, prioritizing local database
    const combinedResults = [
      ...localLocalities.map((locality) => ({
        id: locality.id,
        name: locality.name,
        sector: locality.sector,
        cityId: locality.cityId,
        city: locality.city
          ? {
              id: locality.city.id,
              name: locality.city.name,
              code: locality.city.code,
            }
          : null,
        latitude: locality.latitude,
        longitude: locality.longitude,
        source: 'database',
      })),
      ...googleLocalities.map((locality) => {
        // Extract sector from locality name if available (e.g., "Sector 15" -> "Sector 15")
        const sectorMatch = locality.name?.match(/sector\s*\d+/i) || 
                           locality.displayName?.match(/sector\s*\d+/i);
        const sector = sectorMatch ? sectorMatch[0] : null;
        
        // Extract just the locality name without city (e.g., "Sector 15, Gurgaon" -> "Sector 15")
        const localityNameOnly = locality.name?.split(',')[0]?.trim() || 
                                 locality.displayName?.split(',')[0]?.trim() || 
                                 locality.name || 
                                 locality.displayName;

        return {
          name: localityNameOnly,
          sector: sector || locality.sector || null,
          city: locality.city || null,
          latitude: locality.latitude,
          longitude: locality.longitude,
          placeId: locality.place_id || locality.placeId,
          source: 'google',
        };
      }),
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
    societyId?: string,
    propertyTypeId?: string,
    localityId?: string,
  ): Promise<any> {
    // If neither localityId nor societyId is provided, return default response
    if (!localityId && !societyId) {
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
          societyId: 'default-society',
        },
        {
          id: 'default-2',
          superBuiltUpArea: 1200,
          carpetArea: 1000,
          noOfBathrooms: 2,
          bhkTypeId: 'default-2',
          societyId: 'default-society',
        },
        {
          id: 'default-3',
          superBuiltUpArea: 1500,
          carpetArea: 1200,
          noOfBathrooms: 2,
          bhkTypeId: 'default-3',
          societyId: 'default-society',
        },
        {
          id: 'default-4',
          superBuiltUpArea: 1800,
          carpetArea: 1500,
          noOfBathrooms: 3,
          bhkTypeId: 'default-4',
          societyId: 'default-society',
        },
        {
          id: 'default-5',
          superBuiltUpArea: 2000,
          carpetArea: 1700,
          noOfBathrooms: 3,
          bhkTypeId: 'default-5',
          societyId: 'default-society',
        },
      ];

      // Return nested structure with BHK types and their built-up areas mapped
      return defaultBhkTypes.map((bhkType) => ({
        ...bhkType,
        builtUpAreas: defaultBuiltUpAreas.filter(
          (area) => area.bhkTypeId === bhkType.id,
        ),
      }));
    }

    // Prioritize localityId over societyId
    const useLocalityId = !!localityId;
    const searchId = localityId || societyId;

    if (useLocalityId) {
      // Check if locality exists
      const locality = await this.localityRepository.findById(localityId!);
      if (!locality) {
        throw new BadRequestException(`Locality with ID ${localityId} not found`);
      }
    } else {
      // Check if society exists
      const society = await this.societyRepository.findById(societyId!);
      if (!society) {
        throw new BadRequestException(`Society with ID ${societyId} not found`);
      }
    }

    let bhkTypes: any[] = [];

    if (useLocalityId) {
      // Search by localityId
      if (propertyTypeId) {
        // Get BHK types for specific locality and property type
        bhkTypes = await this.bhkTypeRepository.findByLocalityIdAndPropertyTypeId(
          localityId!,
          propertyTypeId,
        );
      } else {
        // Get all BHK types for the locality
        bhkTypes = await this.bhkTypeRepository.findByLocalityId(localityId!);
      }
    } else {
      // Search by societyId
      if (propertyTypeId) {
        // Get BHK types for specific society and property type
        bhkTypes = await this.bhkTypeRepository.findBySocietyIdAndPropertyTypeId(
          societyId!,
          propertyTypeId,
        );
      } else {
        // Get all BHK types for the society
        bhkTypes = await this.bhkTypeRepository.findBySocietyId(societyId!);
      }
    }

    // If no BHK types found, return empty array
    if (bhkTypes.length === 0) {
      return [];
    }

    // Get built-up areas for each BHK type
    const bhkTypesWithBuiltUpAreas = await Promise.all(
      bhkTypes.map(async (bhkType) => {
        let builtUpAreas: any[] = [];
        
        if (useLocalityId) {
          // Search built-up areas by localityId
          builtUpAreas =
            await this.builtUpAreaRepository.findByBhkTypeIdAndLocalityId(
              bhkType.id,
              localityId!,
            );
        } else {
          // Search built-up areas by societyId
          builtUpAreas =
            await this.builtUpAreaRepository.findByBhkTypeIdAndSocietyId(
              bhkType.id,
              societyId!,
            );
        }

        // If no built-up areas found for this BHK type, return default options
        const defaultArea = {
          id: `default-${bhkType.id}-1`,
          superBuiltUpArea: 1000,
          carpetArea: 800,
          noOfBathrooms: 1,
          bhkTypeId: bhkType.id,
          societyId: useLocalityId ? null : societyId,
          localityId: useLocalityId ? localityId : null,
        };

        const areas =
          builtUpAreas.length === 0
            ? [
                {
                  ...defaultArea,
                  id: `default-${bhkType.id}-1`,
                },
                {
                  ...defaultArea,
                  id: `default-${bhkType.id}-2`,
                  superBuiltUpArea: 1200,
                  carpetArea: 1000,
                  noOfBathrooms: 2,
                },
                {
                  ...defaultArea,
                  id: `default-${bhkType.id}-3`,
                  superBuiltUpArea: 1500,
                  carpetArea: 1200,
                  noOfBathrooms: 2,
                },
              ]
            : builtUpAreas.map((area) => ({
                id: area.id,
                superBuiltUpArea: area.superBuiltUpArea,
                carpetArea: area.carpetArea,
                noOfBathrooms: area.noOfBathrooms,
                noOfBedrooms: area.noOfBedrooms ?? null,
                balconies: area.balconies ?? null,
                bhkTypeId: area.bhkTypeId,
                societyId: area.societyId,
                localityId: area.localityId,
              }));

        return {
          id: bhkType.id,
          name: bhkType.name,
          code: bhkType.code,
          sortOrder: bhkType.sortOrder,
          propertyTypeId: bhkType.propertyTypeId,
          societyId: bhkType.societyId,
          localityId: bhkType.localityId,
          builtUpAreas: areas,
        };
      }),
    );

    // Return nested structure with BHK types and their built-up areas mapped
    return bhkTypesWithBuiltUpAreas;
  }

  /**
   * Create a new property or update existing property with automatic master data creation if needed
   * If propertyId is provided and exists, updates the existing property; otherwise creates a new one
   */
  async createProperty(createPropertyDto: any, userId: string): Promise<any> {
    const {
      propertyId,
      listingTypeId,
      categoryId,
      propertyTypeId,
      bhk,
      transactionType,
      constructionStatus,
      ageOfProperty,
      possessionBy,
      possessionTime,
      facing,
      status = 'draft',
      city,
      society,
      locality,
      plotArea,
      plotAreaUnit,
      plotLength,
      plotWidth,
      plotFacingRoadWidth,
    } = createPropertyDto;

    // Helper function to get or create city
    const getOrCreateCity = async (cityInfo: any) => {
      if (!cityInfo) {
        return null;
      }
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
      }
      return null;
    };

    // Helper function to get or create society
    const getOrCreateSociety = async (societyInfo: any, cityId: string | null) => {
      if (!societyInfo || !cityId) {
        return null;
      }
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
        // Create new society with localityName
        const newSociety = await this.societyRepository.createSociety({
          name: societyInfo.name,
          cityId: cityId,
          localityName: societyInfo.localityName || '',
          address: societyInfo.address,
          pincode: societyInfo.pincode,
          latitude: societyInfo.latitude,
          longitude: societyInfo.longitude,
          isVerified: false,
        });
        return newSociety.id;
      }
      return null;
    };

    // Helper function to get or create locality
    const getOrCreateLocality = async (localityInfo: any, cityId: string | null) => {
      if (!localityInfo || !cityId) {
        return null;
      }
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
        const existingLocalities =
          await this.localityRepository.searchByNameAndCity(
            localityInfo.name,
            cityId,
            1,
          );
        if (existingLocalities.length > 0) {
          return existingLocalities[0].id;
        }
        // Create new locality
        const newLocality = await this.localityRepository.createLocality({
          name: localityInfo.name,
          cityId: cityId,
          sector: localityInfo.sector || null,
          latitude: localityInfo.latitude || null,
          longitude: localityInfo.longitude || null,
        });
        return newLocality.id;
      }
      return null;
    };

    // Helper function to get or create BHK type
    const getOrCreateBhk = async (bhkInfo: any, societyId: string | null, localityId: string | null, propertyTypeId?: string) => {
      if (!bhkInfo || (!societyId && !localityId)) {
        return null;
      }
      if (bhkInfo.id) {
        const existingBhk = await this.bhkTypeRepository.findById(bhkInfo.id);
        if (!existingBhk) {
          throw new BadRequestException(
            `BHK Type with ID ${bhkInfo.id} not found`,
          );
        }
        return existingBhk.id;
      } else if (bhkInfo.name) {
        // Check if BHK type exists by name for the society or locality
        let existingBhkTypes: any[] = [];
        if (societyId) {
          existingBhkTypes =
            await this.bhkTypeRepository.findBySocietyId(societyId);
        }
        // Note: If we add findByLocalityId method to repository, use it here for locality-based search
        const matchingBhkType = existingBhkTypes.find(
          (bt) => bt.name.toLowerCase() === bhkInfo.name.toLowerCase(),
        );
        if (matchingBhkType) {
          return matchingBhkType.id;
        }
        // Create new BHK type (propertyTypeId is optional now)
        if (!propertyTypeId) {
          throw new BadRequestException('Property type ID is required to create a new BHK type');
        }
        const newBhkType = await this.bhkTypeRepository.createBhkType({
          name: bhkInfo.name,
          code: bhkInfo.code || bhkInfo.name.toLowerCase().replace(/\s+/g, '-'),
          sortOrder: bhkInfo.sortOrder || 1,
          propertyTypeId: propertyTypeId,
          societyId: societyId,
          localityId: localityId,
        });
        return newBhkType.id;
      }
      return null;
    };

    // Helper function to get or create built-up area
    const getOrCreateBuiltUpArea = async (
      bhkInfo: any,
      bhkTypeId: string | null,
      societyId: string | null,
      localityId: string | null,
    ) => {
      if (!bhkInfo || !bhkTypeId || (!societyId && !localityId)) {
        return null;
      }

      // Skip built-up area creation if required fields are not provided
      // These fields are optional in the DTO, so we should gracefully handle their absence
      if (bhkInfo.buildUpAreaSqFt === undefined || bhkInfo.carpetAreaSqFt === undefined || bhkInfo.noOfBathrooms === undefined) {
        return null;
      }

      // Build where clause with proper null handling
      const whereClause: any = {
        superBuiltUpArea: bhkInfo.buildUpAreaSqFt,
        carpetArea: bhkInfo.carpetAreaSqFt,
        noOfBathrooms: bhkInfo.noOfBathrooms,
        bhkTypeId: bhkTypeId,
      };

      // Handle nullable societyId - use IsNull() if null, otherwise use the value
      whereClause.societyId =
        societyId === null ? IsNull() : societyId;

      // Handle nullable localityId - use IsNull() if null, otherwise use the value
      whereClause.localityId =
        localityId === null ? IsNull() : localityId;

      // Handle nullable fields - use IsNull() if undefined/null, otherwise use the value
      whereClause.noOfBedrooms =
        bhkInfo.noOfBedrooms == null ? IsNull() : bhkInfo.noOfBedrooms;
      whereClause.balconies =
        bhkInfo.balconies == null ? IsNull() : bhkInfo.balconies;

      // Check if built-up area already exists with these exact parameters
      const existingBuiltUpArea = await this.builtUpAreaRepository.findOne({
        where: whereClause,
      });

      if (existingBuiltUpArea) {
        return existingBuiltUpArea.id;
      }

      // Create new built-up area based on BHK info
      const newBuiltUpArea = await this.builtUpAreaRepository.createBuiltUpArea(
        {
          superBuiltUpArea: bhkInfo.buildUpAreaSqFt,
          carpetArea: bhkInfo.carpetAreaSqFt,
          noOfBathrooms: bhkInfo.noOfBathrooms,
          noOfBedrooms: bhkInfo.noOfBedrooms ?? null,
          balconies: bhkInfo.balconies ?? null,
          bhkTypeId: bhkTypeId,
          societyId: societyId,
          localityId: localityId,
        },
      );
      return newBuiltUpArea.id;
    };

    try {
      // Get or create city (optional)
      const cityId = await getOrCreateCity(city);

      // Get or create society (optional, requires cityId)
      const societyId = await getOrCreateSociety(society, cityId);

      // Get or create locality (optional, requires cityId)
      const localityId = await getOrCreateLocality(locality, cityId);

      // Get or create BHK type (optional, requires societyId or localityId and propertyTypeId)
      const bhkTypeId = await getOrCreateBhk(bhk, societyId, localityId, propertyTypeId);

      // Get or create built-up area (optional, requires bhk info)
      await getOrCreateBuiltUpArea(bhk, bhkTypeId, societyId, localityId);

      let property;

      // Check if property exists
      const existingProperty = propertyId
        ? await this.propertyRepository.findById(propertyId)
        : null;

      if (existingProperty) {
        // Update existing property
        // Check if user owns this property
        if (existingProperty.userId !== userId) {
          throw new BadRequestException(
            'You can only update your own properties',
          );
        }

        // Build update object with only provided fields
        const updateData: any = {
          listingTypeId,
          categoryId,
        };

        if (propertyTypeId !== undefined) {
          updateData.propertyTypeId = propertyTypeId;
        }
        if (cityId !== null && cityId !== undefined) {
          updateData.cityId = cityId;
        }
        if (societyId !== null && societyId !== undefined) {
          updateData.societyId = societyId;
        }
        if (localityId !== null && localityId !== undefined) {
          updateData.localityId = localityId;
        }
        if (bhkTypeId !== null && bhkTypeId !== undefined) {
          updateData.bhkTypeId = bhkTypeId;
        }
        if (ageOfProperty !== undefined) {
          updateData.ageOfProperty = ageOfProperty;
        }
        if (facing !== undefined) {
          updateData.facing = facing || null;
        }
        if (status !== undefined) {
          updateData.status = status;
        }
        if (transactionType !== undefined) {
          updateData.transactionType = transactionType;
        }
        if (constructionStatus !== undefined) {
          updateData.constructionStatus = constructionStatus;
        }
        if (possessionBy !== undefined) {
          updateData.possessionBy = possessionBy;
        }
        if (possessionTime !== undefined) {
          updateData.possessionTime = possessionTime;
        }
        if (plotArea !== undefined) {
          updateData.plotArea = plotArea;
        }
        if (plotAreaUnit !== undefined) {
          updateData.plotAreaUnit = plotAreaUnit || null;
        }
        if (plotLength !== undefined) {
          updateData.plotLength = plotLength;
        }
        if (plotWidth !== undefined) {
          updateData.plotWidth = plotWidth;
        }
        if (plotFacingRoadWidth !== undefined) {
          updateData.plotFacingRoadWidth = plotFacingRoadWidth || null;
        }

        updateData.completionStep = PropertyCompletionStep.STEP_1;

        // Update the property
        await this.propertyRepository.updateProperty(propertyId, updateData);

        // Get the updated property
        property = await this.propertyRepository.findById(propertyId);
      } else {
        // Create new property - propertyId is required but doesn't exist, so create new with that ID or generate new
        const createData: any = {
          listingTypeId,
          categoryId,
          userId,
          status,
          completionStep: PropertyCompletionStep.STEP_1,
        };

        if (propertyTypeId !== undefined) {
          createData.propertyTypeId = propertyTypeId;
        }
        if (cityId !== null && cityId !== undefined) {
          createData.cityId = cityId;
        }
        if (societyId !== null && societyId !== undefined) {
          createData.societyId = societyId;
        }
        if (localityId !== null && localityId !== undefined) {
          createData.localityId = localityId;
        }
        if (bhkTypeId !== null && bhkTypeId !== undefined) {
          createData.bhkTypeId = bhkTypeId;
        }
        if (ageOfProperty !== undefined) {
          createData.ageOfProperty = ageOfProperty;
        }
        if (facing !== undefined) {
          createData.facing = facing || null;
        }
        if (transactionType !== undefined) {
          createData.transactionType = transactionType;
        }
        if (constructionStatus !== undefined) {
          createData.constructionStatus = constructionStatus;
        }
        if (possessionBy !== undefined) {
          createData.possessionBy = possessionBy;
        }
        if (possessionTime !== undefined) {
          createData.possessionTime = possessionTime;
        }
        if (plotArea !== undefined) {
          createData.plotArea = plotArea;
        }
        if (plotAreaUnit !== undefined) {
          createData.plotAreaUnit = plotAreaUnit || null;
        }
        if (plotLength !== undefined) {
          createData.plotLength = plotLength;
        }
        if (plotWidth !== undefined) {
          createData.plotWidth = plotWidth;
        }
        if (plotFacingRoadWidth !== undefined) {
          createData.plotFacingRoadWidth = plotFacingRoadWidth || null;
        }

        // Create new property
        property = await this.propertyRepository.createProperty(createData);
      }

      return {
        id: property.id,
        status: property.status,
        completionStep:
          property.completionStep ?? PropertyCompletionStep.STEP_1,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create property: ${error.message}`,
      );
    }
  }

  async updatePropertyStep2(
    dto: CreatePropertyStep2Dto,
    userId: string,
  ): Promise<{ id: string; status: string; completionStep: number }> {
    const property = await this.propertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new BadRequestException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only update your own properties');
    }

    // Floor validations - only validate if both are provided
    if (dto.floorNumber != null && dto.totalFloors != null) {
      if (dto.floorNumber > dto.totalFloors) {
        throw new BadRequestException(
          'Selected floor exceeds total floors of this building',
        );
      }
    }

    // Rent availability validation - only if rentAvailability is provided
    if (dto.rentAvailability === RentAvailability.LATER) {
      if (!dto.availableFromDate) {
        throw new BadRequestException('Hint: Enter Available Date');
      }
      const sel = new Date(dto.availableFromDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(sel.getTime()) || sel < today) {
        throw new BadRequestException('Available date cannot be in the past');
      }
    }

    // Maintenance charge validation - only if maintenanceType is provided
    if (dto.maintenanceType === MaintenanceType.SEPARATE) {
      if (
        dto.maintenanceChargeAmount == null ||
        dto.maintenanceChargeAmount <= 0
      ) {
        throw new BadRequestException('Please enter the maintenance charges');
      }
    }

    // Security deposit validation - only if securityDepositType is provided
    if (dto.securityDepositType === SecurityDepositType.CUSTOM) {
      if (dto.monthlyRent == null) {
        throw new BadRequestException(
          'Please enter rent before specifying deposit',
        );
      }
      if (dto.securityDepositAmount == null || dto.securityDepositAmount < 0) {
        throw new BadRequestException('Please enter the security deposit');
      }
      if (dto.securityDepositAmount > dto.monthlyRent * 12) {
        throw new BadRequestException(
          'Deposit seems high as per market standards',
        );
      }
    }

    // Lock-in validation - only if lockInType is provided
    if (dto.lockInType === LockInType.CUSTOM) {
      if (dto.lockInMonths == null || dto.lockInMonths < 1) {
        throw new BadRequestException('Please Select Lock in Period');
      }
    }

    // Brokerage validation - only if brokerageType is provided
    if (dto.brokerageType === BrokerageType.CUSTOM) {
      if (dto.monthlyRent == null) {
        throw new BadRequestException(
          'Please enter rent before specifying brokerage',
        );
      }
      if (dto.brokerageAmount == null || dto.brokerageAmount < 0) {
        throw new BadRequestException('Please enter brokerage amount');
      }
      if (dto.brokerageAmount > dto.monthlyRent) {
        throw new BadRequestException(
          'Brokerage seems high as per market standards',
        );
      }
    }

    // Company occupancy requirement - only if tenantType is provided
    if (dto.tenantType === TenantType.COMPANY && !dto.companyOccupancy) {
      throw new BadRequestException('Please select company occupancy');
    }

    // Build update object with only provided fields
    const updateData: any = {
      completionStep: PropertyCompletionStep.STEP_2,
    };

    if (dto.floorNumber !== undefined) {
      updateData.floorNumber = dto.floorNumber;
    }
    if (dto.totalFloors !== undefined) {
      updateData.totalFloors = dto.totalFloors;
    }
    if (dto.flatNumber !== undefined) {
      updateData.flatNumber = dto.flatNumber ?? null;
    }
    if (dto.towerBlock !== undefined) {
      updateData.towerBlock = dto.towerBlock ?? null;
    }
    if (dto.propertyAreaAcre !== undefined) {
      updateData.propertyAreaAcre = dto.propertyAreaAcre ?? null;
    }
    if (dto.tenantType !== undefined) {
      updateData.tenantType = dto.tenantType ?? null;
    }
    if (dto.companyOccupancy !== undefined) {
      updateData.companyOccupancy = dto.companyOccupancy ?? null;
    }
    if (dto.rentAvailability !== undefined) {
      updateData.rentAvailability = dto.rentAvailability as any;
    }
    if (dto.availableFromDate !== undefined) {
      updateData.availableFromDate = dto.availableFromDate
        ? new Date(dto.availableFromDate)
        : null;
    }
    if (dto.monthlyRent !== undefined) {
      updateData.monthlyRent = dto.monthlyRent;
    }
    if (dto.maintenanceType !== undefined) {
      updateData.maintenanceType = dto.maintenanceType as any;
      updateData.maintenanceChargeAmount =
        dto.maintenanceType === MaintenanceType.SEPARATE
          ? dto.maintenanceChargeAmount!
          : null;
    }
    if (dto.securityDepositType !== undefined) {
      updateData.securityDepositType = dto.securityDepositType as any;
      updateData.securityDepositAmount =
        dto.securityDepositType === SecurityDepositType.CUSTOM
          ? dto.securityDepositAmount!
          : null;
    }
    if (dto.lockInType !== undefined) {
      updateData.lockInType = dto.lockInType as any;
      updateData.lockInMonths =
        dto.lockInType === LockInType.CUSTOM ? dto.lockInMonths! : null;
    }
    if (dto.brokerageType !== undefined) {
      updateData.brokerageType = dto.brokerageType as any;
      updateData.brokerageAmount =
        dto.brokerageType === BrokerageType.CUSTOM
          ? dto.brokerageAmount!
          : null;
    }
    if (dto.isBrokerageNegotiable !== undefined) {
      updateData.isBrokerageNegotiable = dto.isBrokerageNegotiable ?? false;
    }
    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }
    if (dto.plotArea !== undefined) {
      updateData.plotArea = dto.plotArea;
    }
    if (dto.plotAreaUnit !== undefined) {
      updateData.plotAreaUnit = dto.plotAreaUnit || null;
    }
    if (dto.plotNumber !== undefined) {
      updateData.plotNumber = dto.plotNumber || null;
    }
    if (dto.houseNumber !== undefined) {
      updateData.houseNumber = dto.houseNumber || null;
    }
    if (dto.villaNumber !== undefined) {
      updateData.villaNumber = dto.villaNumber || null;
    }
    if (dto.transactionType !== undefined) {
      updateData.transactionType = dto.transactionType as any;
    }
    if (dto.possessionStatus !== undefined) {
      updateData.possessionStatus = dto.possessionStatus as any;
    }
    if (dto.possessionDate !== undefined) {
      updateData.possessionDate = dto.possessionDate
        ? new Date(dto.possessionDate)
        : null;
    }
    if (dto.plotPrice !== undefined) {
      updateData.plotPrice = dto.plotPrice;
    }
    if (dto.brokerage !== undefined) {
      updateData.brokerage = dto.brokerage as any;
    }
    if (dto.loanAvailable !== undefined) {
      updateData.loanAvailable = dto.loanAvailable as any;
    }
    if (dto.facing !== undefined) {
      updateData.facing = dto.facing || null;
    }
    if (dto.boundaryWall !== undefined) {
      updateData.boundaryWall = dto.boundaryWall as any;
    }
    if (dto.noOfOpenSides !== undefined) {
      updateData.noOfOpenSides = dto.noOfOpenSides;
    }
    if (dto.floorsAllowedForConstruction !== undefined) {
      updateData.floorsAllowedForConstruction = dto.floorsAllowedForConstruction;
    }
    if (dto.constructionDone !== undefined) {
      updateData.constructionDone = dto.constructionDone as any;
    }
    if (dto.constructionType !== undefined) {
      updateData.constructionType = dto.constructionType || null;
    }
    if (dto.cornerProperty !== undefined) {
      updateData.cornerProperty = dto.cornerProperty as any;
    }
    if (dto.propertyDescription !== undefined) {
      updateData.propertyDescription = dto.propertyDescription || null;
    }

    await this.propertyRepository.updateProperty(dto.propertyId, updateData);

    const updated = await this.propertyRepository.findById(dto.propertyId);
    return { 
      id: updated!.id, 
      status: updated!.status, 
      completionStep: updated!.completionStep || PropertyCompletionStep.STEP_2 
    };
  }

  /**
   * Get all property listing types (Sale/Rent)
   */
  async getAllListingTypes(): Promise<any[]> {
    const listingTypes = await this.propertyListingTypeRepository.findAll();
    return listingTypes.map((lt) => ({
      id: lt.id,
      name: lt.name,
      code: lt.code,
    }));
  }

  /**
   * Get all property categories (Residential/Commercial)
   */
  async getAllCategories(): Promise<any[]> {
    const categories = await this.propertyCategoryRepository.findAll();
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      code: cat.code,
    }));
  }

  async updatePropertyStep3(
    dto: CreatePropertyStep3Dto,
    userId: string,
  ): Promise<{ id: string; status: string; completionStep: number }> {
    const property = await this.propertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new BadRequestException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only update your own properties');
    }

    // Build update object with only provided fields
    const updateData: any = {
      completionStep: PropertyCompletionStep.STEP_3,
    };

    if (dto.additionalRooms !== undefined) {
      updateData.additionalRooms = dto.additionalRooms && dto.additionalRooms.length > 0 ? dto.additionalRooms : null;
    }
    if (dto.reservedParkingCovered !== undefined) {
      updateData.reservedParkingCovered = dto.reservedParkingCovered;
    }
    if (dto.reservedParkingOpen !== undefined) {
      updateData.reservedParkingOpen = dto.reservedParkingOpen;
    }
    if (dto.powerBackup !== undefined) {
      updateData.powerBackup = dto.powerBackup as any;
    }
    if (dto.furnishType !== undefined) {
      updateData.furnishType = dto.furnishType as any;
    }
    if (dto.furnishingsCounts !== undefined) {
      const sanitized: FurnishingCountDto[] = (dto.furnishingsCounts || []).map(fc => ({
        item: fc.item,
        count: Math.min(100, Math.max(0, fc.count ?? 0)),
      }));
      updateData.furnishingsCounts = sanitized.length > 0 ? sanitized : null;
    }
    if (dto.amenities !== undefined) {
      updateData.amenities = dto.amenities && dto.amenities.length > 0 ? dto.amenities : null;
    }
    if (dto.waterSource !== undefined) {
      updateData.waterSource = dto.waterSource as any;
    }
    if (dto.isLiftAvailable !== undefined) {
      updateData.isLiftAvailable = dto.isLiftAvailable ?? null;
    }
    if (dto.propertyDescription !== undefined) {
      updateData.propertyDescription = dto.propertyDescription || null;
    }

    // If description not provided, auto-generate a simple one from available data
    if (dto.propertyDescription == null) {
      const parts: string[] = [];
      if (dto.furnishType) parts.push(`${dto.furnishType} unit`);
      if (dto.additionalRooms && dto.additionalRooms.length) {
        parts.push(`with ${dto.additionalRooms.join(', ')}`);
      }
      const covered = dto.reservedParkingCovered ?? property.reservedParkingCovered ?? 0;
      const open = dto.reservedParkingOpen ?? property.reservedParkingOpen ?? 0;
      if (covered || open) {
        parts.push(`reserved parking (${covered} covered${open ? `, ${open} open` : ''})`);
      }
      if (dto.powerBackup) parts.push(`${dto.powerBackup.toLowerCase()} power backup`);
      if (dto.furnishingsCounts && dto.furnishingsCounts.length) {
        const top = dto.furnishingsCounts
          .filter(fc => (fc.count ?? 0) > 0)
          .slice(0, 3)
          .map(fc => `${fc.count} ${fc.item}`);
        if (top.length) parts.push(`includes ${top.join(', ')}`);
      }
      if (dto.amenities && dto.amenities.length) {
        parts.push(`amenities: ${dto.amenities.slice(0, 5).join(', ')}`);
      }
      const sentence = parts.filter(Boolean).join(', ');
      if (sentence) {
        updateData.propertyDescription = `Well-maintained ${sentence}.`;
      }
    }

    await this.propertyRepository.updateProperty(dto.propertyId, updateData);
    const updated = await this.propertyRepository.findById(dto.propertyId);
    return {
      id: updated!.id,
      status: updated!.status,
      completionStep:
        updated!.completionStep || PropertyCompletionStep.STEP_3,
    };
  }

  async getPropertyStep3Details(
    propertyId: string,
    userId: string,
  ): Promise<any> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only view your own properties');
    }

    return {
      propertyId: property.id,
      additionalRooms: property.additionalRooms || [],
      reservedParkingCovered: property.reservedParkingCovered ?? null,
      reservedParkingOpen: property.reservedParkingOpen ?? null,
      powerBackup: property.powerBackup || null,
      furnishType: property.furnishType || null,
      furnishingsCounts: property.furnishingsCounts || [],
      amenities: property.amenities || [],
      waterSource: property.waterSource || null,
      isLiftAvailable: property.isLiftAvailable ?? null,
      propertyDescription: property.propertyDescription || null,
      status: property.status,
      completionStep: property.completionStep || 0,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }

  /**
   * Search for societies by name or locality name
   */
  async searchLocations(
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

    // Search societies by name or locality name
    const localResults = await this.societyRepository.searchByNameOrLocality(
      query.trim(),
      cityId,
      limit * 2, // Get more results to account for filtering
    );

    // Format results consistently
    const formattedResults = localResults
      .map((society) => ({
        id: society.id,
        name: society.name,
        localityName: society.localityName,
        address: society.address,
        latitude: society.latitude ? parseFloat(society.latitude.toString()) : undefined,
        longitude: society.longitude ? parseFloat(society.longitude.toString()) : undefined,
        source: 'database',
      }))
      .slice(0, limit); // Limit the results

    // If we have enough results, return them
    if (formattedResults.length >= 5) {
      return formattedResults.slice(0, limit);
    }

    // If not enough results, search Google Places API
    let googleCityName: string | undefined;
    if (cityId) {
      const city = await this.cityRepository.findById(cityId);
      googleCityName = city?.name;
    } else if (cityName) {
      googleCityName = cityName;
    }

    const googleSocieties = await this.googlePlacesService.searchSocieties(
      query.trim(),
      googleCityName,
    );

    // Add Google results with same format as database results
    const googleResults = googleSocieties.map((society) => ({
      id: `google-${Math.random()}`,
      name: society.name,
      localityName: society.localityName,
      address: society.address,
      latitude: society.latitude,
      longitude: society.longitude,
      source: 'google',
    }));

    // Combine results
    const combinedResults = [...formattedResults, ...googleResults];

    // Remove duplicates based on name
    const uniqueResults = combinedResults.reduce((acc, item) => {
      const existing = acc.find(
        (i) => i.name.toLowerCase() === item.name.toLowerCase(),
      );
      if (!existing) {
        acc.push(item);
      }
      return acc;
    }, [] as any[]);

    return uniqueResults.slice(0, limit);
  }

  /**
   * Get property step 1 details by property ID
   */
  async getPropertyStep1Details(
    propertyId: string,
    userId: string,
  ): Promise<any> {
    // Get property with all relations
    const property =
      await this.propertyRepository.findByIdWithRelations(propertyId);

    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }

    // Check if user owns this property
    if (property.userId !== userId) {
      throw new BadRequestException('You can only view your own properties');
    }

    // Fetch related objects separately if not loaded through relations
    let listingType = property.listingType;
    if (!listingType && property.listingTypeId) {
      const fetchedListingType =
        await this.propertyListingTypeRepository.findById(
          property.listingTypeId,
        );
      if (fetchedListingType) {
        listingType = fetchedListingType;
      }
    }

    let category = property.category;
    if (!category && property.categoryId) {
      const fetchedCategory = await this.propertyCategoryRepository.findById(
        property.categoryId,
      );
      if (fetchedCategory) {
        category = fetchedCategory;
      }
    }

    // Get built-up area for this BHK type - try societyId first, then localityId
    let builtUpArea: any = null;
    if (property.bhkTypeId) {
      if (property.societyId) {
        const builtUpAreas =
          await this.builtUpAreaRepository.findByBhkTypeIdAndSocietyId(
            property.bhkTypeId,
            property.societyId,
          );
        // Get the first matching built-up area (or use the first one if multiple exist)
        builtUpArea = builtUpAreas.length > 0 ? builtUpAreas[0] : null;
      } else if (property.localityId) {
        const builtUpAreas =
          await this.builtUpAreaRepository.findByBhkTypeIdAndLocalityId(
            property.bhkTypeId,
            property.localityId,
          );
        // Get the first matching built-up area (or use the first one if multiple exist)
        builtUpArea = builtUpAreas.length > 0 ? builtUpAreas[0] : null;
      }
    }

    // Fetch locality if localityId exists
    let locality = property.locality;
    if (!locality && property.localityId) {
      locality = await this.localityRepository.findById(property.localityId);
    }

    // Format the response similar to CreatePropertyStep1Dto
    return {
      propertyId: property.id,
      listingType: listingType
        ? {
            id: listingType.id,
            name: listingType.name,
            code: listingType.code,
          }
        : null,
      category: category
        ? {
            id: category.id,
            name: category.name,
            code: category.code,
          }
        : null,
      propertyType: property.propertyType
        ? {
            id: property.propertyType.id,
            name: property.propertyType.name,
            code: property.propertyType.code,
          }
        : null,
      bhk: {
        id: property.bhkType?.id,
        name: property.bhkType?.name || '',
        buildUpAreaSqFt: builtUpArea?.superBuiltUpArea || 0,
        carpetAreaSqFt: builtUpArea?.carpetArea || 0,
        noOfBathrooms: builtUpArea?.noOfBathrooms || 0,
        noOfBedrooms: builtUpArea?.noOfBedrooms ?? null,
        balconies: builtUpArea?.balconies ?? null,
      },
      ageOfProperty: property.ageOfProperty,
      facing: property.facing || null,
      status: property.status,
      city: property.city
        ? {
            id: property.city.id,
            name: property.city.name,
            code: property.city.code,
            state: property.city.state,
            latitude: property.city.latitude,
            longitude: property.city.longitude,
          }
        : null,
      society: property.society
        ? {
            id: property.society.id,
            name: property.society.name,
            localityName: property.society.localityName,
            address: property.society.address,
            pincode: property.society.pincode,
            latitude: property.society.latitude,
            longitude: property.society.longitude,
          }
        : null,
      locality: locality
        ? {
            id: locality.id,
            name: locality.name,
            sector: locality.sector,
            latitude: locality.latitude,
            longitude: locality.longitude,
          }
        : null,
      transactionType: property.transactionType || null,
      constructionStatus: property.constructionStatus || null,
      possessionBy: property.possessionBy || null,
      possessionTime: property.possessionTime || null,
      plotArea: property.plotArea || null,
      plotAreaUnit: property.plotAreaUnit || null,
      plotLength: property.plotLength || null,
      plotWidth: property.plotWidth || null,
      plotFacingRoadWidth: property.plotFacingRoadWidth || null,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      completionStep: property.completionStep || 0,
    };
  }

  /**
   * Get property step 2 details by property ID
   */
  async getPropertyStep2Details(
    propertyId: string,
    userId: string,
  ): Promise<any> {
    // Get property with all relations
    const property =
      await this.propertyRepository.findByIdWithRelations(propertyId);

    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }

    // Check if user owns this property
    if (property.userId !== userId) {
      throw new BadRequestException('You can only view your own properties');
    }

    // Format the response with step 2 fields
    return {
      propertyId: property.id,
      floorNumber: property.floorNumber,
      totalFloors: property.totalFloors,
      flatNumber: property.flatNumber,
      towerBlock: property.towerBlock,
      propertyAreaAcre: property.propertyAreaAcre,
      tenantType: property.tenantType,
      companyOccupancy: property.companyOccupancy,
      rentAvailability: property.rentAvailability,
      availableFromDate: property.availableFromDate
        ? (() => {
            try {
              const date = property.availableFromDate instanceof Date 
                ? property.availableFromDate 
                : new Date(property.availableFromDate);
              return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
            } catch {
              return null;
            }
          })()
        : null,
      monthlyRent: property.monthlyRent,
      maintenanceType: property.maintenanceType,
      maintenanceChargeAmount: property.maintenanceChargeAmount,
      securityDepositType: property.securityDepositType,
      securityDepositAmount: property.securityDepositAmount,
      lockInType: property.lockInType,
      lockInMonths: property.lockInMonths,
      brokerageType: property.brokerageType,
      brokerageAmount: property.brokerageAmount,
      isBrokerageNegotiable: property.isBrokerageNegotiable,
      price: property.price,
      plotArea: property.plotArea,
      plotAreaUnit: property.plotAreaUnit,
      plotNumber: property.plotNumber,
      houseNumber: property.houseNumber,
      villaNumber: property.villaNumber,
      transactionType: property.transactionType,
      possessionStatus: property.possessionStatus,
      possessionDate: property.possessionDate
        ? (() => {
            try {
              const date = property.possessionDate instanceof Date 
                ? property.possessionDate 
                : new Date(property.possessionDate);
              return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
            } catch {
              return null;
            }
          })()
        : null,
      plotPrice: property.plotPrice,
      brokerage: property.brokerage,
      loanAvailable: property.loanAvailable,
      facing: property.facing,
      boundaryWall: property.boundaryWall,
      noOfOpenSides: property.noOfOpenSides,
      floorsAllowedForConstruction: property.floorsAllowedForConstruction,
      constructionDone: property.constructionDone,
      constructionType: property.constructionType,
      cornerProperty: property.cornerProperty,
      propertyDescription: property.propertyDescription,
      status: property.status,
      completionStep: property.completionStep || 0,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}
