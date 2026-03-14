import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinUsEnquiry } from '../entities/join-us-enquiry.entity';

@Injectable()
export class JoinUsEnquiryRepository {
  constructor(
    @InjectRepository(JoinUsEnquiry)
    private readonly repository: Repository<JoinUsEnquiry>,
  ) {}

  async create(data: Partial<JoinUsEnquiry>): Promise<JoinUsEnquiry> {
    const enquiry = this.repository.create(data);
    return await this.repository.save(enquiry);
  }

  async findAll(skip: number = 0, take: number = 10): Promise<JoinUsEnquiry[]> {
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
