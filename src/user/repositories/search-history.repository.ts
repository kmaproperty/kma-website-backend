import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SearchHistory } from '../entities/search-history.entity';

@Injectable()
export class SearchHistoryRepository {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly repository: Repository<SearchHistory>,
  ) {}

  async create(data: Partial<SearchHistory>): Promise<SearchHistory> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  /**
   * Record a search for anonymous user (by sessionId)
   */
  async recordForSession(
    sessionId: string,
    searchQuery: string,
    location?: string,
    city?: string,
    priceRange?: string,
    filters?: Record<string, any>,
  ): Promise<SearchHistory> {
    return await this.create({
      sessionId,
      userId: null,
      searchQuery,
      location: location || null,
      city: city || null,
      priceRange: priceRange || null,
      filters: filters || null,
    });
  }

  /**
   * Record a search for logged-in user (by userId)
   */
  async recordForUser(
    userId: string,
    searchQuery: string,
    location?: string,
    city?: string,
    priceRange?: string,
    filters?: Record<string, any>,
  ): Promise<SearchHistory> {
    return await this.create({
      userId,
      sessionId: null,
      searchQuery,
      location: location || null,
      city: city || null,
      priceRange: priceRange || null,
      filters: filters || null,
    });
  }

  /**
   * Count recent searches for a session (for anonymous users)
   */
  async countBySession(sessionId: string): Promise<number> {
    return await this.repository.count({
      where: {
        sessionId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Count recent searches for a user (for logged-in users)
   */
  async countByUser(userId: string): Promise<number> {
    return await this.repository.count({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Get recent searches for a session (for anonymous users)
   */
  async findBySession(
    sessionId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'recent',
    listingType?: string,
  ): Promise<{ data: SearchHistory[]; total: number }> {
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('sh')
      .where('sh.session_id = :sessionId', { sessionId })
      .andWhere('sh.deleted_at IS NULL');

    if (listingType) {
      qb.andWhere("sh.filters->>'listingType' = :listingType", { listingType });
    }

    if (sortBy === 'relevance') {
      qb.orderBy('sh.search_query', 'ASC');
    } else {
      qb.orderBy('sh.created_at', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Get recent searches for a user (for logged-in users)
   */
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'recent',
    listingType?: string,
  ): Promise<{ data: SearchHistory[]; total: number }> {
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('sh')
      .where('sh.user_id = :userId', { userId })
      .andWhere('sh.deleted_at IS NULL');

    if (listingType) {
      qb.andWhere("sh.filters->>'listingType' = :listingType", { listingType });
    }

    if (sortBy === 'relevance') {
      qb.orderBy('sh.search_query', 'ASC');
    } else {
      qb.orderBy('sh.created_at', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Attach userId to all records with given sessionId (called on login/register)
   */
  async attachUserToSession(sessionId: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(SearchHistory)
      .set({ userId })
      .where('session_id = :sessionId', { sessionId })
      .andWhere('deleted_at IS NULL')
      .execute();
  }

  /**
   * Delete a search history record
   */
  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  /**
   * Clear all search history for a user
   */
  async clearForUser(userId: string): Promise<void> {
    await this.repository.softDelete({ userId });
  }

  /**
   * Clear all search history for a session
   */
  async clearForSession(sessionId: string): Promise<void> {
    await this.repository.softDelete({ sessionId });
  }
}
