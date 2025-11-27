import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadPropertyContact } from '../entities/lead-property-contact.entity';

@Injectable()
export class LeadPropertyContactRepository {
  constructor(
    @InjectRepository(LeadPropertyContact)
    private readonly repository: Repository<LeadPropertyContact>,
  ) {}

  async create(data: Partial<LeadPropertyContact>): Promise<LeadPropertyContact> {
    const contact = this.repository.create(data);
    return this.repository.save(contact);
  }

  async findByLeadId(leadId: string): Promise<LeadPropertyContact[]> {
    return this.repository.find({
      where: { leadId },
      relations: ['property'],
      order: { contactedAt: 'DESC' },
    });
  }

  async findByLeadAndProperty(
    leadId: string,
    propertyId: string,
  ): Promise<LeadPropertyContact | null> {
    return this.repository.findOne({
      where: { leadId, propertyId },
    });
  }

  async countByLeadId(leadId: string): Promise<number> {
    return this.repository.count({
      where: { leadId },
    });
  }

  async update(id: string, data: Partial<LeadPropertyContact>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

