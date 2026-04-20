import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  /**
   * Public: returns active FAQs grouped by category, sorted by sortOrder
   */
  async getActiveFaqs(): Promise<{
    success: boolean;
    data: { category: string; faqs: Faq[] }[];
  }> {
    const faqs = await this.faqRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const grouped = this.groupByCategory(faqs);

    return { success: true, data: grouped };
  }

  /**
   * Admin: returns all FAQs including inactive
   */
  async getAllFaqs(): Promise<{
    success: boolean;
    data: Faq[];
    total: number;
  }> {
    const faqs = await this.faqRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return { success: true, data: faqs, total: faqs.length };
  }

  /**
   * Admin: create a new FAQ
   */
  async createFaq(
    dto: CreateFaqDto,
  ): Promise<{ success: boolean; message: string; data: Faq }> {
    const faq = this.faqRepository.create(dto);
    const saved = await this.faqRepository.save(faq);
    return { success: true, message: 'FAQ created successfully', data: saved };
  }

  /**
   * Admin: update an existing FAQ
   */
  async updateFaq(
    id: string,
    dto: UpdateFaqDto,
  ): Promise<{ success: boolean; message: string; data: Faq }> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    await this.faqRepository.update(id, dto);
    const updated = await this.faqRepository.findOne({ where: { id } });

    return {
      success: true,
      message: 'FAQ updated successfully',
      data: updated!,
    };
  }

  /**
   * Admin: soft delete a FAQ
   */
  async deleteFaq(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    await this.faqRepository.softDelete(id);
    return { success: true, message: 'FAQ deleted successfully' };
  }

  private groupByCategory(
    faqs: Faq[],
  ): { category: string; faqs: Faq[] }[] {
    const map = new Map<string, Faq[]>();

    for (const faq of faqs) {
      const existing = map.get(faq.category);
      if (existing) {
        existing.push(faq);
      } else {
        map.set(faq.category, [faq]);
      }
    }

    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      faqs: items,
    }));
  }
}
