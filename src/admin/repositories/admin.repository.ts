import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(Admin)
    private readonly repository: Repository<Admin>,
  ) {}

  async findByUsername(username: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { id } });
  }

  async countAdmins(): Promise<number> {
    return this.repository.count();
  }

  async createAdmin(data: Partial<Admin>): Promise<Admin> {
    const admin = this.repository.create(data);
    return this.repository.save(admin);
  }

  async updateAdmin(
    id: string,
    data: Partial<Admin>,
  ): Promise<void> {
    await this.repository.update(id, data);
  }
}

