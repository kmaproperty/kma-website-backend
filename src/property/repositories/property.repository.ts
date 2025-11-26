import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Property } from '../entities/property.entity';

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
    sortBy: 'createdAt' | 'price' | 'updatedAt';
    sortOrder: 'ASC' | 'DESC';
    filters?: {
      categoryIds?: string[];
      propertyTypeIds?: string[];
      listingTypeIds?: string[];
      furnishingTypes?: string[];
      projectStatuses?: string[];
      statuses?: string[];
      minPrice?: number;
      maxPrice?: number;
      search?: string;
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
}
