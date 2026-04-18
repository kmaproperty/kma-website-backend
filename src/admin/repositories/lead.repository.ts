import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Lead, LeadBuildingType, LeadStatus } from '../entities/lead.entity';
import { AdminLeadListQueryDto } from '../dto/admin-lead.dto';

@Injectable()
export class LeadRepository {
  constructor(
    @InjectRepository(Lead)
    private readonly repository: Repository<Lead>,
  ) {}

  async create(data: Partial<Lead>): Promise<Lead> {
    const lead = this.repository.create(data);
    return this.repository.save(lead);
  }

  async findById(id: string, relations?: string[]): Promise<Lead | null> {
    return this.repository.findOne({
      where: { id },
      relations: relations || ['notes', 'propertyContacts', 'propertyContacts.property'],
    });
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    return this.repository.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<Lead>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByUserProperties(
    userId: string,
    propertyIds: string[],
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      propertyId?: string;
      status?: LeadStatus;
      timeFilter?: string;
      budgetMin?: number;
      budgetMax?: number;
      sizeMin?: number;
      sizeMax?: number;
      buildingType?: LeadBuildingType;
      locality?: string;
    },
  ): Promise<{ leads: Lead[]; total: number; tabCounts: { all: number; new: number; this_month: number; last_month: number } }> {
    const { page = 1, limit = 20, search, propertyId, status, timeFilter, budgetMin, budgetMax, sizeMin, sizeMax, buildingType, locality } = filters;

    if (propertyIds.length === 0) {
      return { leads: [], total: 0, tabCounts: { all: 0, new: 0, this_month: 0, last_month: 0 } };
    }

    const queryBuilder = this.repository
      .createQueryBuilder('lead')
      .innerJoin('lead.propertyContacts', 'propertyContacts')
      .innerJoin('propertyContacts.property', 'property')
      .where('property.userId = :userId', { userId })
      .andWhere('property.id IN (:...propertyIds)', {
        propertyIds,
      })
      .leftJoinAndSelect(
        'lead.propertyContacts',
        'pc',
        'pc.propertyId IN (:...propertyIds)',
        { propertyIds },
      )
      .leftJoinAndSelect('pc.property', 'prop')
      .leftJoinAndSelect('prop.user', 'propertyOwner')
      .distinct(true);

    // Filter by specific property if provided
    if (propertyId) {
      queryBuilder.andWhere('propertyContacts.propertyId = :propertyId', {
        propertyId,
      });
    }

    // Search by name
    if (search) {
      queryBuilder.andWhere('lead.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    // Time filter for tabs
    if (timeFilter) {
      const now = new Date();
      if (timeFilter === 'new') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        queryBuilder.andWhere('lead.createdAt >= :yesterday', { yesterday });
      } else if (timeFilter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        queryBuilder.andWhere('lead.createdAt >= :startOfMonth', { startOfMonth });
      } else if (timeFilter === 'last_month') {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        queryBuilder.andWhere('lead.createdAt >= :startOfLastMonth', { startOfLastMonth });
        queryBuilder.andWhere('lead.createdAt <= :endOfLastMonth', { endOfLastMonth });
      }
    }

    // Budget filters
    if (budgetMin !== undefined) {
      queryBuilder.andWhere(
        '(lead.budgetMax IS NULL OR lead.budgetMax >= :budgetMin)',
        { budgetMin },
      );
    }
    if (budgetMax !== undefined) {
      queryBuilder.andWhere(
        '(lead.budgetMin IS NULL OR lead.budgetMin <= :budgetMax)',
        { budgetMax },
      );
    }

    // Size filters
    if (sizeMin !== undefined) {
      queryBuilder.andWhere(
        '(lead.sizeMax IS NULL OR lead.sizeMax >= :sizeMin)',
        { sizeMin },
      );
    }
    if (sizeMax !== undefined) {
      queryBuilder.andWhere(
        '(lead.sizeMin IS NULL OR lead.sizeMin <= :sizeMax)',
        { sizeMax },
      );
    }

    // Building type filter
    if (buildingType) {
      queryBuilder.andWhere('lead.buildingType = :buildingType', { buildingType });
    }

    // Locality filter (search within locations array)
    if (locality) {
      queryBuilder.andWhere(
        "EXISTS (SELECT 1 FROM unnest(lead.locations) loc WHERE loc ILIKE :locality)",
        { locality: `%${locality}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by last contacted date or created date (newest first)
    queryBuilder.orderBy('lead.lastContactedAt', 'DESC', 'NULLS LAST');
    queryBuilder.addOrderBy('lead.createdAt', 'DESC');

    const leads = await queryBuilder.getMany();

    // Calculate tab counts for the user's leads
    const baseQuery = this.repository
      .createQueryBuilder('lead')
      .innerJoin('lead.propertyContacts', 'pc2')
      .innerJoin('pc2.property', 'p2')
      .where('p2.userId = :userId', { userId })
      .andWhere('p2.id IN (:...propertyIds)', { propertyIds });

    const allCount = await baseQuery.getCount();

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const newCount = await baseQuery
      .clone()
      .andWhere('lead.createdAt >= :yesterday', { yesterday })
      .getCount();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = await baseQuery
      .clone()
      .andWhere('lead.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthCount = await baseQuery
      .clone()
      .andWhere('lead.createdAt >= :startOfLastMonth', { startOfLastMonth })
      .andWhere('lead.createdAt <= :endOfLastMonth', { endOfLastMonth })
      .getCount();

    const tabCounts = {
      all: allCount,
      new: newCount,
      this_month: thisMonthCount,
      last_month: lastMonthCount,
    };

    return { leads, total, tabCounts };
  }

  async findWithFilters(
    query: AdminLeadListQueryDto,
  ): Promise<{ leads: Lead[]; total: number; statusCounts: Record<string, number> }> {
    const {
      page = 1,
      limit = 20,
      search,
      budgetMin,
      budgetMax,
      sizeMin,
      sizeMax,
      buildingType,
      propertyTypes,
      status,
      timeFilter,
    } = query;

    const queryBuilder = this.repository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.notes', 'notes')
      .leftJoinAndSelect('lead.propertyContacts', 'propertyContacts')
      .leftJoinAndSelect('propertyContacts.property', 'property');

    // Search by name
    if (search) {
      queryBuilder.andWhere('lead.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Budget filters
    if (budgetMin !== undefined) {
      queryBuilder.andWhere(
        '(lead.budgetMax IS NULL OR lead.budgetMax >= :budgetMin)',
        { budgetMin },
      );
    }
    if (budgetMax !== undefined) {
      queryBuilder.andWhere(
        '(lead.budgetMin IS NULL OR lead.budgetMin <= :budgetMax)',
        { budgetMax },
      );
    }

    // Size filters
    if (sizeMin !== undefined) {
      queryBuilder.andWhere(
        '(lead.sizeMax IS NULL OR lead.sizeMax >= :sizeMin)',
        { sizeMin },
      );
    }
    if (sizeMax !== undefined) {
      queryBuilder.andWhere(
        '(lead.sizeMin IS NULL OR lead.sizeMin <= :sizeMax)',
        { sizeMax },
      );
    }

    // Building type filter
    if (buildingType) {
      queryBuilder.andWhere('lead.buildingType = :buildingType', {
        buildingType,
      });
    }

    // Property types filter
    if (propertyTypes && propertyTypes.length > 0) {
      queryBuilder.andWhere(
        'lead.propertyTypes && :propertyTypes',
        { propertyTypes },
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    // Time filter
    if (timeFilter) {
      const now = new Date();
      if (timeFilter === 'new') {
        // Leads created in the last 24 hours
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        queryBuilder.andWhere('lead.createdAt >= :yesterday', { yesterday });
      } else if (timeFilter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        queryBuilder.andWhere('lead.createdAt >= :startOfMonth', {
          startOfMonth,
        });
      } else if (timeFilter === 'last_month') {
        const startOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const endOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
        );
        queryBuilder.andWhere('lead.createdAt >= :startOfLastMonth', {
          startOfLastMonth,
        });
        queryBuilder.andWhere('lead.createdAt <= :endOfLastMonth', {
          endOfLastMonth,
        });
      }
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by created date (newest first)
    queryBuilder.orderBy('lead.createdAt', 'DESC');

    const leads = await queryBuilder.getMany();

    // Get status counts
    const statusCounts = await this.getStatusCounts(query);

    return { leads, total, statusCounts };
  }

  private async getStatusCounts(
    query: AdminLeadListQueryDto,
  ): Promise<Record<string, number>> {
    const queryBuilder = this.repository.createQueryBuilder('lead');

    // Apply same filters as main query (except status)
    const {
      search,
      budgetMin,
      budgetMax,
      sizeMin,
      sizeMax,
      buildingType,
      propertyTypes,
      timeFilter,
    } = query;

    if (search) {
      queryBuilder.andWhere('lead.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (budgetMin !== undefined) {
      queryBuilder.andWhere(
        '(lead.budgetMax IS NULL OR lead.budgetMax >= :budgetMin)',
        { budgetMin },
      );
    }
    if (budgetMax !== undefined) {
      queryBuilder.andWhere(
        '(lead.budgetMin IS NULL OR lead.budgetMin <= :budgetMax)',
        { budgetMax },
      );
    }

    if (sizeMin !== undefined) {
      queryBuilder.andWhere(
        '(lead.sizeMax IS NULL OR lead.sizeMax >= :sizeMin)',
        { sizeMin },
      );
    }
    if (sizeMax !== undefined) {
      queryBuilder.andWhere(
        '(lead.sizeMin IS NULL OR lead.sizeMin <= :sizeMax)',
        { sizeMax },
      );
    }

    if (buildingType) {
      queryBuilder.andWhere('lead.buildingType = :buildingType', {
        buildingType,
      });
    }

    if (propertyTypes && propertyTypes.length > 0) {
      queryBuilder.andWhere(
        'lead.propertyTypes && :propertyTypes',
        { propertyTypes },
      );
    }

    if (timeFilter) {
      const now = new Date();
      if (timeFilter === 'new') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        queryBuilder.andWhere('lead.createdAt >= :yesterday', { yesterday });
      } else if (timeFilter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        queryBuilder.andWhere('lead.createdAt >= :startOfMonth', {
          startOfMonth,
        });
      } else if (timeFilter === 'last_month') {
        const startOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const endOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
        );
        queryBuilder.andWhere('lead.createdAt >= :startOfLastMonth', {
          startOfLastMonth,
        });
        queryBuilder.andWhere('lead.createdAt <= :endOfLastMonth', {
          endOfLastMonth,
        });
      }
    }

    const results = await queryBuilder
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    const statusCounts: Record<string, number> = {};
    results.forEach((result) => {
      statusCounts[result.status] = parseInt(result.count, 10);
    });

    // Ensure all statuses are present with 0 count
    Object.values(LeadStatus).forEach((status) => {
      if (!statusCounts[status]) {
        statusCounts[status] = 0;
      }
    });

    return statusCounts;
  }
}

