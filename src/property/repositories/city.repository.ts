import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DataSource } from 'typeorm';
import { MasterCity } from '../entities/master-city.entity';
import { PropertyStatus } from '../enum/property-status.enum';

@Injectable()
export class CityRepository {
  constructor(
    @InjectRepository(MasterCity)
    private readonly cityRepository: Repository<MasterCity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<MasterCity[]> {
    return await this.cityRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findFeatured(): Promise<MasterCity[]> {
    return await this.cityRepository.find({
      where: { isFeatured: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterCity | null> {
    return await this.cityRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MasterCity | null> {
    return await this.cityRepository.findOne({
      where: { code },
    });
  }

  async searchByName(query: string, limit: number = 10): Promise<MasterCity[]> {
    return await this.cityRepository.find({
      where: { name: ILike(`%${query}%`) },
      order: { name: 'ASC' },
      take: limit,
    });
  }

  async createCity(cityData: Partial<MasterCity>): Promise<MasterCity> {
    const city = this.cityRepository.create(cityData);
    return await this.cityRepository.save(city);
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: MasterCity[]; total: number }> {
    const { page, limit, search } = options;
    const qb = this.cityRepository
      .createQueryBuilder('city')
      .orderBy('city.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('city.name ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async updateCity(
    id: string,
    updateData: Partial<MasterCity>,
  ): Promise<void> {
    await this.cityRepository.update(id, updateData);
  }

  async deleteCity(id: string): Promise<void> {
    await this.cityRepository.softDelete(id);
  }

  async findDistinctStates(): Promise<string[]> {
    const results = await this.cityRepository
      .createQueryBuilder('city')
      .select('DISTINCT city.state', 'state')
      .where('city.state IS NOT NULL')
      .andWhere('city.deleted_at IS NULL')
      .orderBy('city.state', 'ASC')
      .getRawMany();
    return results.map((r) => r.state).filter(Boolean);
  }

  async findByState(state: string): Promise<MasterCity[]> {
    return await this.cityRepository.find({
      where: { state },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get top cities by active property count
   * Returns top cities with at least 1 active property, ordered by property count descending
   */
  async findTopCitiesByPropertyCount(limit: number = 5): Promise<Array<MasterCity & { propertyCount: number }>> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('city.id', 'id')
      .addSelect('city.name', 'name')
      .addSelect('city.code', 'code')
      .addSelect('city.state', 'state')
      .addSelect('city.latitude', 'latitude')
      .addSelect('city.longitude', 'longitude')
      .addSelect('city.is_featured', 'isFeatured')
      .addSelect('city.icon', 'icon')
      .addSelect('city.imageUrl', 'imageUrl')
      .addSelect('city.created_at', 'createdAt')
      .addSelect('city.updated_at', 'updatedAt')
      .addSelect('city.deleted_at', 'deletedAt')
      .addSelect('COUNT(property.id)', 'propertyCount')
      .from('master_cities', 'city')
      .leftJoin('properties', 'property', 'property.cityId = city.id AND property.status = :status AND property.isDeleted = false', { status: PropertyStatus.ACTIVE })
      .where('city.deleted_at IS NULL')
      .groupBy('city.id')
      .having('COUNT(property.id) > 0')
      .orderBy('COUNT(property.id)', 'DESC')
      .limit(limit)
      .getRawMany();

    // Map raw results to entity-like objects with propertyCount (handle lowercase keys from raw query)
    return result.map((row: any) => {
      const icon = row.icon ?? row.Icon;
      const imageUrl = row.imageUrl ?? row.imageurl ?? row.ImageUrl;
      const city = this.cityRepository.create({
        id: row.id,
        name: row.name,
        code: row.code,
        state: row.state,
        latitude: row.latitude,
        longitude: row.longitude,
        isFeatured: row.isFeatured,
        icon,
        imageUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        deletedAt: row.deletedAt,
      });
      return {
        ...city,
        propertyCount: parseInt(row.propertyCount, 10),
      };
    });
  }
}
