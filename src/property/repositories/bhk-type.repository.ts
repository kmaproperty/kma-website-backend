import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MasterBhkType } from '../entities/master-bhk-type.entity';

@Injectable()
export class BhkTypeRepository {
  constructor(
    @InjectRepository(MasterBhkType)
    private readonly bhkTypeRepository: Repository<MasterBhkType>,
  ) {}

  async findAll(): Promise<MasterBhkType[]> {
    return await this.bhkTypeRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterBhkType | null> {
    return await this.bhkTypeRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MasterBhkType | null> {
    return await this.bhkTypeRepository.findOne({
      where: { code },
    });
  }

  async findByPropertyTypeId(propertyTypeId: string): Promise<MasterBhkType[]> {
    return await this.bhkTypeRepository.find({
      where: { propertyTypeId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByPropertyTypeIds(propertyTypeIds: string[]): Promise<MasterBhkType[]> {
    return await this.bhkTypeRepository.find({
      where: { propertyTypeId: In(propertyTypeIds) },
      order: { sortOrder: 'ASC' },
    });
  }

  async findBySocietyId(societyId: string): Promise<MasterBhkType[]> {
    return await this.bhkTypeRepository.find({
      where: { societyId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findBySocietyIds(societyIds: string[]): Promise<MasterBhkType[]> {
    if (societyIds.length === 0) {
      return [];
    }
    return await this.bhkTypeRepository.find({
      where: { societyId: In(societyIds) },
      order: { sortOrder: 'ASC' },
    });
  }

  async createBhkType(bhkTypeData: Partial<MasterBhkType>): Promise<MasterBhkType> {
    const bhkType = this.bhkTypeRepository.create(bhkTypeData);
    return await this.bhkTypeRepository.save(bhkType);
  }
}
