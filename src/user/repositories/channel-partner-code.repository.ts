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

  async delete(id: string): Promise<boolean> {
    const result = await this.channelPartnerCodeRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
