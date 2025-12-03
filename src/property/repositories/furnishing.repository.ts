import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterFurnishing } from '../entities/master-furnishing.entity';

@Injectable()
export class FurnishingRepository {
  constructor(
    @InjectRepository(MasterFurnishing)
    private readonly furnishingRepository: Repository<MasterFurnishing>,
  ) {}

  async findAll(): Promise<MasterFurnishing[]> {
    return await this.furnishingRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterFurnishing | null> {
    return await this.furnishingRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MasterFurnishing | null> {
    return await this.furnishingRepository.findOne({
      where: { code },
    });
  }

  async createFurnishing(
    furnishingData: Partial<MasterFurnishing>,
  ): Promise<MasterFurnishing> {
    const furnishing = this.furnishingRepository.create(furnishingData);
    return await this.furnishingRepository.save(furnishing);
  }

  async updateFurnishing(
    id: string,
    updateData: Partial<MasterFurnishing>,
  ): Promise<void> {
    await this.furnishingRepository.update(id, updateData);
  }

  async deleteFurnishing(id: string): Promise<void> {
    await this.furnishingRepository.softDelete(id);
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: MasterFurnishing[]; total: number }> {
    const { page, limit, search } = options;
    const qb = this.furnishingRepository
      .createQueryBuilder('furnishing')
      .orderBy('furnishing.sortOrder', 'ASC')
      .addOrderBy('furnishing.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('furnishing.name ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}

