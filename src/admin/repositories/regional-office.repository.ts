import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionalOffice } from '../entities/regional-office.entity';

@Injectable()
export class RegionalOfficeRepository {
  constructor(
    @InjectRepository(RegionalOffice)
    private readonly repository: Repository<RegionalOffice>,
  ) {}

  async findAll(): Promise<RegionalOffice[]> {
    return await this.repository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<RegionalOffice | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<RegionalOffice>): Promise<RegionalOffice> {
    const office = this.repository.create(data);
    return await this.repository.save(office);
  }

  async update(id: string, data: Partial<RegionalOffice>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
