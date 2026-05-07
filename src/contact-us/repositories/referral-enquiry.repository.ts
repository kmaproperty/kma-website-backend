import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReferralEnquiry,
  ReferralEnquiryStatus,
  ReferralPropertyType,
} from '../entities/referral-enquiry.entity';

type ReferralListFilters = {
  search?: string;
  channelPartnerId?: string;
  referrerSearch?: string;
  propertyType?: ReferralPropertyType;
  statuses?: ReferralEnquiryStatus[];
  dateFrom?: Date;
  dateTo?: Date;
};

@Injectable()
export class ReferralEnquiryRepository {
  constructor(
    @InjectRepository(ReferralEnquiry)
    private readonly referralEnquiryRepository: Repository<ReferralEnquiry>,
  ) {}

  async create(
    data: Partial<ReferralEnquiry>,
  ): Promise<ReferralEnquiry> {
    const entity = this.referralEnquiryRepository.create(data);
    return this.referralEnquiryRepository.save(entity);
  }

  async findById(id: string): Promise<ReferralEnquiry | null> {
    return this.referralEnquiryRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<ReferralEnquiry>,
  ): Promise<void> {
    await this.referralEnquiryRepository.update(id, data);
  }

  async findAllWithFilters(
    skip: number,
    take: number,
    filters: ReferralListFilters,
  ): Promise<{ items: ReferralEnquiry[]; total: number }> {
    const qb = this.referralEnquiryRepository.createQueryBuilder('ref');

    if (filters.search) {
      qb.andWhere(
        `(LOWER(ref.clientName) LIKE LOWER(:search) OR ref.clientMobile LIKE :search OR LOWER(COALESCE(ref.location, '')) LIKE LOWER(:search))`,
        { search: `%${filters.search}%` },
      );
    }

    if (filters.channelPartnerId) {
      qb.andWhere('ref.channelPartnerId = :channelPartnerId', {
        channelPartnerId: filters.channelPartnerId,
      });
    }

    if (filters.referrerSearch) {
      qb.andWhere(
        '(LOWER(ref.referrerName) LIKE LOWER(:referrerSearch) OR ref.referrerPhone LIKE :referrerSearch)',
        { referrerSearch: `%${filters.referrerSearch}%` },
      );
    }

    if (filters.propertyType) {
      qb.andWhere('ref.propertyType = :propertyType', {
        propertyType: filters.propertyType,
      });
    }

    if (filters.statuses?.length) {
      qb.andWhere('ref.status IN (:...statuses)', {
        statuses: filters.statuses,
      });
    }

    if (filters.dateFrom) {
      qb.andWhere('ref.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      qb.andWhere('ref.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    qb.orderBy('ref.createdAt', 'DESC').skip(skip).take(take);
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}
