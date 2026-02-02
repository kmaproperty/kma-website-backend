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
  ): Promise<{ items: FavoriteProperty[]; total: number }> {
    const [items, total] = await this.favoritePropertyRepository.findAndCount({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: ['property', 'property.listingType', 'property.category', 'property.propertyType', 'property.city', 'property.society', 'property.locality', 'property.bhkType', 'property.builtUpAreaMetadata', 'property.user'],
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

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

