import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyVerificationRequest, PropertyVerificationStatus } from '../entities/property-verification-request.entity';

@Injectable()
export class PropertyVerificationRequestRepository {
  constructor(
    @InjectRepository(PropertyVerificationRequest)
    private readonly repository: Repository<PropertyVerificationRequest>,
  ) {}

  async create(
    data: Partial<PropertyVerificationRequest>,
  ): Promise<PropertyVerificationRequest> {
    const request = this.repository.create(data);
    return this.repository.save(request);
  }

  async findById(id: string): Promise<PropertyVerificationRequest | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['property', 'requestedByUser', 'reviewedByAdmin'],
    });
  }

  async findByToken(
    token: string,
  ): Promise<PropertyVerificationRequest | null> {
    return this.repository.findOne({
      where: { verificationToken: token },
      relations: [
        'property',
        'property.society',
        'property.locality',
        'requestedByUser',
      ],
    });
  }

  async findByPropertyId(
    propertyId: string,
  ): Promise<PropertyVerificationRequest[]> {
    return this.repository.find({
      where: { propertyId },
      relations: ['requestedByUser', 'reviewedByAdmin'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingByPropertyId(
    propertyId: string,
  ): Promise<PropertyVerificationRequest | null> {
    return this.repository.findOne({
      where: {
        propertyId,
        status: PropertyVerificationStatus.PENDING,
      },
      relations: ['property', 'requestedByUser'],
    });
  }

  async update(
    id: string,
    data: Partial<PropertyVerificationRequest>,
  ): Promise<void> {
    await this.repository.update(id, data);
  }

  async findAllWithPagination(
    skip: number = 0,
    take: number = 20,
    status?: PropertyVerificationStatus,
  ): Promise<{ items: PropertyVerificationRequest[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.property', 'property')
      .leftJoinAndSelect('request.requestedByUser', 'requestedByUser')
      .leftJoinAndSelect('request.reviewedByAdmin', 'reviewedByAdmin')
      .orderBy('request.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (status) {
      queryBuilder.where('request.status = :status', { status });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }
}

