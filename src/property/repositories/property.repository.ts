import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';

@Injectable()
export class PropertyRepository {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async findAll(): Promise<Property[]> {
    return await this.propertyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Property | null> {
    return await this.propertyRepository.findOne({
      where: { id },
    });
  }

  async findByIdWithRelations(id: string): Promise<Property | null> {
    return await this.propertyRepository.findOne({
      where: { id },
      relations: [
        'listingType',
        'category',
        'city',
        'society',
        'propertyType',
        'bhkType',
        'builtUpAreaMetadata',
        'user',
      ],
    });
  }

  async findByUserId(userId: string): Promise<Property[]> {
    return await this.propertyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.propertyRepository.count({
      where: { userId },
    });
  }

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const property = this.propertyRepository.create(propertyData);
    return await this.propertyRepository.save(property);
  }

  async findWithPagination(options: {
    offset: number;
    limit: number;
    status?: string;
  }): Promise<{ items: Property[]; total: number }> {
    const { offset, limit, status } = options;

    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.user', 'user')
      .leftJoinAndSelect('property.listingType', 'listingType')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.society', 'society')
      .leftJoinAndSelect('property.locality', 'locality')
      .leftJoinAndSelect('property.bhkType', 'bhkType')
      .orderBy('property.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) {
      qb.andWhere('property.status = :status', { status });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findByIdWithUser(id: string): Promise<Property | null> {
    return this.propertyRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async updateProperty(
    id: string,
    updateData: Partial<Property>,
  ): Promise<void> {
    await this.propertyRepository.update(id, updateData);
  }

  async deleteProperty(id: string): Promise<void> {
    await this.propertyRepository.delete(id);
  }
}
