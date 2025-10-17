import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { MasterPropertyType } from './entities/master-property-type.entity';
import { MasterPropertyCategoryNew } from './entities/master-property-category-new.entity';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyTypeRepository: PropertyTypeRepository,
    private readonly propertyCategoryRepository: PropertyCategoryNewRepository,
  ) {}

  async getPropertyTypes(): Promise<MasterPropertyType[]> {
    return await this.propertyTypeRepository.findAll();
  }

  async getPropertyCategories(): Promise<MasterPropertyCategoryNew[]> {
    return await this.propertyCategoryRepository.findAll();
  }

  async getPropertyTypeById(id: string): Promise<MasterPropertyType> {
    const propertyType = await this.propertyTypeRepository.findById(id);
    if (!propertyType) {
      throw new NotFoundException('Property type not found');
    }
    return propertyType;
  }

  async getPropertyCategoryById(id: string): Promise<MasterPropertyCategoryNew> {
    const category = await this.propertyCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Property category not found');
    }
    return category;
  }
}