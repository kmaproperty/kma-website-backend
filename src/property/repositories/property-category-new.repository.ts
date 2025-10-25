import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterPropertyCategoryNew } from '../entities/master-property-category-new.entity';

@Injectable()
export class PropertyCategoryNewRepository {
  constructor(
    @InjectRepository(MasterPropertyCategoryNew)
    private readonly propertyCategoryRepository: Repository<MasterPropertyCategoryNew>,
  ) {}

  async findAll(): Promise<MasterPropertyCategoryNew[]> {
    return await this.propertyCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterPropertyCategoryNew | null> {
    return await this.propertyCategoryRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MasterPropertyCategoryNew | null> {
    return await this.propertyCategoryRepository.findOne({
      where: { code },
    });
  }

  async create(
    categoryData: Partial<MasterPropertyCategoryNew>,
  ): Promise<MasterPropertyCategoryNew> {
    const category = this.propertyCategoryRepository.create(categoryData);
    return await this.propertyCategoryRepository.save(category);
  }

  async update(
    id: string,
    updateData: Partial<MasterPropertyCategoryNew>,
  ): Promise<MasterPropertyCategoryNew | null> {
    await this.propertyCategoryRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.propertyCategoryRepository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}
