import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminConfiguration } from '../entities/admin-configuration.entity';

@Injectable()
export class AdminConfigurationRepository {
  constructor(
    @InjectRepository(AdminConfiguration)
    private readonly repository: Repository<AdminConfiguration>,
  ) {}

  async findOne(): Promise<AdminConfiguration | null> {
    const results = await this.repository.find({
      take: 1,
      order: { createdAt: 'DESC' },
    });
    return results.length > 0 ? results[0] : null;
  }

  async findById(id: string): Promise<AdminConfiguration | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async create(data: Partial<AdminConfiguration>): Promise<AdminConfiguration> {
    const config = this.repository.create(data);
    return await this.repository.save(config);
  }

  async update(id: string, data: Partial<AdminConfiguration>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}

