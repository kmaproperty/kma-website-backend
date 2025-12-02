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

  async findByPropertyTypeIds(
    propertyTypeIds: string[],
  ): Promise<MasterBhkType[]> {
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

  async createBhkType(
    bhkTypeData: Partial<MasterBhkType>,
  ): Promise<MasterBhkType> {
    const bhkType = this.bhkTypeRepository.create(bhkTypeData);
    return await this.bhkTypeRepository.save(bhkType);
  }

  async findBySocietyIdAndPropertyTypeId(
    societyId: string,
    propertyTypeId: string,
  ): Promise<MasterBhkType[]> {
    return await this.bhkTypeRepository.find({
      where: { societyId, propertyTypeId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByLocalityId(localityId: string): Promise<MasterBhkType[]> {
    return await this.bhkTypeRepository.find({
      where: { localityId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByLocalityIdAndPropertyTypeId(
    localityId: string,
    propertyTypeId: string,
  ): Promise<MasterBhkType[]> {
    return await this.bhkTypeRepository.find({
      where: { localityId, propertyTypeId },
      order: { sortOrder: 'ASC' },
    });
  }

  async updateBhkType(
    id: string,
    updateData: Partial<MasterBhkType>,
  ): Promise<void> {
    await this.bhkTypeRepository.update(id, updateData);
  }

  async deleteBhkType(id: string): Promise<void> {
    await this.bhkTypeRepository.softDelete(id);
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    search?: string;
    propertyTypeId?: string;
    societyId?: string;
    localityId?: string;
  }): Promise<{ items: MasterBhkType[]; total: number }> {
    const { page, limit, search, propertyTypeId, societyId, localityId } = options;
    const qb = this.bhkTypeRepository
      .createQueryBuilder('bhk')
      .leftJoinAndSelect('bhk.propertyType', 'propertyType')
      .leftJoinAndSelect('bhk.society', 'society')
      .leftJoinAndSelect('bhk.locality', 'locality')
      .orderBy('bhk.sortOrder', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (propertyTypeId) {
      qb.andWhere('bhk.propertyTypeId = :propertyTypeId', { propertyTypeId });
    }

    if (societyId) {
      qb.andWhere('bhk.societyId = :societyId', { societyId });
    }

    if (localityId) {
      qb.andWhere('bhk.localityId = :localityId', { localityId });
    }

    if (search) {
      qb.andWhere('bhk.name ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}
