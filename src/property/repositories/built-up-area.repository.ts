import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In, DeleteResult } from 'typeorm';
import { MasterBuiltUpArea } from '../entities/master-built-up-area.entity';

@Injectable()
export class BuiltUpAreaRepository extends Repository<MasterBuiltUpArea> {
  constructor(private dataSource: DataSource) {
    super(MasterBuiltUpArea, dataSource.createEntityManager());
  }

  async findAll(): Promise<MasterBuiltUpArea[]> {
    return this.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findByBhkTypeId(bhkTypeId: string): Promise<MasterBuiltUpArea[]> {
    return this.find({
      where: { bhkTypeId },
      order: {
        superBuiltUpArea: 'ASC',
      },
    });
  }

  async findByBhkTypeIds(bhkTypeIds: string[]): Promise<MasterBuiltUpArea[]> {
    if (bhkTypeIds.length === 0) {
      return [];
    }
    return this.find({
      where: { bhkTypeId: In(bhkTypeIds) },
      order: {
        superBuiltUpArea: 'ASC',
      },
    });
  }

  async findBySocietyId(societyId: string): Promise<MasterBuiltUpArea[]> {
    return this.find({
      where: { societyId },
      order: {
        superBuiltUpArea: 'ASC',
      },
    });
  }

  async findBySocietyIds(societyIds: string[]): Promise<MasterBuiltUpArea[]> {
    if (societyIds.length === 0) {
      return [];
    }
    return this.find({
      where: { societyId: In(societyIds) },
      order: {
        superBuiltUpArea: 'ASC',
      },
    });
  }

  async deleteAll(): Promise<DeleteResult> {
    return await this.delete({});
  }

  async bulkCreate(builtUpAreas: Partial<MasterBuiltUpArea>[]): Promise<MasterBuiltUpArea[]> {
    const entities = this.create(builtUpAreas);
    return this.save(entities);
  }
}
