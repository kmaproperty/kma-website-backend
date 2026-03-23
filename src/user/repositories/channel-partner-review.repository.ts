import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelPartnerReview } from '../entities/channel-partner-review.entity';

@Injectable()
export class ChannelPartnerReviewRepository {
  constructor(
    @InjectRepository(ChannelPartnerReview)
    private readonly repository: Repository<ChannelPartnerReview>,
  ) {}

  async upsert(
    channelPartnerId: string,
    reviewerId: string,
    rating: number,
    review: string | null,
  ): Promise<ChannelPartnerReview> {
    let existing = await this.repository.findOne({
      where: { channelPartnerId, reviewerId },
    });

    if (existing) {
      Object.assign(existing, { rating, review });
      return this.repository.save(existing);
    }

    const created = this.repository.create({
      channelPartnerId,
      reviewerId,
      rating,
      review,
    });
    return this.repository.save(created);
  }

  async findByReviewerAndCP(
    reviewerId: string,
    channelPartnerId: string,
  ): Promise<ChannelPartnerReview | null> {
    return this.repository.findOne({
      where: { channelPartnerId, reviewerId },
    });
  }

  async findByChannelPartner(
    channelPartnerId: string,
    page: number,
    limit: number,
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest',
  ): Promise<{ items: ChannelPartnerReview[]; total: number }> {
    const skip = (page - 1) * limit;
    const qb = this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.channelPartnerId = :channelPartnerId', {
        channelPartnerId,
      })
      .andWhere('review.deletedAt IS NULL');

    switch (sortBy) {
      case 'oldest':
        qb.orderBy('review.createdAt', 'ASC');
        break;
      case 'highest':
        qb.orderBy('review.rating', 'DESC').addOrderBy(
          'review.createdAt',
          'DESC',
        );
        break;
      case 'lowest':
        qb.orderBy('review.rating', 'ASC').addOrderBy(
          'review.createdAt',
          'DESC',
        );
        break;
      default:
        qb.orderBy('review.createdAt', 'DESC');
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { items, total };
  }

  async getAverageRating(
    channelPartnerId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.channelPartnerId = :channelPartnerId', {
        channelPartnerId,
      })
      .andWhere('review.deletedAt IS NULL')
      .getRawOne();

    return {
      averageRating: result?.avg ? Number(Number(result.avg).toFixed(2)) : 0,
      totalReviews: result?.count ? Number(result.count) : 0,
    };
  }

  async getStarDistribution(
    channelPartnerId: string,
  ): Promise<{ 5: number; 4: number; 3: number; 2: number; 1: number }> {
    const reviews = await this.repository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .where('review.channelPartnerId = :channelPartnerId', {
        channelPartnerId,
      })
      .andWhere('review.deletedAt IS NULL')
      .getRawMany();

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    for (const r of reviews) {
      const star = Math.round(Number(r.rating));
      if (star >= 5) distribution[5]++;
      else if (star >= 4) distribution[4]++;
      else if (star >= 3) distribution[3]++;
      else if (star >= 2) distribution[2]++;
      else distribution[1]++;
    }

    return distribution;
  }
}
