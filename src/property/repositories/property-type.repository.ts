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
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterPropertyType | null> {
    return await this.propertyTypeRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MasterPropertyType | null> {
    return await this.propertyTypeRepository.findOne({
      where: { code },
    });
  }

  async findByListingTypeAndCategory(
    listingTypeId: string,
    categoryId: string,
  ): Promise<MasterPropertyType[]> {
    return await this.propertyTypeRepository.find({
      where: { listingTypeId, categoryId },
      order: { name: 'ASC' },
    });
  }
}
