import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterPropertyType } from '../entities/master-property-type.entity';
import { MasterPropertyCategoryNew } from '../entities/master-property-category-new.entity';

@Injectable()
export class MasterDataSeederService {
  constructor(
    @InjectRepository(MasterPropertyType)
    private readonly propertyTypeRepository: Repository<MasterPropertyType>,
    @InjectRepository(MasterPropertyCategoryNew)
    private readonly propertyCategoryRepository: Repository<MasterPropertyCategoryNew>,
  ) {}

  async seedAll(): Promise<void> {
    await this.seedPropertyTypes();
    await this.seedPropertyCategories();
  }

  private async seedPropertyTypes(): Promise<void> {
    const propertyTypeOptions = [
      { 
        name: 'Sale', 
        code: 'sale', 
        description: 'Properties available for purchase',
        sortOrder: 1,
        color: '#28a745'
      },
      { 
        name: 'Rent', 
        code: 'rent', 
        description: 'Properties available for rent',
        sortOrder: 2,
        color: '#007bff'
      },
    ];

    for (const optionData of propertyTypeOptions) {
      const existing = await this.propertyTypeRepository.findOne({
        where: { code: optionData.code },
      });

      if (!existing) {
        const propertyType = this.propertyTypeRepository.create(optionData as any);
        await this.propertyTypeRepository.save(propertyType);
      }
    }
  }

  private async seedPropertyCategories(): Promise<void> {
    const categories = [
      { 
        name: 'Residential', 
        code: 'residential', 
        description: 'Residential properties for living',
        sortOrder: 1,
        color: '#6f42c1',
        icon: 'home'
      },
      { 
        name: 'Commercial', 
        code: 'commercial', 
        description: 'Commercial properties for business',
        sortOrder: 2,
        color: '#fd7e14',
        icon: 'business'
      },
    ];

    for (const categoryData of categories) {
      const existing = await this.propertyCategoryRepository.findOne({
        where: { code: categoryData.code },
      });

      if (!existing) {
        const category = this.propertyCategoryRepository.create(categoryData as any);
        await this.propertyCategoryRepository.save(category);
      }
    }
  }
}