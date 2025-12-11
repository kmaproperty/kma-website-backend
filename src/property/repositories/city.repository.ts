import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MasterCity } from '../entities/master-city.entity';

@Injectable()
export class CityRepository {
  constructor(
    @InjectRepository(MasterCity)
    private readonly cityRepository: Repository<MasterCity>,
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
}
