import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpCenterFaq } from '../entities/help-center-faq.entity';

@Injectable()
export class HelpCenterFaqRepository {
  constructor(
    @InjectRepository(HelpCenterFaq)
    private readonly repository: Repository<HelpCenterFaq>,
  ) {}

  async findAll(category?: string): Promise<HelpCenterFaq[]> {
    const qb = this.repository.createQueryBuilder('faq');
    if (category) {
      qb.where('faq.category = :category', { category });
    }
    qb.orderBy('faq.displayOrder', 'ASC').addOrderBy('faq.createdAt', 'DESC');
    return await qb.getMany();
  }

  async findById(id: string): Promise<HelpCenterFaq | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<HelpCenterFaq>): Promise<HelpCenterFaq> {
    const faq = this.repository.create(data);
    return await this.repository.save(faq);
  }

  async update(id: string, data: Partial<HelpCenterFaq>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
