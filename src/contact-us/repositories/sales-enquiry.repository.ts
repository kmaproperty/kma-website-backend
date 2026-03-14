import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesEnquiry } from '../entities/sales-enquiry.entity';

@Injectable()
export class SalesEnquiryRepository {
  constructor(
    @InjectRepository(SalesEnquiry)
    private readonly repository: Repository<SalesEnquiry>,
  ) {}

  async create(data: Partial<SalesEnquiry>): Promise<SalesEnquiry> {
    const enquiry = this.repository.create(data);
    return await this.repository.save(enquiry);
  }

  async findAll(skip: number = 0, take: number = 10): Promise<SalesEnquiry[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
