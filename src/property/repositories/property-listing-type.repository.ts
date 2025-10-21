import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterPropertyListingType } from '../entities/master-property-listing-type.entity';

@Injectable()
export class PropertyListingTypeRepository {
  constructor(
    @InjectRepository(MasterPropertyListingType)
    private readonly propertyListingTypeRepository: Repository<MasterPropertyListingType>,
  ) {}

  async findAll(): Promise<MasterPropertyListingType[]> {
    return await this.propertyListingTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterPropertyListingType | null> {
    return await this.propertyListingTypeRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MasterPropertyListingType | null> {
    return await this.propertyListingTypeRepository.findOne({
      where: { code },
    });
  }

  async create(propertyListingTypeData: Partial<MasterPropertyListingType>): Promise<MasterPropertyListingType> {
    const propertyListingType = this.propertyListingTypeRepository.create(propertyListingTypeData);
    return await this.propertyListingTypeRepository.save(propertyListingType);
  }

  async update(id: string, updateData: Partial<MasterPropertyListingType>): Promise<MasterPropertyListingType | null> {
    await this.propertyListingTypeRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.propertyListingTypeRepository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}