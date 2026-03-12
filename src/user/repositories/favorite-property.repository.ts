import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FavoriteProperty } from '../entities/favorite-property.entity';

@Injectable()
export class FavoritePropertyRepository {
  constructor(
    @InjectRepository(FavoriteProperty)
    private readonly favoritePropertyRepository: Repository<FavoriteProperty>,
  ) {}

  async create(userId: string, propertyId: string): Promise<FavoriteProperty> {
    const favorite = this.favoritePropertyRepository.create({
      userId,
      propertyId,
    });
    return await this.favoritePropertyRepository.save(favorite);
  }

  async findByUserAndProperty(
    userId: string,
    propertyId: string,
  ): Promise<FavoriteProperty | null> {
    return await this.favoritePropertyRepository.findOne({
      where: {
        userId,
        propertyId,
        deletedAt: IsNull(),
      },
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
    listingTypeCode?: string,
    sort?: string,
  ): Promise<{ items: FavoriteProperty[]; total: number }> {
    const qb = this.favoritePropertyRepository
      .createQueryBuilder('fav')
      .leftJoinAndSelect('fav.property', 'property')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .leftJoinAndSelect('property.builtUpAreaMetadata', 'builtUpAreaMetadata')
      .leftJoinAndSelect('property.user', 'owner')
      .where('fav.userId = :userId', { userId })
      .andWhere('fav.deleted_at IS NULL');

    if (listingTypeCode) {
      qb.andWhere('listingType.code = :listingTypeCode', { listingTypeCode });
    }

    if (sort === 'oldest') {
      qb.orderBy('fav.createdAt', 'ASC');
    } else if (sort === 'price_high') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'DESC');
    } else if (sort === 'price_low') {
      qb.addSelect('COALESCE("property"."price", "property"."monthlyRent")', 'sort_price');
      qb.orderBy('sort_price', 'ASC');
    } else {
      qb.orderBy('fav.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { items, total };
  }

  async delete(userId: string, propertyId: string): Promise<boolean> {
    const result = await this.favoritePropertyRepository.softDelete({
      userId,
      propertyId,
    });
    return result.affected ? result.affected > 0 : false;
  }

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const favorite = await this.findByUserAndProperty(userId, propertyId);
    return favorite !== null;
  }

  async getFavoriteCountByProperty(propertyId: string): Promise<number> {
    return await this.favoritePropertyRepository.count({
      where: {
        propertyId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Count saved/favorite properties for a user (logged-in only)
   */
  async countByUserId(userId: string): Promise<number> {
    return await this.favoritePropertyRepository.count({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });
  }
}

