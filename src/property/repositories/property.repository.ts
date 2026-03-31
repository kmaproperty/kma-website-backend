import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Property } from '../entities/property.entity';
import { PropertyStatus } from '../enum/property-status.enum';

@Injectable()
export class PropertyRepository {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async findAll(): Promise<Property[]> {
    return await this.propertyRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Property | null> {
    return await this.propertyRepository.findOne({
      where: { id, isDeleted: false },
    });
  }

  async findByIdWithRelations(id: string): Promise<Property | null> {
    return await this.propertyRepository.findOne({
      where: { id, isDeleted: false },
      relations: [
        'listingType',
        'category',
        'city',
        'society',
        'locality',
        'propertyType',
        'bhkType',
        'builtUpAreaMetadata',
        'user',
      ],
    });
  }

  async findByUserId(userId: string): Promise<Property[]> {
    return await this.propertyRepository.find({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.propertyRepository.count({
      where: { userId, isDeleted: false },
    });
  }

  /**
   * Count active properties by user ID (active and not deleted)
   */
  async countActivePropertiesByUserId(userId: string): Promise<number> {
    return await this.propertyRepository.count({
      where: { userId, status: PropertyStatus.ACTIVE, isDeleted: false },
    });
  }

  /**
   * Count properties by user ID and category ID (not deleted)
   */
  async countByUserIdAndCategoryId(
    userId: string,
    categoryId: string,
  ): Promise<number> {
    return await this.propertyRepository.count({
      where: { userId, categoryId, isDeleted: false },
    });
  }

  /**
   * Find active properties by user ID with all relations (active and not deleted)
   */
  async findActivePropertiesByUserId(
    userId: string,
    limit: number = 20,
  ): Promise<Property[]> {
    return await this.propertyRepository.find({
      where: { userId, status: PropertyStatus.ACTIVE, isDeleted: false },
      relations: [
        'listingType',
        'category',
        'propertyType',
        'city',
        'society',
        'locality',
        'bhkType',
        'builtUpAreaMetadata',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Find active properties by user ID categorized (Buy, Rent, Commercial)
   * Returns top 10 most recent properties in each category
   */
  async findActivePropertiesByUserIdCategorized(
    userId: string,
  ): Promise<{
    buy: Property[];
    rent: Property[];
    commercial: Property[];
  }> {
    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .where('property.userId = :userId', { userId })
      .andWhere('property.status = :status', { status: PropertyStatus.ACTIVE })
      .andWhere('property.isDeleted = false')
      .orderBy('property.createdAt', 'DESC');

    // Fetch all active properties
    const allProperties = await qb.getMany();

    // Categorize properties
    const buy: Property[] = [];
    const rent: Property[] = [];
    const commercial: Property[] = [];

    for (const property of allProperties) {
      const categoryName = property.category?.name?.toLowerCase() || '';
      const listingTypeName = property.listingType?.name?.toLowerCase() || '';

      if (categoryName === 'commercial') {
        commercial.push(property);
      } else if (categoryName === 'residential') {
        if (listingTypeName === 'sale') {
          buy.push(property);
        } else if (listingTypeName === 'rent') {
          rent.push(property);
        }
      }
    }

    // Return top 10 in each category
    return {
      buy: buy.slice(0, 10),
      rent: rent.slice(0, 10),
      commercial: commercial.slice(0, 10),
    };
  }

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const property = this.propertyRepository.create(propertyData);
    return await this.propertyRepository.save(property);
  }

  async findWithPagination(options: {
    offset: number;
    limit: number;
    status?: string;
    statuses?: string[];
    cityId?: string;
    userId?: string;
    listingTypeIds?: string[];
    categoryIds?: string[];
    furnishingTypes?: string[];
  }): Promise<{ items: Property[]; total: number }> {
    const { offset, limit, status, statuses, cityId, userId, listingTypeIds, categoryIds, furnishingTypes } = options;

    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.user', 'user')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .where('property.isDeleted = false')
      .orderBy('property.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) {
      qb.andWhere('property.status = :status', { status });
    }

    if (statuses?.length) {
      qb.andWhere('property.status IN (:...statuses)', { statuses });
    }

    if (cityId) {
      qb.andWhere('property.cityId = :cityId', { cityId });
    }

    if (userId) {
      qb.andWhere('property.userId = :userId', { userId });
    }

    if (listingTypeIds?.length) {
      qb.andWhere('property.listingTypeId IN (:...listingTypeIds)', { listingTypeIds });
    }

    if (categoryIds?.length) {
      qb.andWhere('property.categoryId IN (:...categoryIds)', { categoryIds });
    }

    if (furnishingTypes?.length) {
      qb.andWhere('property.furnishType IN (:...furnishingTypes)', { furnishingTypes });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async getPropertySummaryCounts(): Promise<{
    totalProperties: number;
    activeProperties: number;
    pendingProperties: number;
    verifiedProperties: number;
  }> {
    const base = this.propertyRepository.createQueryBuilder('p').where('p.isDeleted = false');

    const totalProperties = await base.clone().getCount();
    const activeProperties = await base.clone().andWhere("p.status = 'active'").getCount();
    const pendingProperties = await base.clone().andWhere("p.status = 'pending_review'").getCount();
    const verifiedProperties = await base.clone().andWhere("p.isVerified = 'verified'").getCount();

    return { totalProperties, activeProperties, pendingProperties, verifiedProperties };
  }

  async countByListingTypeCode(code: string): Promise<number> {
    return this.propertyRepository
      .createQueryBuilder('p')
      .leftJoin('p.listingType', 'lt')
      .where('p.isDeleted = false')
      .andWhere('lt.code = :code', { code })
      .getCount();
  }

  async getPropertyCountsByUserIds(userIds: string[]): Promise<Array<{ userId: string; sold: string; rent: string }>> {
    if (userIds.length === 0) return [];
    return this.propertyRepository
      .createQueryBuilder('p')
      .select('p.userId', 'userId')
      .addSelect(`SUM(CASE WHEN lt.code = 'sale' THEN 1 ELSE 0 END)`, 'sold')
      .addSelect(`SUM(CASE WHEN lt.code = 'rent' THEN 1 ELSE 0 END)`, 'rent')
      .leftJoin('p.listingType', 'lt')
      .where('p.userId IN (:...ids)', { ids: userIds })
      .andWhere('p.isDeleted = false')
      .groupBy('p.userId')
      .getRawMany();
  }

  private applyOwnerListingSort(
    qb: SelectQueryBuilder<Property>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): void {
    switch (sortBy) {
      case 'price':
        qb.addOrderBy(
          'COALESCE(property.price, property.monthlyRent)',
          sortOrder,
          'NULLS LAST',
        );
        qb.addOrderBy('property.createdAt', 'DESC');
        break;
      case 'expiresAt':
        qb.addOrderBy('property.expiresAt', sortOrder, 'NULLS LAST');
        qb.addOrderBy('property.createdAt', 'DESC');
        break;
      case 'updatedAt':
        qb.addOrderBy('property.updatedAt', sortOrder);
        qb.addOrderBy('property.createdAt', 'DESC');
        break;
      case 'createdAt':
      default:
        qb.addOrderBy('property.createdAt', sortOrder);
        break;
    }
  }

  async findOwnerListings(options: {
    userId: string;
    page: number;
    limit: number;
    sortBy: 'createdAt' | 'price' | 'updatedAt' | 'expiresAt';
    sortOrder: 'ASC' | 'DESC';
    filters?: {
      categoryIds?: string[];
      propertyTypeIds?: string[];
      listingTypeIds?: string[];
      furnishingTypes?: string[];
      projectStatuses?: string[];
      statuses?: string[];
      listingStatuses?: string[];
      verificationStatuses?: string[];
      minPrice?: number | null;
      maxPrice?: number;
      search?: string;
      recentlyExpired?: boolean;
    };
  }): Promise<{
    items: Property[];
    total: number;
    statusCounts: Record<string, number>;
  }> {
    const {
      userId,
      page,
      limit,
      sortBy,
      sortOrder,
      filters = {},
    } = options;

    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .where('property.userId = :userId', { userId })
      .andWhere('property.isDeleted = false');

    if (filters.categoryIds?.length) {
      qb.andWhere('property.categoryId IN (:...categoryIds)', {
        categoryIds: filters.categoryIds,
      });
    }

    if (filters.propertyTypeIds?.length) {
      qb.andWhere('property.propertyTypeId IN (:...propertyTypeIds)', {
        propertyTypeIds: filters.propertyTypeIds,
      });
    }

    if (filters.listingTypeIds?.length) {
      qb.andWhere('property.listingTypeId IN (:...listingTypeIds)', {
        listingTypeIds: filters.listingTypeIds,
      });
    }

    if (filters.furnishingTypes?.length) {
      qb.andWhere('property.furnishType IN (:...furnishingTypes)', {
        furnishingTypes: filters.furnishingTypes,
      });
    }

    if (filters.projectStatuses?.length) {
      qb.andWhere('property.constructionStatus IN (:...projectStatuses)', {
        projectStatuses: filters.projectStatuses,
      });
    }

    if (filters.statuses?.length) {
      qb.andWhere('property.status IN (:...statuses)', {
        statuses: filters.statuses,
      });
    }

    // Handle listing status filters (active, expired, deactivated)
    if (filters.listingStatuses?.length) {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      const now = new Date();

      if (filters.listingStatuses.includes('active')) {
        conditions.push('property.status = :activeStatus');
        params.activeStatus = 'active';
      }

      if (filters.listingStatuses.includes('expired')) {
        conditions.push(
          '(property.status = :expiredActiveStatus AND property.expiresAt IS NOT NULL AND property.expiresAt < :expiredNow)',
        );
        params.expiredActiveStatus = 'active';
        params.expiredNow = now;
      }

      if (filters.listingStatuses.includes('deactivated')) {
        conditions.push('property.status = :deactivatedStatus');
        params.deactivatedStatus = 'deactivated';
      }

      if (conditions.length > 0) {
        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    // Handle verification status filters
    if (filters.verificationStatuses?.length) {
      qb.andWhere('property.is_verified IN (:...verificationStatuses)', {
        verificationStatuses: filters.verificationStatuses,
      });
    }

    if (filters.minPrice != null) {
      if (filters.minPrice === 0) {
        // When minPrice is 0, include properties with price >= 0 OR price is null OR (draft with null price)
        qb.andWhere(
          '( (property.price IS NOT NULL AND property.price >= :minPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent >= :minPrice) OR property.price IS NULL OR property.monthlyRent IS NULL OR (property.status = :draftStatus AND (property.price IS NULL OR property.monthlyRent IS NULL)) )',
          { minPrice: filters.minPrice, draftStatus: PropertyStatus.DRAFT },
        );
      } else {
        // When minPrice > 0, include properties with price >= minPrice OR (draft with null price)
        qb.andWhere(
          '( (property.price IS NOT NULL AND property.price >= :minPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent >= :minPrice) OR (property.status = :draftStatus AND (property.price IS NULL OR property.monthlyRent IS NULL)) )',
          { minPrice: filters.minPrice, draftStatus: PropertyStatus.DRAFT },
        );
      }
    }

    if (filters.maxPrice != null) {
      qb.andWhere(
        '( (property.price IS NOT NULL AND property.price <= :maxPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent <= :maxPrice) OR (property.status = :draftStatus AND (property.price IS NULL OR property.monthlyRent IS NULL)) )',
        { maxPrice: filters.maxPrice, draftStatus: PropertyStatus.DRAFT },
      );
    }

    if (filters.search?.trim()) {
      const searchTerm = filters.search.trim();
      qb.andWhere(
        '(property.id ILIKE :searchTerm OR CAST(property.createdAt AS TEXT) ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    if (filters.recentlyExpired) {
      // Properties that have expired (expiresAt < now) and were active
      const now = new Date();
      qb.andWhere('property.expiresAt IS NOT NULL')
        .andWhere('property.expiresAt < :now', { now })
        .andWhere('property.status = :activeStatus', { activeStatus: 'active' });
    }

    const total = await qb.clone().getCount();

    const statusCountsRaw = await qb
      .clone()
      .select('property.status', 'status')
      .addSelect('COUNT(property.id)', 'count')
      .groupBy('property.status')
      .getRawMany();

    const statusCounts = statusCountsRaw.reduce<Record<string, number>>(
      (acc, row) => {
        acc[row.status] = Number(row.count);
        return acc;
      },
      {},
    );

    const dataQb = qb.clone();
    this.applyOwnerListingSort(dataQb, sortBy, sortOrder);
    dataQb.skip((page - 1) * limit).take(limit);

    const items = await dataQb.getMany();

    return {
      items,
      total,
      statusCounts,
    };
  }

  async findByIdWithUser(id: string): Promise<Property | null> {
    return this.propertyRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user'],
    });
  }

  /**
   * Find one active property (with photos) by property type for explore/card display.
   * Returns only id and photos. Used to get a sample image per property type.
   */
  async findOneActiveWithPhotosByPropertyType(
    propertyTypeId: string,
    filters?: { cityId?: string; listingTypeId?: string },
  ): Promise<Pick<Property, 'id' | 'photos'> | null> {
    const where: Record<string, unknown> = {
      propertyTypeId,
      status: PropertyStatus.ACTIVE,
      isDeleted: false,
    };
    if (filters?.cityId) where.cityId = filters.cityId;
    if (filters?.listingTypeId) where.listingTypeId = filters.listingTypeId;
    const prop = await this.propertyRepository.findOne({
      where,
      select: ['id', 'photos'],
      order: { createdAt: 'DESC' },
    });
    if (!prop || !prop.photos || prop.photos.length === 0) return null;
    return { id: prop.id, photos: prop.photos };
  }

  async updateProperty(
    id: string,
    updateData: Partial<Property>,
  ): Promise<void> {
    await this.propertyRepository.update(id, updateData);
  }

  async deleteProperty(id: string): Promise<void> {
    await this.propertyRepository.delete(id);
  }

  async findEndUserProperties(options: {
    page: number;
    limit: number;
    sortBy: 'price' | 'createdAt' | 'updatedAt';
    sortOrder: 'ASC' | 'DESC';
    filters?: {
      cityId?: string;
      search?: string;
      categoryIds?: string[];
      listingTypeIds?: string[];
      propertyTypeIds?: string[];
      bhkTypeIds?: string[];
      furnishingTypes?: string[];
      constructionStatuses?: string[];
      minPrice?: number;
      maxPrice?: number;
      latitude?: number;
      longitude?: number;
      radius?: number;
      minSize?: number;
      maxSize?: number;
      amenityIds?: string[];
      postedBy?: string[];
    };
  }): Promise<{
    items: Property[];
    total: number;
  }> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      filters = {},
    } = options;

    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .leftJoinAndSelect('property.user', 'user')
      .where('property.isDeleted = false')
      .andWhere('property.status = :status', { status: PropertyStatus.ACTIVE });

    // Filter by city
    if (filters.cityId) {
      qb.andWhere('property.cityId = :cityId', { cityId: filters.cityId });
    }

    // Filter by category
    if (filters.categoryIds?.length) {
      qb.andWhere('property.categoryId IN (:...categoryIds)', {
        categoryIds: filters.categoryIds,
      });
    }

    // Filter by listing type (Sale/Rent)
    if (filters.listingTypeIds?.length) {
      qb.andWhere('property.listingTypeId IN (:...listingTypeIds)', {
        listingTypeIds: filters.listingTypeIds,
      });
    }

    // Filter by property type
    if (filters.propertyTypeIds?.length) {
      qb.andWhere('property.propertyTypeId IN (:...propertyTypeIds)', {
        propertyTypeIds: filters.propertyTypeIds,
      });
    }

    // Filter by BHK type
    if (filters.bhkTypeIds?.length) {
      qb.andWhere('property.bhkTypeId IN (:...bhkTypeIds)', {
        bhkTypeIds: filters.bhkTypeIds,
      });
    }

    // Filter by furnishing types
    if (filters.furnishingTypes?.length) {
      qb.andWhere('property.furnishType IN (:...furnishingTypes)', {
        furnishingTypes: filters.furnishingTypes,
      });
    }

    // Filter by construction status
    if (filters.constructionStatuses?.length) {
      qb.andWhere('property.constructionStatus IN (:...constructionStatuses)', {
        constructionStatuses: filters.constructionStatuses,
      });
    }

    // Filter by size (built-up / carpet area in sq ft); use effective size = COALESCE(property.builtUpArea, metadata super/carpet)
    // Use quoted identifiers so PostgreSQL preserves column case (builtUpArea, not builtuparea)
    if (filters.minSize != null && filters.minSize > 0) {
      qb.andWhere(
        `COALESCE(
          "property"."builtUpArea"::decimal,
          "builtUpAreaMetadata"."super_built_up_area",
          "builtUpAreaMetadata"."carpet_area"
        ) >= :minSize`,
        { minSize: filters.minSize },
      );
    }
    if (filters.maxSize != null && filters.maxSize > 0) {
      qb.andWhere(
        `COALESCE(
          "property"."builtUpArea"::decimal,
          "builtUpAreaMetadata"."super_built_up_area",
          "builtUpAreaMetadata"."carpet_area"
        ) <= :maxSize`,
        { maxSize: filters.maxSize },
      );
    }

    // Filter by amenities (property must have at least one of the given amenity IDs)
    if (filters.amenityIds?.length) {
      // property.amenities is simple-array (comma-separated); match any of the IDs
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM unnest(string_to_array(COALESCE(TRIM(property.amenities), ''), ',')) AS a
          WHERE TRIM(a) IN (:...amenityIds)
        )`,
        { amenityIds: filters.amenityIds },
      );
    }

    // Filter by price range
    if (filters.minPrice != null) {
      if (filters.minPrice === 0) {
        // When minPrice is 0, include properties with price >= 0 OR price is null OR (draft with null price)
        qb.andWhere(
          '( (property.price IS NOT NULL AND property.price >= :minPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent >= :minPrice) OR property.price IS NULL OR property.monthlyRent IS NULL OR (property.status = :draftStatus AND (property.price IS NULL OR property.monthlyRent IS NULL)) )',
          { minPrice: filters.minPrice, draftStatus: PropertyStatus.DRAFT },
        );
      } else {
        // When minPrice > 0, include properties with price >= minPrice OR (draft with null price)
        qb.andWhere(
          '( (property.price IS NOT NULL AND property.price >= :minPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent >= :minPrice) OR (property.status = :draftStatus AND (property.price IS NULL OR property.monthlyRent IS NULL)) )',
          { minPrice: filters.minPrice, draftStatus: PropertyStatus.DRAFT },
        );
      }
    }

    if (filters.maxPrice != null) {
      qb.andWhere(
        '( (property.price IS NOT NULL AND property.price <= :maxPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent <= :maxPrice) OR (property.status = :draftStatus AND (property.price IS NULL OR property.monthlyRent IS NULL)) )',
        { maxPrice: filters.maxPrice, draftStatus: PropertyStatus.DRAFT },
      );
    }

    // Search by project name, locality, or builder
    if (filters.search?.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      qb.andWhere(
        '(society.name ILIKE :searchTerm OR locality.name ILIKE :searchTerm OR property.propertyDescription ILIKE :searchTerm)',
        { searchTerm },
      );
    }

    // Location-based search (Near Me) - use society, locality, or city coordinates
    if (
      filters.latitude != null &&
      filters.longitude != null &&
      filters.radius != null
    ) {
      const radiusInKm = filters.radius;
      const lat = filters.latitude;
      const lon = filters.longitude;

      qb.andWhere(
        `(society.latitude IS NOT NULL AND society.longitude IS NOT NULL) OR (locality.latitude IS NOT NULL AND locality.longitude IS NOT NULL) OR (city.latitude IS NOT NULL AND city.longitude IS NOT NULL)`,
      ).andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * 
            cos(radians(CAST(COALESCE(society.latitude, locality.latitude, city.latitude) AS DECIMAL))) * 
            cos(radians(CAST(COALESCE(society.longitude, locality.longitude, city.longitude) AS DECIMAL)) - radians(:lon)) + 
            sin(radians(:lat)) * 
            sin(radians(CAST(COALESCE(society.latitude, locality.latitude, city.latitude) AS DECIMAL)))
          )
        ) <= :radius`,
        { lat, lon, radius: radiusInKm },
      );
    }

    // Filter by posted by (user role)
    if (filters.postedBy?.length) {
      // If "ALL" is in the array, don't filter by role (return all properties)
      if (!filters.postedBy.includes('ALL')) {
        qb.andWhere('user.role IN (:...postedBy)', {
          postedBy: filters.postedBy,
        });
      }
      // If "ALL" is present, no filter is applied - all properties are returned
    }

    // Get total count
    const total = await qb.clone().getCount();

    // Clone query builder for data fetching (same pattern as findOwnerListings)
    const dataQb = qb.clone();

    // Apply sorting
    switch (sortBy) {
      case 'price':
        // Use raw SQL expression to avoid TypeORM parsing issues
        // Add the COALESCE as a select expression first, then order by the alias
        dataQb.addSelect(
          'COALESCE(property.price, property.monthlyRent)',
          'sort_price',
        );
        dataQb.orderBy('sort_price', sortOrder, 'NULLS LAST');
        dataQb.addOrderBy('property.createdAt', 'DESC');
        break;
      case 'updatedAt':
        dataQb.addOrderBy('property.updatedAt', sortOrder);
        break;
      case 'createdAt':
      default:
        dataQb.addOrderBy('property.createdAt', sortOrder);
        break;
    }

    // Apply pagination
    dataQb.skip((page - 1) * limit).take(limit);

    const items = await dataQb.getMany();

    return {
      items,
      total,
    };
  }

  /**
   * Find top properties with pagination and optional city filter
   */
  async findTopProperties(options: {
    page: number;
    limit: number;
    cityId?: string;
    status?: PropertyStatus;
  }): Promise<{
    items: Property[];
    total: number;
  }> {
    const { page, limit, cityId, status } = options;

    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.user', 'user')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .where('property.isDeleted = false')
      .andWhere('property.isTop = true')
      .orderBy('property.createdAt', 'DESC');

    // Filter by status if provided
    if (status) {
      qb.andWhere('property.status = :status', { status });
    }

    // Filter by city if provided
    if (cityId) {
      qb.andWhere('property.cityId = :cityId', { cityId });
    }

    // Get total count
    const total = await qb.clone().getCount();

    // Apply pagination
    qb.skip((page - 1) * limit).take(limit);

    const items = await qb.getMany();

    return {
      items,
      total,
    };
  }

  /**
   * Find featured properties with pagination and optional city filter
   */
  async findFeaturedProperties(options: {
    page: number;
    limit: number;
    cityId?: string;
    status?: PropertyStatus;
  }): Promise<{
    items: Property[];
    total: number;
  }> {
    const { page, limit, cityId, status } = options;

    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.user', 'user')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .where('property.isDeleted = false')
      .andWhere('property.isFeatured = true')
      .orderBy('property.createdAt', 'DESC');

    // Filter by status if provided
    if (status) {
      qb.andWhere('property.status = :status', { status });
    }

    // Filter by city if provided
    if (cityId) {
      qb.andWhere('property.cityId = :cityId', { cityId });
    }

    // Get total count
    const total = await qb.clone().getCount();

    // Apply pagination
    qb.skip((page - 1) * limit).take(limit);

    const items = await qb.getMany();

    return {
      items,
      total,
    };
  }
}
