import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyRejectionHistory } from '../entities/property-rejection-history.entity';

@Injectable()
export class PropertyRejectionHistoryRepository {
  constructor(
    @InjectRepository(PropertyRejectionHistory)
    private readonly repository: Repository<PropertyRejectionHistory>,
  ) {}

  async create(
    entry: Partial<PropertyRejectionHistory>,
  ): Promise<PropertyRejectionHistory> {
    const record = this.repository.create(entry);
    return this.repository.save(record);
  }

  async findByPropertyId(
    propertyId: string,
  ): Promise<PropertyRejectionHistory[]> {
    return this.repository.find({
      where: { propertyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestByPropertyId(
    propertyId: string,
  ): Promise<PropertyRejectionHistory | null> {
    return this.repository.findOne({
      where: { propertyId },
      order: { createdAt: 'DESC' },
    });
  }
}

