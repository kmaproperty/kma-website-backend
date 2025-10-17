import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterPropertyType } from '../entities/master-property-type.entity';

@Injectable()
export class PropertyTypeRepository {
  constructor(
    @InjectRepository(MasterPropertyType)
    private readonly propertyTypeRepository: Repository<MasterPropertyType>,
  ) {}

  async findAll(): Promise<MasterPropertyType[]> {
    return await this.propertyTypeRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterPropertyType | null> {
    return await this.propertyTypeRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async findByCode(code: string): Promise<MasterPropertyType | null> {
    return await this.propertyTypeRepository.findOne({
      where: { code, isActive: true },
    });
  }

  async create(propertyTypeData: Partial<MasterPropertyType>): Promise<MasterPropertyType> {
    const propertyType = this.propertyTypeRepository.create(propertyTypeData);
    return await this.propertyTypeRepository.save(propertyType);
  }

  async update(id: string, updateData: Partial<MasterPropertyType>): Promise<MasterPropertyType | null> {
    await this.propertyTypeRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.propertyTypeRepository.update(id, { isActive: false });
    return (result.affected ?? 0) > 0;
  }
}