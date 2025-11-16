import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadType } from '../entities/lead.entity';

@Injectable()
export class LeadRepository {
  constructor(
    @InjectRepository(Lead)
    private readonly repository: Repository<Lead>,
  ) {}

  async countByUserAndTypeSince(
    userId: string,
    type: LeadType,
    since: Date,
  ): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        type,
        createdAt: (since as unknown) as any,
      } as any,
    });
  }

  async countByUserAndTypeSinceQuery(
    userId: string,
    type: LeadType,
    since: Date,
  ): Promise<number> {
    // Use query builder for createdAt >= since
    const qb = this.repository.createQueryBuilder('lead');
    qb.where('lead.userId = :userId', { userId })
      .andWhere('lead.type = :type', { type })
      .andWhere('lead.createdAt >= :since', { since });
    return qb.getCount();
  }
}


