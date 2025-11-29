import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelPartnerAgreement } from '../entities/channel-partner-agreement.entity';

@Injectable()
export class ChannelPartnerAgreementRepository {
  constructor(
    @InjectRepository(ChannelPartnerAgreement)
    private readonly agreementRepository: Repository<ChannelPartnerAgreement>,
  ) {}

  async create(
    agreementData: Partial<ChannelPartnerAgreement>,
  ): Promise<ChannelPartnerAgreement> {
    const agreement = this.agreementRepository.create(agreementData);
    return await this.agreementRepository.save(agreement);
  }

  async findById(id: string): Promise<ChannelPartnerAgreement | null> {
    return await this.agreementRepository.findOne({ where: { id } });
  }

  async findByEnvelopeId(
    envelopeId: string,
  ): Promise<ChannelPartnerAgreement | null> {
    return await this.agreementRepository.findOne({
      where: { envelopeId },
    });
  }

  async findByUserId(
    userId: string,
  ): Promise<ChannelPartnerAgreement[]> {
    return await this.agreementRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateData: Partial<ChannelPartnerAgreement>,
  ): Promise<ChannelPartnerAgreement | null> {
    await this.agreementRepository.update(id, updateData);
    return await this.findById(id);
  }

  async updateByEnvelopeId(
    envelopeId: string,
    updateData: Partial<ChannelPartnerAgreement>,
  ): Promise<ChannelPartnerAgreement | null> {
    const agreement = await this.findByEnvelopeId(envelopeId);
    if (!agreement) {
      return null;
    }
    return await this.update(agreement.id, updateData);
  }
}

