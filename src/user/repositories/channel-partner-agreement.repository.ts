import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelPartnerAgreement } from '../entities/channel-partner-agreement.entity';

@Injectable()
export class ChannelPartnerAgreementRepository {
  constructor(
    @InjectRepository(ChannelPartnerAgreement)
    private readonly repository: Repository<ChannelPartnerAgreement>,
  ) {}

  async createAgreement(data: Partial<ChannelPartnerAgreement>) {
    const rec = this.repository.create(data);
    return this.repository.save(rec);
  }

  async findByEnvelope(envelopeId: string) {
    return this.repository.findOne({ where: { envelopeId } });
  }

  async findLatestByUser(userId: string) {
    return this.repository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateByEnvelope(
    envelopeId: string,
    data: Partial<ChannelPartnerAgreement>,
  ) {
    await this.repository.update({ envelopeId }, data);
  }
}


