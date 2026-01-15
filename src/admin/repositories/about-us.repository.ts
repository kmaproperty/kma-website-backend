import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutUs } from '../entities/about-us.entity';

@Injectable()
export class AboutUsRepository {
  constructor(
    @InjectRepository(AboutUs)
    private readonly repository: Repository<AboutUs>,
  ) {}

  async findAll(): Promise<AboutUs[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<AboutUs | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async create(data: Partial<AboutUs>): Promise<AboutUs> {
    const aboutUs = this.repository.create(data);
    return await this.repository.save(aboutUs);
  }

  async update(id: string, data: Partial<AboutUs>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}

