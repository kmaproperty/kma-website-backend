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

  async findByUserId(userId: string): Promise<Property[]> {
    return await this.propertyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const property = this.propertyRepository.create(propertyData);
    return await this.propertyRepository.save(property);
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
