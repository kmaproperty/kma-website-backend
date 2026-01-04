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
  }): Promise<{ items: Property[]; total: number }> {
    const { offset, limit, status } = options;

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

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
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
      minPrice?: number;
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
      qb.andWhere(
        '( (property.price IS NOT NULL AND property.price >= :minPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent >= :minPrice) )',
        { minPrice: filters.minPrice },
      );
    }

    if (filters.maxPrice != null) {
      qb.andWhere(
        '( (property.price IS NOT NULL AND property.price <= :maxPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent <= :maxPrice) )',
        { maxPrice: filters.maxPrice },
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
      propertyTypeIds?: string[];
      bhkTypeIds?: string[];
      furnishingTypes?: string[];
      constructionStatuses?: string[];
      minPrice?: number;
      maxPrice?: number;
      latitude?: number;
      longitude?: number;
      radius?: number;
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

    // Filter by price range
    if (filters.minPrice != null) {
      qb.andWhere(
        '( (property.price IS NOT NULL AND property.price >= :minPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent >= :minPrice) )',
        { minPrice: filters.minPrice },
      );
    }

    if (filters.maxPrice != null) {
      qb.andWhere(
        '( (property.price IS NOT NULL AND property.price <= :maxPrice) OR (property.monthlyRent IS NOT NULL AND property.monthlyRent <= :maxPrice) )',
        { maxPrice: filters.maxPrice },
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

    // Location-based search (Near Me)
    if (
      filters.latitude != null &&
      filters.longitude != null &&
      filters.radius != null
    ) {
      // Haversine formula for distance calculation
      const radiusInKm = filters.radius;
      const lat = filters.latitude;
      const lon = filters.longitude;

      // Filter by distance using Haversine formula
      qb.andWhere('property.latitude IS NOT NULL')
        .andWhere('property.longitude IS NOT NULL')
        .andWhere(
          `(
            6371 * acos(
              cos(radians(:lat)) * 
              cos(radians(CAST(property.latitude AS DECIMAL))) * 
              cos(radians(CAST(property.longitude AS DECIMAL)) - radians(:lon)) + 
              sin(radians(:lat)) * 
              sin(radians(CAST(property.latitude AS DECIMAL)))
            )
          ) <= :radius`,
          { lat, lon, radius: radiusInKm },
        );
    }

    // Get total count
    const total = await qb.clone().getCount();

    // Apply sorting
    switch (sortBy) {
      case 'price':
        qb.orderBy(
          'COALESCE(property.price, property.monthlyRent, 0)',
          sortOrder,
        );
        break;
      case 'updatedAt':
        qb.addOrderBy('property.updatedAt', sortOrder);
        break;
      case 'createdAt':
      default:
        qb.addOrderBy('property.createdAt', sortOrder);
        break;
    }

    // Apply pagination
    qb.skip((page - 1) * limit).take(limit);

    const items = await qb.getMany();

    return {
      items,
      total,
    };
  }
}
