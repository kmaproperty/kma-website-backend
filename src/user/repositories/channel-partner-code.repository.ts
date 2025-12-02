import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelPartnerCode } from '../entities/channel-partner-code.entity';

@Injectable()
export class ChannelPartnerCodeRepository {
  constructor(
    @InjectRepository(ChannelPartnerCode)
    private readonly channelPartnerCodeRepository: Repository<ChannelPartnerCode>,
  ) {}

  async create(
    codeData: Partial<ChannelPartnerCode>,
  ): Promise<ChannelPartnerCode> {
    const code = this.channelPartnerCodeRepository.create(codeData);
    return await this.channelPartnerCodeRepository.save(code);
  }

  async findByCode(code: string): Promise<ChannelPartnerCode | null> {
    return await this.channelPartnerCodeRepository.findOne({ where: { code } });
  }

  async findAll(): Promise<ChannelPartnerCode[]> {
    return await this.channelPartnerCodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ChannelPartnerCode | null> {
    return await this.channelPartnerCodeRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateData: Partial<ChannelPartnerCode>,
  ): Promise<void> {
    await this.channelPartnerCodeRepository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.channelPartnerCodeRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: ChannelPartnerCode[]; total: number }> {
    const { page, limit, search } = options;
    const qb = this.channelPartnerCodeRepository
      .createQueryBuilder('code')
      .orderBy('code.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('code.code ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}
