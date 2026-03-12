import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ContactedProperty } from '../entities/contacted-property.entity';

@Injectable()
export class ContactedPropertyRepository {
  constructor(
    @InjectRepository(ContactedProperty)
    private readonly repository: Repository<ContactedProperty>,
  ) {}

  async create(data: Partial<ContactedProperty>): Promise<ContactedProperty> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async countBySession(sessionId: string): Promise<number> {
    return await this.repository.count({
      where: { sessionId, deletedAt: IsNull() },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.repository.count({
      where: { userId, deletedAt: IsNull() },
    });
  }

  async attachUserToSession(sessionId: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(ContactedProperty)
      .set({ userId })
      .where('session_id = :sessionId', { sessionId })
      .andWhere('deleted_at IS NULL')
      .execute();
  }

  async findByUserWithProperties(
    userId: string,
    page: number = 1,
    limit: number = 20,
    listingTypeCode?: string,
    sort?: string,
  ): Promise<{ items: ContactedProperty[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.property', 'property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .leftJoinAndSelect('property.user', 'owner')
      .where('cp.userId = :userId', { userId })
      .andWhere('cp.deleted_at IS NULL');

    if (listingTypeCode) {
      qb.andWhere('listingType.code = :listingTypeCode', { listingTypeCode });
    }

    if (sort === 'oldest') {
      qb.orderBy('cp.createdAt', 'ASC');
    } else if (sort === 'price_high') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'DESC');
    } else if (sort === 'price_low') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'ASC');
    } else {
      qb.orderBy('cp.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { items, total };
  }

  async findBySessionWithProperties(
    sessionId: string,
    page: number = 1,
    limit: number = 20,
    listingTypeCode?: string,
    sort?: string,
  ): Promise<{ items: ContactedProperty[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.property', 'property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .leftJoinAndSelect('property.user', 'owner')
      .where('cp.sessionId = :sessionId', { sessionId })
      .andWhere('cp.deleted_at IS NULL');

    if (listingTypeCode) {
      qb.andWhere('listingType.code = :listingTypeCode', { listingTypeCode });
    }

    if (sort === 'oldest') {
      qb.orderBy('cp.createdAt', 'ASC');
    } else if (sort === 'price_high') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'DESC');
    } else if (sort === 'price_low') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'ASC');
    } else {
      qb.orderBy('cp.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { items, total };
  }
}
