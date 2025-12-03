import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterAmenity } from '../entities/master-amenity.entity';

@Injectable()
export class AmenityRepository {
  constructor(
    @InjectRepository(MasterAmenity)
    private readonly amenityRepository: Repository<MasterAmenity>,
  ) {}

  async findAll(): Promise<MasterAmenity[]> {
    return await this.amenityRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterAmenity | null> {
    return await this.amenityRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MasterAmenity | null> {
    return await this.amenityRepository.findOne({
      where: { code },
    });
  }

  async createAmenity(
    amenityData: Partial<MasterAmenity>,
  ): Promise<MasterAmenity> {
    const amenity = this.amenityRepository.create(amenityData);
    return await this.amenityRepository.save(amenity);
  }

  async updateAmenity(
    id: string,
    updateData: Partial<MasterAmenity>,
  ): Promise<void> {
    await this.amenityRepository.update(id, updateData);
  }

  async deleteAmenity(id: string): Promise<void> {
    await this.amenityRepository.softDelete(id);
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: MasterAmenity[]; total: number }> {
    const { page, limit, search } = options;
    const qb = this.amenityRepository
      .createQueryBuilder('amenity')
      .orderBy('amenity.sortOrder', 'ASC')
      .addOrderBy('amenity.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('amenity.name ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}

