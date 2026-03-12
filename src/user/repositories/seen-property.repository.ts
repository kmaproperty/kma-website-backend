import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SeenProperty } from '../entities/seen-property.entity';

@Injectable()
export class SeenPropertyRepository {
  constructor(
    @InjectRepository(SeenProperty)
    private readonly repository: Repository<SeenProperty>,
  ) {}

  async create(data: Partial<SeenProperty>): Promise<SeenProperty> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  /**
   * Find by session and property (for anonymous users)
   */
  async findBySessionAndProperty(
    sessionId: string,
    propertyId: string,
  ): Promise<SeenProperty | null> {
    return await this.repository.findOne({
      where: {
        sessionId,
        propertyId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Find by user and property (for logged-in users)
   */
  async findByUserAndProperty(
    userId: string,
    propertyId: string,
  ): Promise<SeenProperty | null> {
    return await this.repository.findOne({
      where: {
        userId,
        propertyId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Upsert for anonymous user (by sessionId)
   */
  async upsertForSession(
    sessionId: string,
    propertyId: string,
  ): Promise<SeenProperty> {
    const existing = await this.findBySessionAndProperty(sessionId, propertyId);
    if (existing) {
      return existing;
    }
    return await this.create({ sessionId, propertyId, userId: null });
  }

  /**
   * Upsert for logged-in user (by userId)
   */
  async upsertForUser(
    userId: string,
    propertyId: string,
  ): Promise<SeenProperty> {
    const existing = await this.findByUserAndProperty(userId, propertyId);
    if (existing) {
      return existing;
    }
    return await this.create({ userId, propertyId, sessionId: null });
  }

  /**
   * Get count of unique properties viewed by session (for anonymous view limit)
   */
  async getUniquePropertyCountBySession(sessionId: string): Promise<number> {
    return await this.repository.count({
      where: {
        sessionId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Get count of unique properties viewed by user (for logged-in users)
   */
  async getUniquePropertyCountByUser(userId: string): Promise<number> {
    return await this.repository.count({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Attach userId to all records with given sessionId (called on login/register)
   */
  async attachUserToSession(sessionId: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(SeenProperty)
      .set({ userId })
      .where('session_id = :sessionId', { sessionId })
      .andWhere('deleted_at IS NULL')
      .execute();
  }

  /**
   * Get all property IDs seen by a session
   */
  async getPropertyIdsBySession(sessionId: string): Promise<string[]> {
    const records = await this.repository.find({
      where: {
        sessionId,
        deletedAt: IsNull(),
      },
      select: ['propertyId'],
    });
    return records.map((r) => r.propertyId);
  }

  /**
   * Get recently viewed properties with full property data (for logged-in users)
   */
  async findByUserWithProperties(
    userId: string,
    page: number = 1,
    limit: number = 20,
    listingTypeCode?: string,
    sort?: string,
  ): Promise<{ items: SeenProperty[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.property', 'property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .leftJoinAndSelect('property.user', 'owner')
      .where('sp.userId = :userId', { userId })
      .andWhere('sp.deleted_at IS NULL');

    if (listingTypeCode) {
      qb.andWhere('listingType.code = :listingTypeCode', { listingTypeCode });
    }

    if (sort === 'oldest') {
      qb.orderBy('sp.createdAt', 'ASC');
    } else if (sort === 'price_high') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'DESC');
    } else if (sort === 'price_low') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'ASC');
    } else {
      qb.orderBy('sp.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  /**
   * Get recently viewed properties with full property data (for anonymous users)
   */
  async findBySessionWithProperties(
    sessionId: string,
    page: number = 1,
    limit: number = 20,
    listingTypeCode?: string,
    sort?: string,
  ): Promise<{ items: SeenProperty[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.property', 'property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .leftJoinAndSelect('property.user', 'owner')
      .where('sp.sessionId = :sessionId', { sessionId })
      .andWhere('sp.deleted_at IS NULL');

    if (listingTypeCode) {
      qb.andWhere('listingType.code = :listingTypeCode', { listingTypeCode });
    }

    if (sort === 'oldest') {
      qb.orderBy('sp.createdAt', 'ASC');
    } else if (sort === 'price_high') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'DESC');
    } else if (sort === 'price_low') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'ASC');
    } else {
      qb.orderBy('sp.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }
}
