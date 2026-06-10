import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IsNull } from 'typeorm';
import { CacheService } from '../common/cache/cache.service';
import { PropertyCompletionStep } from './enum/property-completion-step.enum';
import { PropertyListingTypeRepository } from './repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { BhkTypeRepository } from './repositories/bhk-type.repository';
import { BuiltUpAreaRepository } from './repositories/built-up-area.repository';
import { CityRepository } from './repositories/city.repository';
import { SocietyRepository } from './repositories/society.repository';
import { LocalityRepository } from './repositories/locality.repository';
import { FurnishingRepository } from './repositories/furnishing.repository';
import { AmenityRepository } from './repositories/amenity.repository';
import { RoomRepository } from './repositories/room.repository';
import { PropertyRepository } from './repositories/property.repository';
import { PropertyRejectionHistoryRepository } from './repositories/property-rejection-history.repository';
import { PropertyVerificationRequestRepository } from './repositories/property-verification-request.repository';
import { MasterDataSeederService } from './services/master-data-seeder.service';
import { GooglePlacesService } from './services/google-places.service';
import { OpenAIService } from './services/openai.service';
import { UserRepository } from '../user/repositories/user.repository';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/enum/user-role.enum';
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
import { CreatePropertyStep4Dto } from './dto/create-property-step4.dto';
import {
  RequestPropertyVerificationDto,
  RequestPropertyVerificationResponseDto,
  SubmitPropertyVerificationMediaDto,
  SubmitPropertyVerificationMediaResponseDto,
} from './dto/property-verification.dto';
import {
  GeneratePropertyDescriptionDto,
  GeneratePropertyDescriptionResponseDto,
} from './dto/generate-property-description.dto';
import { Property } from './entities/property.entity';
import { PropertyVerificationRequest, PropertyVerificationStatus } from './entities/property-verification-request.entity';
import { ZohoService, ZohoCrmPayload } from '../zoho/zoho.service';
import { PropertyStatus, DeactivationReason, VerificationStatus } from './enum/property-status.enum';
import { MAX_LISTINGS_PER_OWNER } from './constants/property.constants';
import {
  OwnerPropertyListingQueryDto,
  OwnerPropertySortBy,
  OwnerPropertySortOrder,
  OwnerPropertyFilter,
} from './dto/owner-property-listing-query.dto';
import {
  OwnerPropertyListingItemDto,
  OwnerPropertyListingResponseDto,
  OwnerPropertyDetailResponseDto,
  CityResponseDto,
  PropertyMediaItemDto,
} from './dto/property-response.dto';

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
    private readonly furnishingRepository: FurnishingRepository,
    private readonly amenityRepository: AmenityRepository,
    private readonly roomRepository: RoomRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly propertyRejectionHistoryRepository: PropertyRejectionHistoryRepository,
    private readonly propertyVerificationRequestRepository: PropertyVerificationRequestRepository,
    private readonly masterDataSeederService: MasterDataSeederService,
    private readonly googlePlacesService: GooglePlacesService,
    private readonly openAIService: OpenAIService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly zohoService: ZohoService,
    private readonly cache: CacheService,
  ) {}

  /** Clear every cached read that could now be stale after a property write. */
  private invalidatePropertyCaches() {
    this.cache.invalidatePrefix('properties:');
  }

  async syncPropertyToCrm(
    body: { propertyId?: string; customer?: any; property?: any },
  ): Promise<{ success: boolean; syncedAt?: Date; error?: string }> {
    // Resolve which propertyId to mark as synced + which payload to forward.
    // Two accepted shapes:
    //   (a) { propertyId }                        -> backend builds payload from DB
    //   (b) { customer, property: { ..., website_property_id } } -> forward body as-is
    let propertyId =
      body?.propertyId ||
      (typeof body?.property?.website_property_id === 'string'
        ? body.property.website_property_id
        : undefined);

    if (!propertyId) {
      throw new BadRequestException(
        'Either propertyId or property.website_property_id is required',
      );
    }

    const property = await this.propertyRepository.findByIdWithRelations(propertyId);
    if (!property) {
      throw new BadRequestException(`Property ${propertyId} not found`);
    }

    let payload: ZohoCrmPayload;
    if (body?.customer && body?.property) {
      payload = {
        customer: body.customer,
        property: { ...body.property, website_property_id: propertyId },
      };
    } else {
      const user = property.user ?? (await this.userRepository.findById(property.userId));
      if (!user) {
        throw new BadRequestException(`Owner user for property ${propertyId} not found`);
      }
      payload = this.buildZohoPayload(property, user);
    }

    const ownerRole = property.user?.role || (await this.userRepository.findById(property.userId))?.role;
    const result = await this.zohoService.forwardToFlow(payload, ownerRole);
    if (!result.success) {
      return { success: false, error: result.error || `Zoho returned status ${result.status}` };
    }

    const syncedAt = new Date();
    await this.propertyRepository.updateProperty(propertyId, {
      syncWithCrm: true,
      syncedAt,
    });
    return { success: true, syncedAt };
  }

  private buildZohoPayload(property: any, user: any): ZohoCrmPayload {
    const NA = 'NA';
    const asInt = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    const asStr = (v: unknown): string => (typeof v === 'string' && v.length > 0 ? v : NA);

    const availableFor = (property.category?.name || '').toUpperCase() || NA;
    const amount = asInt(property.price ?? property.plotPrice ?? property.monthlyRent);
    const propertyName =
      property.society?.name ||
      property.propertyType?.name ||
      `Property ${property.id.slice(0, 8)}`;
    const sector = property.locality?.sector || property.locality?.name || NA;

    return {
      customer: {
        name: asStr(user.name),
        email: asStr(user.email),
        phone: asStr(user.phone),
        website_user_id: user.id,
      },
      property: {
        available_for: availableFor,
        property_type: asStr(property.propertyType?.name),
        property_name: propertyName,
        property_sub_type: NA,
        zone: NA,
        sector,
        bhk: asStr(property.bhkType?.name),
        bhk_type: asStr(property.bhkType?.name),
        property_area_in: 'sq_ft',
        property_area: asInt(property.builtUpAreaMetadata?.sqFt),
        carpet_area_in: 'sq_ft',
        carpet_area: asInt(property.builtUpAreaMetadata?.carpetSqFt),
        build_up_area_in: 'sq_ft',
        buildup_area: asInt(property.builtUpAreaMetadata?.sqFt),
        availability_by: property.rentAvailability || NA,
        maintenance_cost: asInt(property.maintenanceChargeAmount),
        security: asInt(property.securityDepositAmount),
        amount,
        brokerage: asInt(property.brokerageAmount),
        owner_name: NA,
        owner_mobile_no: NA,
        no_of_bedroom: asInt(property.bhkType?.noOfBedrooms),
        no_of_washroom: asInt(property.bhkType?.noOfBathrooms),
        no_of_kitchen: 0,
        no_of_drawing_room: 0,
        no_of_balcony: asInt(property.bhkType?.balconies),
        no_of_utility: 0,
        no_of_parking: 0,
        total_floor: asInt(property.totalFloors),
        floor_no: asInt(property.floorNumber),
        furnish_status: NA,
        facing: NA,
        quality_rating: NA,
        basic_amenities: NA,
        featured_amenities: NA,
        nearby_location: property.locality?.name || NA,
        website_property_id: property.id,
      },
    };
  }

  async triggerZohoSyncSafe(propertyId: string): Promise<void> {
    try {
      const result = await this.syncPropertyToCrm({ propertyId });
      if (!result.success) {
        console.warn(`[ZohoSync] property=${propertyId} failed: ${result.error}`);
      } else {
        console.log(`[ZohoSync] property=${propertyId} synced at ${result.syncedAt?.toISOString()}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[ZohoSync] property=${propertyId} threw: ${message}`);
    }
  }

  private readonly DEFAULT_TOTAL_STEPS = 4;

  /**
   * Calculate listing score based on completion step and verification status.
   * - 80% when all steps are completed (completionStep === 5)
   * - 100% when property is verified (isVerified === 'verified')
   */
  private calculateListingScore(
    completionStep: number,
    isVerified: VerificationStatus,
  ): number {
    const isCompleted = completionStep >= PropertyCompletionStep.COMPLETED;
    const isVerifiedStatus = isVerified === VerificationStatus.VERIFIED;

    if (isCompleted && isVerifiedStatus) {
      return 100.0;
    } else if (isCompleted) {
      return 80.0;
    }
    return 0.0;
  }

  /**
   * Calculate progress percentage based on completion step and total steps.
   */
  private calculateProgressPercentage(
    completionStep: number,
    totalSteps: number = this.DEFAULT_TOTAL_STEPS,
  ): number {
    // Explicitly return 0 when completionStep is 0
    if (completionStep === 0) {
      return 0;
    }

    if (totalSteps <= 0) {
      return 0;
    }

    const normalizedTotalSteps = Math.max(totalSteps, 1);
    const cappedStep = Math.min(
      Math.max(completionStep, 0),
      normalizedTotalSteps,
    );

    const percentage = (cappedStep / normalizedTotalSteps) * 100;

    if (
      completionStep >= PropertyCompletionStep.COMPLETED ||
      percentage >= 100
    ) {
      return 100;
    }

    return Number(percentage.toFixed(2));
  }

  private determineTotalSteps(property?: Property | null): number {
    if (!property) {
      return this.DEFAULT_TOTAL_STEPS;
    }

    const propertyTypeCode = property.propertyType?.code?.toLowerCase() ?? '';
    const categoryCode = property.category?.code?.toLowerCase() ?? '';

    const isResidentialPlot =
      categoryCode === 'residential' && propertyTypeCode.includes('plot');

    if (isResidentialPlot) {
      return 3;
    }

    return this.DEFAULT_TOTAL_STEPS;
  }

  private async getProgressPercentageForProperty(
    propertyId: string,
    completionStep: number,
  ): Promise<number> {
    const property =
      await this.propertyRepository.findByIdWithRelations(propertyId);
    const totalSteps = this.determineTotalSteps(property);
    return this.calculateProgressPercentage(completionStep, totalSteps);
  }

  async getOwnerPropertyListings(
    query: OwnerPropertyListingQueryDto,
    userId: string,
  ): Promise<OwnerPropertyListingResponseDto> {
    const {
      page = 1,
      limit = 10,
      categoryIds,
      propertyTypeIds,
      listingTypeIds,
      furnishingTypes,
      projectStatuses,
      statuses,
      listingStatuses,
      verificationStatuses,
      minPrice,
      maxPrice,
      search,
      filter,
      sortBy = OwnerPropertySortBy.CREATED_AT,
      sortOrder = OwnerPropertySortOrder.DESC,
    } = query;

    // Apply quick filter if provided
    let finalStatuses = statuses;
    let recentlyExpired = false;
    
    if (filter) {
      switch (filter) {
        case OwnerPropertyFilter.ALL:
          // No additional filtering needed
          break;
        case OwnerPropertyFilter.PENDING:
          finalStatuses = [PropertyStatus.DRAFT];
          break;
        case OwnerPropertyFilter.UNDER_REVIEW:
          finalStatuses = [PropertyStatus.PENDING_REVIEW];
          break;
        case OwnerPropertyFilter.RECENTLY_EXPIRED:
          recentlyExpired = true;
          // Will be handled in repository
          break;
      }
    }

    const { items, total, statusCounts } =
      await this.propertyRepository.findOwnerListings({
        userId,
        page,
        limit,
        sortBy,
        sortOrder,
        filters: {
          categoryIds,
          propertyTypeIds,
          listingTypeIds,
          furnishingTypes,
          projectStatuses,
          statuses: finalStatuses,
          listingStatuses,
          verificationStatuses,
          minPrice: minPrice ?? null,
          maxPrice,
          search,
          recentlyExpired,
        },
      });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const mappedItems = items.map((property) =>
      this.mapOwnerPropertyListingItem(property),
    );

    const defaultStatusBuckets = [
      PropertyStatus.DRAFT,
      PropertyStatus.PENDING_REVIEW,
      PropertyStatus.ACTIVE,
      PropertyStatus.REJECTED,
      PropertyStatus.DEACTIVATED,
    ];

    const normalizedCounts = { ...statusCounts };
    for (const status of defaultStatusBuckets) {
      if (normalizedCounts[status] == null) {
        normalizedCounts[status] = 0;
      }
    }

    return {
      items: mappedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      summary: {
        total,
        byStatus: normalizedCounts,
      },
    };
  }

  private mapOwnerPropertyListingItem(
    property: Property,
  ): OwnerPropertyListingItemDto {
    const bhkName = property.bhkType?.name ?? null;
    const propertyTypeName = property.propertyType?.name ?? '';
    const titleParts = [bhkName, propertyTypeName].filter(
      (part) => part && part.trim().length > 0,
    );
    const title =
      titleParts.join(' ').trim() ||
      property.propertyDescription ||
      property.listingType?.name ||
      'Property';

    const coverPhoto =
      property.photos?.find((photo) => photo.isCoverImage) ??
      property.photos?.[0] ??
      null;

    // Map all photos to PropertyMediaItemDto format
    const photos: PropertyMediaItemDto[] =
      property.photos?.map((photo) => ({
        fileKey: photo.fileKey,
        view: photo.view,
        isCoverImage: photo.isCoverImage ?? false,
      })) ?? [];

    const areaFromMetadata = property.builtUpAreaMetadata?.superBuiltUpArea
      ? Number(property.builtUpAreaMetadata.superBuiltUpArea)
      : null;
    const area =
      property.builtUpArea ?? areaFromMetadata ?? property.carpetArea ?? null;

    const areaUnit =
      property.builtUpAreaUnit ??
      property.carpetAreaUnit ??
      (area != null ? 'sq.ft' : null);

    const priceSource =
      property.price != null
        ? 'price'
        : property.monthlyRent != null
        ? 'monthlyRent'
        : null;

    const primaryPrice =
      priceSource === 'price'
        ? property.price
        : priceSource === 'monthlyRent'
        ? property.monthlyRent
        : null;

    const addressParts = [
      property.houseNumber ?? property.flatNumber ?? null,
      property.society?.name ?? null,
      property.locality?.name ?? null,
      property.city?.name ?? null,
    ].filter((part) => part && part.toString().trim().length > 0);

    const completionStep = property.completionStep ?? 0;
    const progressPercentage = this.calculateProgressPercentage(
      completionStep,
      this.determineTotalSteps(property),
    );

    return {
      id: property.id,
      title,
      status: property.status,
      listingType: property.listingType
        ? {
            id: property.listingType.id,
            name: property.listingType.name,
            code: property.listingType.code,
          }
        : undefined,
      category: property.category
        ? {
            id: property.category.id,
            name: property.category.name,
            code: property.category.code,
          }
        : undefined,
      propertyType: property.propertyType
        ? {
            id: property.propertyType.id,
            name: property.propertyType.name,
            code: property.propertyType.code,
          }
        : null,
      bhkTypeName: bhkName,
      furnishingType: property.furnishType ?? null,
      constructionStatus: property.constructionStatus ?? null,
      price: primaryPrice ?? null,
      monthlyRent: property.monthlyRent ?? null,
      priceSource,
      mediaCounts: {
        photos: property.photos?.length ?? 0,
        videos: property.videos?.length ?? 0,
      },
      coverPhotoKey: coverPhoto?.fileKey ?? null,
      photos,
      address: addressParts.length ? addressParts.join(', ') : null,
      area,
      areaUnit,
      completionStep,
      progressPercentage,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      expiresAt: property.expiresAt ?? null,
      deactivatedOn: property.deactivatedOn ?? null,
      expiredOn: property.expiresAt ?? null,
      isVerified: property.isVerified ?? null,
    };
  }

  async getOwnerPropertyDetail(
    propertyId: string,
    userId: string,
  ): Promise<OwnerPropertyDetailResponseDto> {
    const property = await this.propertyRepository.findByIdWithRelations(propertyId);
    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only view your own properties');
    }

    const bhkName = property.bhkType?.name ?? null;
    const propertyTypeName = property.propertyType?.name ?? '';
    const titleParts = [bhkName, propertyTypeName].filter(
      (part) => part && part.trim().length > 0,
    );
    const title =
      titleParts.join(' ').trim() ||
      property.propertyDescription ||
      property.listingType?.name ||
      'Property';

    const areaFromMetadata = property.builtUpAreaMetadata?.superBuiltUpArea
      ? Number(property.builtUpAreaMetadata.superBuiltUpArea)
      : null;
    const area =
      property.builtUpArea ?? areaFromMetadata ?? property.carpetArea ?? null;

    const completionStep = property.completionStep ?? 0;
    const progressPercentage = this.calculateProgressPercentage(
      completionStep,
      this.determineTotalSteps(property),
    );

    const createdOn = property.createdAt.toISOString().split('T')[0];
    const lastAddedOn = property.updatedAt.toISOString().split('T')[0];

    // Fetch latest rejection reason from rejection history table
    const latestRejectionHistory =
      await this.propertyRejectionHistoryRepository.findLatestByPropertyId(
        property.id,
      );
    const rejectionReason = latestRejectionHistory?.rejectionReason || null;

    // Fetch the latest property verification request
    const verificationRequests = await this.propertyVerificationRequestRepository.findByPropertyId(
      property.id,
    );
    const latestVerificationRequest = verificationRequests[0] || null;

    return {
      id: property.id,
      title,
      status: property.status,
      area,
      areaUnit:
        property.builtUpAreaUnit ??
        property.carpetAreaUnit ??
        (area != null ? 'sq.ft' : null),
      category: property.category?.name ?? null,
      constructionStatus: property.constructionStatus ?? null,
      furnishingType: property.furnishType ?? null,
      photos:
        property.photos?.map((p) => ({
          fileKey: p.fileKey,
          view: p.view,
          isCoverImage: p.isCoverImage,
        })) ?? [],
      videos:
        property.videos?.map((v) => ({
          fileKey: v.fileKey,
          view: v.format,
        })) ?? [],
      price: property.price ?? property.plotPrice ?? null,
      monthlyRent: property.monthlyRent ?? null,
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
      createdOn,
      lastAddedOn,
      completionStep,
      progressPercentage,
      rejectionReason,
      expiresAt: property.expiresAt || null,
      isVerified: property.isVerified || null,
      verificationStatus: latestVerificationRequest?.status || null,
      comments: latestVerificationRequest?.rejectionReason || null,
    };
  }

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

    const orderKey = `${listingType.code}:${category.code}`;
    const customOrder = this.getCustomPropertyTypeOrder(orderKey);

    if (customOrder) {
      propertyTypes.sort((a, b) => {
        const indexA = customOrder.indexOf(a.code);
        const indexB = customOrder.indexOf(b.code);

        const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
        const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

        if (safeIndexA === safeIndexB) {
          return a.name.localeCompare(b.name);
        }

        return safeIndexA - safeIndexB;
      });
    }

    // Structure the response - only return property types
    return {
      propertyTypes: propertyTypes.map((pt) => ({
        id: pt.id,
        name: pt.name,
        code: pt.code,
      })),
    };
  }

  private getCustomPropertyTypeOrder(
    orderKey: string,
  ): string[] | undefined {
    const orderMap: Record<string, string[]> = {
      'rent:residential': [
        'res-rent-flat',
        'res-rent-house',
        'res-rent-duplex',
        'res-rent-builder-floor',
        'res-rent-villa',
        'res-rent-penthouse',
        'res-rent-studio',
        'res-rent-farmhouse',
      ],
      'sale:residential': [
        'res-sale-flat',
        'res-sale-house',
        'res-sale-duplex',
        'res-sale-builder-floor',
        'res-sale-villa',
        'res-sale-penthouse',
        'res-sale-studio',
        'res-sale-farmhouse',
        'res-sale-plot',
        'res-sale-agri-land',
      ],
    };

    return orderMap[orderKey];
  }

  /**
   * Reseed all master data (delete existing and insert fresh data)
   */
  async reseedMasterData(): Promise<{ message: string; details: any }> {
    return await this.masterDataSeederService.reseedAll();
  }

  /**
   * Seed property types master data
   */
  async seedPropertyTypes(): Promise<void> {
    return await this.masterDataSeederService.seedPropertyTypes();
  }

  /**
   * Reseed property types (delete existing and insert fresh data)
   */
  async reseedPropertyTypes(): Promise<{ message: string; details: any }> {
    return await this.masterDataSeederService.reseedPropertyTypes();
  }

  /**
   * Search cities - first from database, then from Google Places API
   */
  async searchCities(query: string, limit: number = 10): Promise<any[]> {
    if (!query || !query.trim()) {
      throw new BadRequestException('Search query is required');
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
    if (!query || !query.trim()) {
      throw new BadRequestException('Search query is required');
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
    // Check KYC completion for channel partners
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check KYC status for channel partners
    // if (user.role === UserRole.CHANNEL_PARTNER) {
    //   if (!user.kycCompleted) {
    //     // Check if all steps are completed but not approved
    //     const agreementStatus = await this.userService.getDocuSignAgreementStatus(userId);
    //     const allStepsCompleted =
    //       user.livePhotoApproved &&
    //       user.aadhaarVerified &&
    //       user.bankDetailsFilled &&
    //       agreementStatus.docusign_agreement_signed;

    //     if (allStepsCompleted) {
    //       throw new BadRequestException(
    //         'Your KYC is under review. You can post property once it is approved.',
    //       );
    //     } else {
    //       throw new BadRequestException(
    //         'KYC verification must be completed before posting properties. Please complete all 4 verification steps.',
    //       );
    //     }
    //   }
    // }

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
      possessionStatus,
      possessionDate,
      facing,
      status = PropertyStatus.DRAFT,
      city,
      society,
      locality,
      plotArea,
      plotAreaUnit,
      plotLength,
      plotLengthUnit,
      plotWidth,
      plotWidthUnit,
      plotFacingRoadWidth,
      locationHub,
      otherLocationHub,
      zoneType,
      propertyCondition,
      wallConstructionStatus,
      ownership,
      builtUpArea,
      builtUpAreaUnit,
      carpetArea,
      carpetAreaUnit,
      suitableFor,
      entranceWidth,
      entranceWidthUnit,
      ceilingHeight,
      ceilingHeightUnit,
      locatedNear,
      plotLandType,
      noOfOpenSides,
      constructionDone,
      constructionTypeOptions,
    } = createPropertyDto;

    // Ensure the chosen propertyType actually belongs to the submitted
    // listingType + category. The frontend is supposed to filter these,
    // but a stale hierarchy cache once let us save Rent property types on
    // Sale listings, which corrupted the Buy dropdown.
    if (propertyTypeId && listingTypeId && categoryId) {
      const propertyType =
        await this.propertyTypeRepository.findById(propertyTypeId);
      if (!propertyType) {
        throw new BadRequestException(
          `Property type with ID ${propertyTypeId} not found`,
        );
      }
      if (
        propertyType.listingTypeId !== listingTypeId ||
        propertyType.categoryId !== categoryId
      ) {
        throw new BadRequestException(
          'Selected property type does not belong to the chosen listing type and category',
        );
      }
    }

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
    const builtUpAreaId = await getOrCreateBuiltUpArea(
      bhk,
      bhkTypeId,
      societyId,
      localityId,
    );

      let property;

      // Check if property exists
      const existingProperty = propertyId
        ? await this.propertyRepository.findById(propertyId)
        : null;

      if (existingProperty) {
        const previouslyCompletedStep = existingProperty.completionStep ?? 0;

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
        if (builtUpAreaId) {
          updateData.builtUpAreaId = builtUpAreaId;
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
        if (possessionStatus !== undefined) {
          updateData.possessionStatus = possessionStatus;
        }
        if (possessionDate !== undefined) {
          updateData.possessionDate = possessionDate ? new Date(possessionDate) : null;
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
        if (plotLengthUnit !== undefined) {
          updateData.plotLengthUnit = plotLengthUnit;
        }
        if (plotWidth !== undefined) {
          updateData.plotWidth = plotWidth;
        }
        if (plotWidthUnit !== undefined) {
          updateData.plotWidthUnit = plotWidthUnit;
        }
        if (plotFacingRoadWidth !== undefined) {
          updateData.plotFacingRoadWidth = plotFacingRoadWidth || null;
        }
        if (locationHub !== undefined) {
          updateData.locationHub = locationHub;
        }
        if (otherLocationHub !== undefined) {
          updateData.otherLocationHub = otherLocationHub || null;
        }
        if (zoneType !== undefined) {
          updateData.zoneType = zoneType;
        }
        if (propertyCondition !== undefined) {
          updateData.propertyCondition = propertyCondition;
        }
        if (wallConstructionStatus !== undefined) {
          updateData.wallConstructionStatus = wallConstructionStatus;
        }
        if (ownership !== undefined) {
          updateData.ownership = ownership;
        }
        if (builtUpArea !== undefined) {
          updateData.builtUpArea = builtUpArea;
        }
        if (builtUpAreaUnit !== undefined) {
          updateData.builtUpAreaUnit = builtUpAreaUnit;
        }
        if (carpetArea !== undefined) {
          updateData.carpetArea = carpetArea;
        }
        if (carpetAreaUnit !== undefined) {
          updateData.carpetAreaUnit = carpetAreaUnit;
        }
        if (suitableFor !== undefined) {
          updateData.suitableFor = suitableFor && suitableFor.length > 0 ? suitableFor : null;
        }
        if (entranceWidth !== undefined) {
          updateData.entranceWidth = entranceWidth;
        }
        if (entranceWidthUnit !== undefined) {
          updateData.entranceWidthUnit = entranceWidthUnit;
        }
        if (ceilingHeight !== undefined) {
          updateData.ceilingHeight = ceilingHeight;
        }
        if (ceilingHeightUnit !== undefined) {
          updateData.ceilingHeightUnit = ceilingHeightUnit;
        }
        if (locatedNear !== undefined) {
          updateData.locatedNear = locatedNear && locatedNear.length > 0 ? locatedNear : null;
        }
        if (plotLandType !== undefined) {
          updateData.plotLandType = plotLandType;
        }
        if (noOfOpenSides !== undefined) {
          updateData.noOfOpenSides = noOfOpenSides;
        }
        if (constructionDone !== undefined) {
          updateData.constructionDone = constructionDone;
        }
        if (constructionTypeOptions !== undefined) {
          updateData.constructionTypeOptions = constructionTypeOptions && constructionTypeOptions.length > 0 ? constructionTypeOptions : null;
        }

        const targetCompletionStep = PropertyCompletionStep.STEP_1;
        const newCompletionStep =
          previouslyCompletedStep > targetCompletionStep
            ? previouslyCompletedStep
            : targetCompletionStep;
        updateData.completionStep = newCompletionStep;
        updateData.listingScore = this.calculateListingScore(newCompletionStep, existingProperty.isVerified ?? VerificationStatus.UNVERIFIED);

        // Update the property
        await this.propertyRepository.updateProperty(propertyId, updateData);

        // Get the updated property
        property = await this.propertyRepository.findById(propertyId);
      } else {
        // Create new property - propertyId is required but doesn't exist, so create new with that ID or generate new
        // Only apply property limit to OWNER role, not CHANNEL_PARTNER
        if (user.role === UserRole.OWNER) {
          const ownerPropertyCount =
            await this.propertyRepository.countByUserId(userId);
          if (ownerPropertyCount >= MAX_LISTINGS_PER_OWNER) {
            throw new BadRequestException(
              `Owners can create a maximum of ${MAX_LISTINGS_PER_OWNER} listings.`,
            );
          }
        }

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
        if (builtUpAreaId) {
          createData.builtUpAreaId = builtUpAreaId;
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
        if (possessionStatus !== undefined) {
          createData.possessionStatus = possessionStatus;
        }
        if (possessionDate !== undefined) {
          createData.possessionDate = possessionDate ? new Date(possessionDate) : null;
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
        if (plotLengthUnit !== undefined) {
          createData.plotLengthUnit = plotLengthUnit;
        }
        if (plotWidth !== undefined) {
          createData.plotWidth = plotWidth;
        }
        if (plotWidthUnit !== undefined) {
          createData.plotWidthUnit = plotWidthUnit;
        }
        if (plotFacingRoadWidth !== undefined) {
          createData.plotFacingRoadWidth = plotFacingRoadWidth || null;
        }
        if (locationHub !== undefined) {
          createData.locationHub = locationHub;
        }
        if (otherLocationHub !== undefined) {
          createData.otherLocationHub = otherLocationHub || null;
        }
        if (zoneType !== undefined) {
          createData.zoneType = zoneType;
        }
        if (propertyCondition !== undefined) {
          createData.propertyCondition = propertyCondition;
        }
        if (wallConstructionStatus !== undefined) {
          createData.wallConstructionStatus = wallConstructionStatus;
        }
        if (ownership !== undefined) {
          createData.ownership = ownership;
        }
        if (builtUpArea !== undefined) {
          createData.builtUpArea = builtUpArea;
        }
        if (builtUpAreaUnit !== undefined) {
          createData.builtUpAreaUnit = builtUpAreaUnit;
        }
        if (carpetArea !== undefined) {
          createData.carpetArea = carpetArea;
        }
        if (carpetAreaUnit !== undefined) {
          createData.carpetAreaUnit = carpetAreaUnit;
        }
        if (suitableFor !== undefined) {
          createData.suitableFor = suitableFor && suitableFor.length > 0 ? suitableFor : null;
        }
        if (entranceWidth !== undefined) {
          createData.entranceWidth = entranceWidth;
        }
        if (entranceWidthUnit !== undefined) {
          createData.entranceWidthUnit = entranceWidthUnit;
        }
        if (ceilingHeight !== undefined) {
          createData.ceilingHeight = ceilingHeight;
        }
        if (ceilingHeightUnit !== undefined) {
          createData.ceilingHeightUnit = ceilingHeightUnit;
        }
        if (locatedNear !== undefined) {
          createData.locatedNear = locatedNear && locatedNear.length > 0 ? locatedNear : null;
        }
        if (plotLandType !== undefined) {
          createData.plotLandType = plotLandType;
        }
        if (noOfOpenSides !== undefined) {
          createData.noOfOpenSides = noOfOpenSides;
        }
        if (constructionDone !== undefined) {
          createData.constructionDone = constructionDone;
        }
        if (constructionTypeOptions !== undefined) {
          createData.constructionTypeOptions = constructionTypeOptions && constructionTypeOptions.length > 0 ? constructionTypeOptions : null;
        }

        // Create new property
        property = await this.propertyRepository.createProperty(createData);
      }

      if (!property) {
        throw new BadRequestException(
          'Failed to retrieve property after save',
        );
      }

      const completionStep =
        property.completionStep ?? PropertyCompletionStep.STEP_1;
      const progressPercentage = await this.getProgressPercentageForProperty(
        property.id,
        completionStep,
      );

      this.invalidatePropertyCaches();
      return {
        id: property.id,
        status: property.status,
        completionStep,
        progressPercentage,
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
  ): Promise<{ id: string; status: string; completionStep: number; progressPercentage: number }> {
    // Check KYC completion for channel partners
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // if (user.role === UserRole.CHANNEL_PARTNER && !user.kycCompleted) {
    //   throw new BadRequestException(
    //     'KYC verification must be completed before posting properties. Please complete all 4 verification steps.',
    //   );
    // }

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

    // Build update object with only provided fields
    const previouslyCompletedStep = property.completionStep ?? 0;
    const targetCompletionStep = PropertyCompletionStep.STEP_2;
    const newCompletionStep = Math.max(previouslyCompletedStep, targetCompletionStep);
    const listingScore = this.calculateListingScore(newCompletionStep, property.isVerified);
    const updateData: any = {
      completionStep: newCompletionStep,
      listingScore,
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
    if (dto.ageOfProperty !== undefined) {
      updateData.ageOfProperty = dto.ageOfProperty ?? null;
    }
    if (dto.tenantType !== undefined) {
      updateData.tenantType =
        dto.tenantType && dto.tenantType.length > 0
          ? dto.tenantType
          : null;
    }
    if (dto.companyOccupancy !== undefined) {
      updateData.companyOccupancy = dto.companyOccupancy ?? null;
    } else if (
      dto.tenantType !== undefined &&
      !dto.tenantType.includes(TenantType.COMPANY)
    ) {
      updateData.companyOccupancy = null;
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
    }
    if (dto.securityDepositAmount !== undefined) {
      updateData.securityDepositAmount = dto.securityDepositAmount;
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
    if (dto.isLiftAvailable !== undefined) {
      updateData.isLiftAvailable = dto.isLiftAvailable ?? null;
    }
    if (dto.noOfStaircases !== undefined) {
      updateData.noOfStaircases = dto.noOfStaircases;
    }
    if (dto.privateParking !== undefined) {
      updateData.privateParking = dto.privateParking;
    }
    if (dto.privateWashrooms !== undefined) {
      updateData.privateWashrooms = dto.privateWashrooms ?? null;
    }
    if (dto.publicParking !== undefined) {
      updateData.publicParking = dto.publicParking;
    }
    if (dto.publicWashrooms !== undefined) {
      updateData.publicWashrooms = dto.publicWashrooms ?? null;
    }
    if (dto.isRentNegotiable !== undefined) {
      updateData.isRentNegotiable = dto.isRentNegotiable ?? false;
    }
    if (dto.dgUpsChargeIncluded !== undefined) {
      updateData.dgUpsChargeIncluded = dto.dgUpsChargeIncluded;
    }
    if (dto.electricityChargeIncluded !== undefined) {
      updateData.electricityChargeIncluded = dto.electricityChargeIncluded;
    }
    if (dto.waterChargeIncluded !== undefined) {
      updateData.waterChargeIncluded = dto.waterChargeIncluded;
    }
    if (dto.expectedRentIncrease !== undefined) {
      updateData.expectedRentIncrease = dto.expectedRentIncrease || null;
    }
    if (dto.expectedReturnOnInvestment !== undefined) {
      updateData.expectedReturnOnInvestment =
        dto.expectedReturnOnInvestment || null;
    }
    if (dto.taxGovtChargeIncluded !== undefined) {
      updateData.taxGovtChargeIncluded = dto.taxGovtChargeIncluded;
    }
    if (dto.isPreLeasedRented !== undefined) {
      updateData.isPreLeasedRented = dto.isPreLeasedRented;
    }
    if (dto.currentRentPerMonth !== undefined) {
      updateData.currentRentPerMonth = dto.currentRentPerMonth;
    }
    if (dto.leaseYears !== undefined) {
      updateData.leaseYears = dto.leaseYears;
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
    if (!updated) {
      throw new BadRequestException(
        `Property with ID ${dto.propertyId} not found after update`,
      );
    }
    const completionStep =
      updated.completionStep || PropertyCompletionStep.STEP_2;
    const progressPercentage = await this.getProgressPercentageForProperty(
      updated.id,
      completionStep,
    );
    this.invalidatePropertyCaches();
    return {
      id: updated.id,
      status: updated.status,
      completionStep,
      progressPercentage,
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
    const priority: Record<string, number> = {
      residential: 0,
      commercial: 1,
    };

    return categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
      }))
      .sort((a, b) => {
        const aPriority =
          priority[a.code?.toLowerCase() ?? ''] ?? Number.MAX_SAFE_INTEGER;
        const bPriority =
          priority[b.code?.toLowerCase() ?? ''] ?? Number.MAX_SAFE_INTEGER;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return (a.name ?? '').localeCompare(b.name ?? '');
      });
  }

  /**
   * Get all active furnishings
   */
  async getAllFurnishings(): Promise<any[]> {
    const furnishings = await this.furnishingRepository.findAll();
    return furnishings.map((furnishing) => ({
      id: furnishing.id,
      name: furnishing.name,
      code: furnishing.code,
      icon: furnishing.icon ?? null,
      sortOrder: furnishing.sortOrder,
    }));
  }

  /**
   * Get all active amenities
   */
  async getAllAmenities(): Promise<any[]> {
    const amenities = await this.amenityRepository.findAll();
    return amenities.map((amenity) => ({
      id: amenity.id,
      name: amenity.name,
      code: amenity.code,
      icon: amenity.icon ?? null,
      sortOrder: amenity.sortOrder,
    }));
  }

  async getAllRooms(): Promise<any[]> {
    const rooms = await this.roomRepository.findAllActive();
    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      displayOrder: room.displayOrder,
    }));
  }

  async updatePropertyStep3(
    dto: CreatePropertyStep3Dto,
    userId: string,
  ): Promise<{ id: string; status: string; completionStep: number; progressPercentage: number }> {
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
    const previouslyCompletedStep = property.completionStep ?? 0;
    const targetCompletionStep = PropertyCompletionStep.STEP_3;
    const newCompletionStep = Math.max(previouslyCompletedStep, targetCompletionStep);
    const listingScore = this.calculateListingScore(newCompletionStep, property.isVerified);
    const updateData: any = {
      completionStep: newCompletionStep,
      listingScore,
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
    if (dto.minNumberOfSeats !== undefined) {
      updateData.minNumberOfSeats = dto.minNumberOfSeats;
    }
    if (dto.maxNumberOfSeats !== undefined) {
      updateData.maxNumberOfSeats = dto.maxNumberOfSeats;
    }
    if (dto.numberOfCabins !== undefined) {
      updateData.numberOfCabins = dto.numberOfCabins;
    }
    if (dto.numberOfMeetingRooms !== undefined) {
      updateData.numberOfMeetingRooms = dto.numberOfMeetingRooms;
    }
    if (dto.privateWashrooms !== undefined) {
      updateData.privateWashrooms = dto.privateWashrooms ?? null;
    }
    if (dto.publicWashrooms !== undefined) {
      updateData.publicWashrooms = dto.publicWashrooms ?? null;
    }
    if (dto.conferenceRoom !== undefined) {
      updateData.conferenceRoom = dto.conferenceRoom ?? null;
    }
    if (dto.receptionArea !== undefined) {
      updateData.receptionArea = dto.receptionArea ?? null;
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
      if (
        dto.minNumberOfSeats !== undefined ||
        dto.maxNumberOfSeats !== undefined
      ) {
        const minSeats =
          dto.minNumberOfSeats ??
          property.minNumberOfSeats ??
          null;
        const maxSeats =
          dto.maxNumberOfSeats ??
          property.maxNumberOfSeats ??
          null;
        if (minSeats != null && maxSeats != null) {
          parts.push(`seating capacity ${minSeats}-${maxSeats}`);
        } else if (maxSeats != null) {
          parts.push(`up to ${maxSeats} seats`);
        } else if (minSeats != null) {
          parts.push(`at least ${minSeats} seats`);
        }
      }
      const cabins =
        dto.numberOfCabins ?? property.numberOfCabins ?? null;
      if (cabins) {
        parts.push(`${cabins} cabins`);
      }
      const meetings =
        dto.numberOfMeetingRooms ??
        property.numberOfMeetingRooms ??
        null;
      if (meetings) {
        parts.push(`${meetings} meeting rooms`);
      }
      const covered = dto.reservedParkingCovered ?? property.reservedParkingCovered ?? 0;
      const open = dto.reservedParkingOpen ?? property.reservedParkingOpen ?? 0;
      if (covered || open) {
        parts.push(`reserved parking (${covered} covered${open ? `, ${open} open` : ''})`);
      }
      const conferenceRoom =
        dto.conferenceRoom ?? property.conferenceRoom ?? null;
      if (conferenceRoom) {
        parts.push(`${conferenceRoom} conference room${conferenceRoom > 1 ? 's' : ''}`);
      }
      const reception =
        dto.receptionArea ?? property.receptionArea ?? null;
      if (reception === 'yes') {
        parts.push('reception area available');
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
    if (!updated) {
      throw new BadRequestException(
        `Property with ID ${dto.propertyId} not found after update`,
      );
    }
    const completionStep =
      updated.completionStep || PropertyCompletionStep.STEP_3;
    const progressPercentage = await this.getProgressPercentageForProperty(
      updated.id,
      completionStep,
    );
    this.invalidatePropertyCaches();
    return {
      id: updated.id,
      status: updated.status,
      completionStep,
      progressPercentage,
    };
  }

  async getPropertyStep3Details(
    propertyId: string,
    userId: string,
  ): Promise<any> {
    const property =
      await this.propertyRepository.findByIdWithRelations(propertyId);
    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only view your own properties');
    }

    const completionStep = property.completionStep || 0;
    const progressPercentage = this.calculateProgressPercentage(
      completionStep,
      this.determineTotalSteps(property),
    );
    return {
      propertyId: property.id,
      additionalRooms: property.additionalRooms || [],
      reservedParkingCovered: property.reservedParkingCovered ?? null,
      reservedParkingOpen: property.reservedParkingOpen ?? null,
      powerBackup: property.powerBackup || null,
      furnishType: property.furnishType || null,
      furnishingsCounts: property.furnishingsCounts || [],
      minNumberOfSeats: property.minNumberOfSeats ?? null,
      maxNumberOfSeats: property.maxNumberOfSeats ?? null,
      numberOfCabins: property.numberOfCabins ?? null,
      numberOfMeetingRooms: property.numberOfMeetingRooms ?? null,
      privateWashrooms: property.privateWashrooms ?? null,
      publicWashrooms: property.publicWashrooms ?? null,
      conferenceRoom: property.conferenceRoom ?? null,
      receptionArea: property.receptionArea ?? null,
      amenities: property.amenities || [],
      waterSource: property.waterSource || null,
      isLiftAvailable: property.isLiftAvailable ?? null,
      propertyDescription: property.propertyDescription || null,
      status: property.status,
      completionStep,
      progressPercentage,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }

  async updatePropertyStep4(
    dto: CreatePropertyStep4Dto,
    userId: string,
  ): Promise<{ id: string; status: string; completionStep: number; progressPercentage: number }> {
    // Check KYC completion for channel partners
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // if (user.role === UserRole.CHANNEL_PARTNER && !user.kycCompleted) {
    //   throw new BadRequestException(
    //     'KYC verification must be completed before posting properties. Please complete all 4 verification steps.',
    //   );
    // }

    const property = await this.propertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new BadRequestException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only update your own properties');
    }

    // Validate: minimum 2 photos required (for cover selection)
    if (!dto.photos || dto.photos.length < 2) {
      throw new BadRequestException('At least 2 photos are required');
    }

    // Validate: at least one cover image must be selected
    const coverImages = dto.photos.filter(p => p.isCoverImage);
    if (coverImages.length === 0) {
      throw new BadRequestException('At least one cover image must be selected');
    }

    // Validate photos: each must have fileKey and view
    for (const photo of dto.photos) {
      if (!photo.fileKey || !photo.view) {
        throw new BadRequestException('Each photo must have fileKey and view');
      }
    }

    // Validate videos if provided
    if (dto.videos) {
      for (const video of dto.videos) {
        if (!video.fileKey || !video.format) {
          throw new BadRequestException('Each video must have fileKey and format');
        }
      }
    }

    const previouslyCompletedStep = property.completionStep ?? 0;
    const targetCompletionStep = PropertyCompletionStep.STEP_4;

    // KMA-internal CP bypasses the manual review workflow: properties they
    // post go straight to ACTIVE+VERIFIED with all media pre-approved so they
    // appear on the public listing immediately. Identified by env var.
    const internalCpId = process.env.KMA_INTERNAL_CP_USER_ID;
    const isInternalKma = !!internalCpId && userId === internalCpId;

    const newCompletionStep = Math.max(previouslyCompletedStep, targetCompletionStep);
    const listingScore = this.calculateListingScore(
      newCompletionStep,
      isInternalKma ? VerificationStatus.VERIFIED : property.isVerified,
    );

    const mediaApprovalStatus = (isInternalKma ? 'approved' : 'pending') as
      | 'approved'
      | 'pending';

    const updateData: any = {
      completionStep: newCompletionStep,
      listingScore,
      status: isInternalKma ? PropertyStatus.ACTIVE : 'pending_review',
      photos: dto.photos.map(p => ({
        fileKey: p.fileKey,
        view: p.view,
        isCoverImage: p.isCoverImage || false,
        approvalStatus: mediaApprovalStatus,
      })),
    };

    if (isInternalKma) {
      updateData.isVerified = VerificationStatus.VERIFIED;
    }

    if (dto.videos !== undefined) {
      updateData.videos = dto.videos && dto.videos.length > 0
        ? dto.videos.map(v => ({
          fileKey: v.fileKey,
          format: v.format,
          approvalStatus: mediaApprovalStatus,
        }))
        : null;
    }

    await this.propertyRepository.updateProperty(dto.propertyId, updateData);
    const updated = await this.propertyRepository.findById(dto.propertyId);
    if (!updated) {
      throw new BadRequestException(
        `Property with ID ${dto.propertyId} not found after update`,
      );
    }
    const completionStep =
      updated.completionStep || PropertyCompletionStep.STEP_4;
    const progressPercentage = await this.getProgressPercentageForProperty(
      updated.id,
      completionStep,
    );

    // Fire-and-forget Zoho CRM sync — must not block or fail the user response.
    void this.triggerZohoSyncSafe(updated.id);
    this.invalidatePropertyCaches();

    return {
      id: updated.id,
      status: updated.status,
      completionStep,
      progressPercentage,
    };
  }

  async getPropertyStep4Details(
    propertyId: string,
    userId: string,
  ): Promise<any> {
    const property =
      await this.propertyRepository.findByIdWithRelations(propertyId);
    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only view your own properties');
    }

    const completionStep = property.completionStep || 0;
    const progressPercentage = this.calculateProgressPercentage(
      completionStep,
      this.determineTotalSteps(property),
    );
    return {
      propertyId: property.id,
      photos: property.photos || [],
      videos: property.videos || [],
      status: property.status,
      completionStep,
      progressPercentage,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }

  async resetProperty(
    propertyId: string,
    userId: string,
  ): Promise<{
    id: string;
    status: string;
    completionStep: number;
    progressPercentage: number;
  }> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new BadRequestException(
        `Property with ID ${propertyId} not found`,
      );
    }
    if (property.userId !== userId) {
      throw new BadRequestException('You can only update your own properties');
    }

    const resetData: Partial<Property> = {
      cityId: null,
      societyId: null,
      localityId: null,
      propertyTypeId: null,
      bhkTypeId: null,
      builtUpAreaId: null,
      ageOfProperty: null,
      floorNumber: null,
      totalFloors: null,
      flatNumber: null,
      towerBlock: null,
      propertyAreaAcre: null,
      tenantType: null,
      companyOccupancy: null,
      rentAvailability: null,
      availableFromDate: null,
      monthlyRent: null,
      maintenanceType: null,
      maintenanceChargeAmount: null,
      securityDepositType: null,
      securityDepositAmount: null,
      lockInType: null,
      lockInMonths: null,
      brokerageType: null,
      brokerageAmount: null,
      isBrokerageNegotiable: null,
      privateParking: null,
      publicParking: null,
      price: null,
      plotNumber: null,
      houseNumber: null,
      villaNumber: null,
      possessionStatus: null,
      possessionDate: null,
      plotPrice: null,
      brokerage: null,
      loanAvailable: null,
      boundaryWall: null,
      noOfOpenSides: null,
      floorsAllowedForConstruction: null,
      constructionDone: null,
      constructionType: null,
      cornerProperty: null,
      propertyDescription: null,
      additionalRooms: null,
      reservedParkingCovered: null,
      reservedParkingOpen: null,
      powerBackup: null,
      furnishType: null,
      furnishingsCounts: null,
      minNumberOfSeats: null,
      maxNumberOfSeats: null,
      numberOfCabins: null,
      numberOfMeetingRooms: null,
      conferenceRoom: null,
      receptionArea: null,
      amenities: null,
      waterSource: null,
      isLiftAvailable: null,
      noOfStaircases: null,
      isRentNegotiable: null,
      privateWashrooms: null,
      publicWashrooms: null,
      dgUpsChargeIncluded: null,
      electricityChargeIncluded: null,
      waterChargeIncluded: null,
      expectedRentIncrease: null,
      expectedReturnOnInvestment: null,
      taxGovtChargeIncluded: null,
      isPreLeasedRented: null,
      currentRentPerMonth: null,
      leaseYears: null,
      facing: null,
      transactionType: null,
      constructionStatus: null,
      possessionBy: null,
      possessionTime: null,
      plotArea: null,
      plotAreaUnit: null,
      plotLength: null,
      plotLengthUnit: null,
      plotWidth: null,
      plotWidthUnit: null,
      plotFacingRoadWidth: null,
      locationHub: null,
      otherLocationHub: null,
      zoneType: null,
      propertyCondition: null,
      wallConstructionStatus: null,
      ownership: null,
      builtUpArea: null,
      builtUpAreaUnit: null,
      carpetArea: null,
      carpetAreaUnit: null,
      suitableFor: null,
      entranceWidth: null,
      entranceWidthUnit: null,
      ceilingHeight: null,
      ceilingHeightUnit: null,
      locatedNear: null,
      plotLandType: null,
      constructionTypeOptions: null,
      photos: null,
      videos: null,
      adminReviewComment: null,
      adminReviewedBy: null,
      adminReviewedAt: null,
      status: PropertyStatus.DRAFT,
      completionStep: 0,
      listingScore: 0,
    };

    await this.propertyRepository.updateProperty(propertyId, resetData);

    const completionStep =
      resetData.completionStep ?? PropertyCompletionStep.STEP_1;

    return {
      id: propertyId,
      status: resetData.status ?? property.status ?? 'draft',
      completionStep,
      progressPercentage: 0,
    };
  }

  /**
   * Repost a property - changes status to pending_review for admin approval
   */
  async repostProperty(
    propertyId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    propertyId: string;
    status: string;
  }> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new BadRequestException(
        `Property with ID ${propertyId} not found`,
      );
    }

    // Verify ownership
    if (property.userId !== userId) {
      throw new BadRequestException('You can only repost your own properties');
    }

    // Check if property can be reposted (must be rejected or deactivated)
    if (
      property.status !== PropertyStatus.REJECTED &&
      property.status !== PropertyStatus.DEACTIVATED
    ) {
      throw new BadRequestException(
        'Only rejected or deactivated properties can be reposted',
      );
    }

    // Update property status to pending_review and clear rejection/deactivation fields
    await this.propertyRepository.updateProperty(propertyId, {
      status: PropertyStatus.PENDING_REVIEW,
      rejectionReason: null, // Clear rejection reason
      deactivationReason: null, // Clear deactivation reason
      deactivatedOn: null, // Clear deactivation timestamp
      adminReviewComment: null, // Clear previous admin review comment
      adminReviewedBy: null, // Clear previous reviewer
      adminReviewedAt: null, // Clear previous review timestamp
    });

    return {
      success: true,
      message: 'Property reposted successfully. It has been sent for admin review.',
      propertyId: property.id,
      status: PropertyStatus.PENDING_REVIEW,
    };
  }

  /**
   * Deactivate a property with a deactivation reason
   */
  async deactivateProperty(
    propertyId: string,
    deactivationReason: DeactivationReason,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    propertyId: string;
    status: string;
    deactivationReason: DeactivationReason;
    deactivatedOn: Date;
  }> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new BadRequestException(
        `Property with ID ${propertyId} not found`,
      );
    }

    // Verify ownership
    if (property.userId !== userId) {
      throw new BadRequestException('You can only deactivate your own properties');
    }

    // Check if property is already deactivated
    if (property.status === PropertyStatus.DEACTIVATED) {
      throw new BadRequestException('Property is already deactivated');
    }

    // Update property status, deactivation reason, and deactivated timestamp
    const deactivatedOn = new Date();
    await this.propertyRepository.updateProperty(propertyId, {
      status: PropertyStatus.DEACTIVATED,
      deactivationReason: deactivationReason,
      deactivatedOn: deactivatedOn,
    });

    return {
      success: true,
      message: 'Property deactivated successfully',
      propertyId: property.id,
      status: PropertyStatus.DEACTIVATED,
      deactivationReason: deactivationReason,
      deactivatedOn: deactivatedOn,
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
    if (!query || !query.trim()) {
      throw new BadRequestException('Search query is required');
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
    let builtUpArea: any = property.builtUpAreaMetadata ?? null;
    if (!builtUpArea && property.bhkTypeId) {
      if (property.builtUpAreaId) {
        builtUpArea = await this.builtUpAreaRepository.findById(
          property.builtUpAreaId,
        );
      }
      if (!builtUpArea) {
        if (property.societyId) {
          const builtUpAreas =
            await this.builtUpAreaRepository.findByBhkTypeIdAndSocietyId(
              property.bhkTypeId,
              property.societyId,
            );
          builtUpArea = builtUpAreas.length > 0 ? builtUpAreas[0] : null;
        } else if (property.localityId) {
          const builtUpAreas =
            await this.builtUpAreaRepository.findByBhkTypeIdAndLocalityId(
              property.bhkTypeId,
              property.localityId,
            );
          builtUpArea = builtUpAreas.length > 0 ? builtUpAreas[0] : null;
        }
      }
    }

    // Fetch locality if localityId exists
    let locality = property.locality;
    if (!locality && property.localityId) {
      locality = await this.localityRepository.findById(property.localityId);
    }

    // Format the response similar to CreatePropertyStep1Dto
    const completionStep = property.completionStep || 0;
    const progressPercentage = this.calculateProgressPercentage(
      completionStep,
      this.determineTotalSteps(property),
    );
    const builtUpAreaInfo = builtUpArea
      ? {
          id: builtUpArea.id,
          superBuiltUpArea: Number(builtUpArea.superBuiltUpArea),
          carpetArea: Number(builtUpArea.carpetArea),
          noOfBathrooms: builtUpArea.noOfBathrooms,
          noOfBedrooms: builtUpArea.noOfBedrooms,
          balconies: builtUpArea.balconies,
          bhkTypeId: builtUpArea.bhkTypeId,
          societyId: builtUpArea.societyId,
          localityId: builtUpArea.localityId,
        }
      : null;

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
        builtUpAreaId: builtUpAreaInfo?.id || null,
        buildUpAreaSqFt: builtUpAreaInfo?.superBuiltUpArea || 0,
        carpetAreaSqFt: builtUpAreaInfo?.carpetArea || 0,
        noOfBathrooms: builtUpAreaInfo?.noOfBathrooms || 0,
        noOfBedrooms: builtUpAreaInfo?.noOfBedrooms ?? null,
        balconies: builtUpAreaInfo?.balconies ?? null,
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
      possessionStatus: property.possessionStatus || null,
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
      plotArea: property.plotArea || null,
      plotAreaUnit: property.plotAreaUnit || null,
      plotLength: property.plotLength || null,
      plotLengthUnit: property.plotLengthUnit || null,
      plotWidth: property.plotWidth || null,
      plotWidthUnit: property.plotWidthUnit || null,
      plotFacingRoadWidth: property.plotFacingRoadWidth || null,
      locationHub: property.locationHub || null,
      otherLocationHub: property.otherLocationHub || null,
      zoneType: property.zoneType || null,
      propertyCondition: property.propertyCondition || null,
      wallConstructionStatus: property.wallConstructionStatus || null,
      ownership: property.ownership || null,
      builtUpArea: property.builtUpArea || null,
      builtUpAreaUnit: property.builtUpAreaUnit || null,
      carpetArea: property.carpetArea || null,
      carpetAreaUnit: property.carpetAreaUnit || null,
      suitableFor: property.suitableFor || [],
      entranceWidth: property.entranceWidth || null,
      entranceWidthUnit: property.entranceWidthUnit || null,
      ceilingHeight: property.ceilingHeight || null,
      ceilingHeightUnit: property.ceilingHeightUnit || null,
      locatedNear: property.locatedNear || [],
      plotLandType: property.plotLandType || null,
      noOfOpenSides: property.noOfOpenSides || null,
      constructionDone: property.constructionDone || null,
      constructionTypeOptions: property.constructionTypeOptions || [],
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      builtUpAreaInfo,
      completionStep,
      progressPercentage,
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
    const completionStep = property.completionStep || 0;
    const progressPercentage = this.calculateProgressPercentage(
      completionStep,
      this.determineTotalSteps(property),
    );
    return {
      propertyId: property.id,
      floorNumber: property.floorNumber,
      totalFloors: property.totalFloors,
      flatNumber: property.flatNumber,
      towerBlock: property.towerBlock,
      propertyAreaAcre: property.propertyAreaAcre,
      isLiftAvailable: property.isLiftAvailable ?? null,
      tenantType: property.tenantType ?? [],
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
      noOfStaircases: property.noOfStaircases || null,
      privateParking: property.privateParking || null,
      privateWashrooms: property.privateWashrooms || null,
      publicParking: property.publicParking || null,
      publicWashrooms: property.publicWashrooms || null,
      isRentNegotiable: property.isRentNegotiable || null,
      dgUpsChargeIncluded: property.dgUpsChargeIncluded || null,
      electricityChargeIncluded: property.electricityChargeIncluded || null,
      waterChargeIncluded: property.waterChargeIncluded || null,
      expectedRentIncrease: property.expectedRentIncrease || null,
      expectedReturnOnInvestment:
        property.expectedReturnOnInvestment || null,
      taxGovtChargeIncluded: property.taxGovtChargeIncluded || null,
      isPreLeasedRented: property.isPreLeasedRented || null,
      currentRentPerMonth: property.currentRentPerMonth || null,
      leaseYears: property.leaseYears || null,
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
      completionStep,
      progressPercentage,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }

  /**
   * Request property verification - generates a verification link
   */
  async requestPropertyVerification(
    dto: RequestPropertyVerificationDto,
    userId: string,
  ): Promise<RequestPropertyVerificationResponseDto> {
    const property = await this.propertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new BadRequestException('Property not found');
    }

    if (property.userId !== userId) {
      throw new BadRequestException('You can only request verification for your own properties');
    }

    // Check if property is active
    if (property.status !== PropertyStatus.ACTIVE) {
      throw new BadRequestException('Only active properties can be verified');
    }

    // Check if there's already a valid (not expired, not submitted) verification request
    const existingValid = await this.propertyVerificationRequestRepository.findValidByPropertyId(dto.propertyId);
    if (existingValid) {
      // Return existing valid link
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://example.com';
      const verificationLink = `${frontendUrl}?token=${existingValid.verificationToken}`;
      
      return {
        success: true,
        message: 'Verification request already exists. Use the link to upload live photos/videos.',
        verificationRequestId: existingValid.id,
        verificationToken: existingValid.verificationToken,
        verificationLink,
      };
    }

    // Generate unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Get frontend URL from config (default to placeholder if not set)

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://example.com';
    const verificationLink = `${frontendUrl}?token=${verificationToken}`;
    
    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create verification request
    const verificationRequest = await this.propertyVerificationRequestRepository.create({
      propertyId: dto.propertyId,
      requestedBy: userId,
      verificationToken,
      status: PropertyVerificationStatus.PENDING,
      expiresAt,
    });

    return {
      success: true,
      message: 'Verification request created successfully. Use the link to upload live photos/videos.',
      verificationRequestId: verificationRequest.id,
      verificationToken,
      verificationLink,
    };
  }

  /**
   * Submit property verification media using verification token (public endpoint)
   */
  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in meters
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async submitPropertyVerificationMedia(
    dto: SubmitPropertyVerificationMediaDto,
  ): Promise<SubmitPropertyVerificationMediaResponseDto> {
    // Find verification request by token
    const verificationRequest = await this.propertyVerificationRequestRepository.findByToken(dto.verificationToken);
    if (!verificationRequest) {
      throw new BadRequestException('Invalid verification token');
    }

    // Check if request is in pending status
    if (verificationRequest.status !== PropertyVerificationStatus.PENDING) {
      throw new BadRequestException('This verification request is no longer pending');
    }

    // Check if verification link has expired
    const now = new Date();
    if (verificationRequest.expiresAt <= now) {
      throw new BadRequestException('This verification link has expired. Please request a new verification link.');
    }

    // Validate location - check if submitted coordinates are within 1 km of property location
    const property = verificationRequest.property;
    let propertyLat: number | null = null;
    let propertyLon: number | null = null;

    // Try to get coordinates from society first, then locality
    if (property.society?.latitude != null && property.society?.longitude != null) {
      propertyLat = Number(property.society.latitude);
      propertyLon = Number(property.society.longitude);
    } else if (property.locality?.latitude != null && property.locality?.longitude != null) {
      propertyLat = Number(property.locality.latitude);
      propertyLon = Number(property.locality.longitude);
    }

    if (propertyLat == null || propertyLon == null) {
      throw new BadRequestException(
        'Property location coordinates are not available. Cannot verify location.',
      );
    }

    // Calculate distance between submitted coordinates and property location
    const distanceInMeters = this.calculateDistance(
      propertyLat,
      propertyLon,
      dto.latitude,
      dto.longitude,
    );

    const maxDistanceMeters = 1000; // 1 km
    if (distanceInMeters > maxDistanceMeters) {
      throw new BadRequestException(
        `Location verification failed. You must be within ${maxDistanceMeters / 1000} km of the property location. Current distance: ${(distanceInMeters / 1000).toFixed(2)} km`,
      );
    }

    // Prepare media data with timestamps
    const livePhotos = dto.livePhotos.map(photo => ({
      fileKey: photo.fileKey,
      view: photo.view,
      uploadedAt: new Date(),
    }));

    const liveVideos = dto.liveVideos?.map(video => ({
      fileKey: video.fileKey,
      format: video.format,
      uploadedAt: new Date(),
    })) || null;

    // Update verification request with media
    await this.propertyVerificationRequestRepository.update(verificationRequest.id, {
      livePhotos,
      liveVideos,
      status: PropertyVerificationStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    return {
      success: true,
      message: 'Verification media submitted successfully. Waiting for admin approval.',
      verificationRequestId: verificationRequest.id,
    };
  }

  /**
   * Generate property description using ChatGPT API based on all fields from steps 1-3
   */
  async generatePropertyDescription(
    dto: GeneratePropertyDescriptionDto,
    userId: string,
  ): Promise<GeneratePropertyDescriptionResponseDto> {
    // Load property with all relations
    const property = await this.propertyRepository.findByIdWithRelations(
      dto.propertyId,
    );

    if (!property) {
      throw new BadRequestException('Property not found');
    }

    // Verify ownership
    if (property.userId !== userId) {
      throw new BadRequestException(
        'You can only generate descriptions for your own properties',
      );
    }

    // Prepare property data for ChatGPT
    const propertyData: Record<string, any> = {
      bhkType: property.bhkType?.name || null,
      propertyType: property.propertyType?.name || null,
      furnishType: property.furnishType || null,
      society: property.society?.name || null,
      locality: property.locality?.name || null,
      city: property.city?.name || null,
      superBuiltUpArea: property.builtUpAreaMetadata?.superBuiltUpArea || null,
      carpetArea: property.builtUpAreaMetadata?.carpetArea || null,
      bedrooms: property.builtUpAreaMetadata?.noOfBedrooms || null,
      bathrooms: property.builtUpAreaMetadata?.noOfBathrooms || null,
      balconies: property.builtUpAreaMetadata?.balconies || null,
      floorNumber: property.floorNumber,
      totalFloors: property.totalFloors,
      flatNumber: property.flatNumber || null,
      towerBlock: property.towerBlock || null,
      additionalRooms: property.additionalRooms || null,
      reservedParkingCovered: property.reservedParkingCovered || null,
      reservedParkingOpen: property.reservedParkingOpen || null,
      powerBackup: property.powerBackup || null,
      minNumberOfSeats: property.minNumberOfSeats,
      maxNumberOfSeats: property.maxNumberOfSeats,
      numberOfCabins: property.numberOfCabins || null,
      numberOfMeetingRooms: property.numberOfMeetingRooms || null,
      conferenceRoom: property.conferenceRoom || null,
      receptionArea: property.receptionArea || null,
      furnishingsCounts: property.furnishingsCounts || null,
      amenities: property.amenities || null,
      ageOfProperty: property.ageOfProperty,
      constructionStatus: property.constructionStatus || null,
      facing: property.facing || null,
      transactionType: property.transactionType || null,
      monthlyRent: property.monthlyRent || null,
      price: property.price || null,
      possessionStatus: property.possessionStatus || null,
      possessionDate: property.possessionDate
        ? new Date(property.possessionDate).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
          })
        : null,
      waterSource: property.waterSource || null,
      isLiftAvailable: property.isLiftAvailable,
    };

    try {
      // Generate description using ChatGPT
      const description = await this.openAIService.generatePropertyDescription(
        propertyData,
      );

      return {
        success: true,
        description,
        propertyId: property.id,
      };
    } catch (error) {
      // Fallback to a basic description if ChatGPT API fails
      const fallbackDescription = this.generateFallbackDescription(property);
      return {
        success: true,
        description: fallbackDescription,
        propertyId: property.id,
      };
    }
  }

  /**
   * Generate a basic fallback description if ChatGPT API fails
   */
  private generateFallbackDescription(property: Property): string {
    const parts: string[] = [];

    if (property.bhkType?.name) {
      parts.push(property.bhkType.name);
    }
    if (property.propertyType?.name) {
      parts.push(property.propertyType.name.toLowerCase());
    }
    if (property.furnishType) {
      parts.push(property.furnishType);
    }

    const locationParts: string[] = [];
    if (property.society?.name) locationParts.push(property.society.name);
    if (property.locality?.name) locationParts.push(property.locality.name);
    if (property.city?.name) locationParts.push(property.city.name);
    if (locationParts.length > 0) {
      parts.push(`in ${locationParts.join(', ')}`);
    }

    const description = parts.filter(Boolean).join(' ');
    return description
      ? `${description.charAt(0).toUpperCase() + description.slice(1)}.`
      : 'Property details available upon request.';
  }
}
