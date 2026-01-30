import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PropertyRatingReview,
  PropertyRatingRole,
} from '../entities/property-rating-review.entity';

@Injectable()
export class PropertyRatingReviewRepository {
  constructor(
    @InjectRepository(PropertyRatingReview)
    private readonly repository: Repository<PropertyRatingReview>,
  ) {}

  async upsertForUser(
    propertyId: string,
    endUserId: string,
    role: PropertyRatingRole,
    data: Partial<PropertyRatingReview>,
  ): Promise<PropertyRatingReview> {
    let existing = await this.repository.findOne({
      where: { propertyId, endUserId },
    });

    if (existing) {
      Object.assign(existing, { role, ...data });
      return this.repository.save(existing);
    }

    const created = this.repository.create({
      propertyId,
      endUserId,
      role,
      ...data,
    });
    return this.repository.save(created);
  }

  async findByUserAndProperty(
    propertyId: string,
    endUserId: string,
  ): Promise<PropertyRatingReview | null> {
    return this.repository.findOne({
      where: { propertyId, endUserId },
    });
  }

  async findAllByProperty(
    propertyId: string,
    limit?: number,
  ): Promise<PropertyRatingReview[]> {
    const query = this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.endUser', 'endUser')
      .where('review.propertyId = :propertyId', { propertyId })
      .andWhere('review.deletedAt IS NULL')
      .orderBy('review.createdAt', 'DESC');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  async findByPropertyPaginated(
    propertyId: string,
    page: number,
    limit: number,
    opts?: {
      search?: string;
      rating?: number;
      sortBy?: 'recommended' | 'newest' | 'oldest' | 'highest' | 'lowest';
    },
  ): Promise<{ items: PropertyRatingReview[]; total: number }> {
    const skip = (page - 1) * limit;
    const qb = this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.endUser', 'endUser')
      .where('review.propertyId = :propertyId', { propertyId })
      .andWhere('review.deletedAt IS NULL');

    const search = opts?.search?.trim();
    if (search) {
      const searchPattern = `%${search}%`;
      qb.andWhere(
        '(LOWER(COALESCE(review.like_text, \'\')) LIKE LOWER(:searchPattern) OR LOWER(COALESCE(review.dislike_text, \'\')) LIKE LOWER(:searchPattern) OR LOWER(COALESCE(endUser.name, \'\')) LIKE LOWER(:searchPattern))',
        { searchPattern },
      );
    }
    const rating = opts?.rating;
    if (rating != null && rating >= 1 && rating <= 5) {
      const lo = rating - 0.5;
      const hi = rating + 0.5;
      qb.andWhere(
        'review.overall_rating >= :ratingLo AND review.overall_rating < :ratingHi',
        { ratingLo: lo, ratingHi: hi },
      );
    }
    const sortBy = opts?.sortBy ?? 'recommended';
    switch (sortBy) {
      case 'oldest':
        qb.orderBy('review.createdAt', 'ASC');
        break;
      case 'highest':
        qb.orderBy('review.overallRating', 'DESC').addOrderBy(
          'review.createdAt',
          'DESC',
        );
        break;
      case 'lowest':
        qb.orderBy('review.overallRating', 'ASC').addOrderBy(
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

  async getRatingStatistics(propertyId: string): Promise<{
    totalReviews: number;
    averageOverallRating: number;
    averageConnectivityRating: number;
    averageNeighbourhoodRating: number;
    averageSafetyRating: number;
    averageLivabilityRating: number;
    starDistribution: {
      '5': number;
      '4': number;
      '3': number;
      '2': number;
      '1': number;
    };
  }> {
    const reviews = await this.repository
      .createQueryBuilder('review')
      .where('review.propertyId = :propertyId', { propertyId })
      .andWhere('review.deletedAt IS NULL')
      .getMany();

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageOverallRating: 0,
        averageConnectivityRating: 0,
        averageNeighbourhoodRating: 0,
        averageSafetyRating: 0,
        averageLivabilityRating: 0,
        starDistribution: {
          '5': 0,
          '4': 0,
          '3': 0,
          '2': 0,
          '1': 0,
        },
      };
    }

    const totalReviews = reviews.length;
    let totalOverall = 0;
    let totalConnectivity = 0;
    let totalNeighbourhood = 0;
    let totalSafety = 0;
    let totalLivability = 0;
    const starDistribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };

    for (const review of reviews) {
      const overall = Number(review.overallRating);
      totalOverall += overall;
      totalConnectivity += review.connectivityRating;
      totalNeighbourhood += review.neighbourhoodRating;
      totalSafety += review.safetyRating;
      totalLivability += review.livabilityRating;

      // Round to nearest integer for star distribution
      const starRating = Math.round(overall);
      if (starRating >= 5) starDistribution['5']++;
      else if (starRating >= 4) starDistribution['4']++;
      else if (starRating >= 3) starDistribution['3']++;
      else if (starRating >= 2) starDistribution['2']++;
      else starDistribution['1']++;
    }

    return {
      totalReviews,
      averageOverallRating: Number((totalOverall / totalReviews).toFixed(2)),
      averageConnectivityRating: Number(
        (totalConnectivity / totalReviews).toFixed(2),
      ),
      averageNeighbourhoodRating: Number(
        (totalNeighbourhood / totalReviews).toFixed(2),
      ),
      averageSafetyRating: Number((totalSafety / totalReviews).toFixed(2)),
      averageLivabilityRating: Number(
        (totalLivability / totalReviews).toFixed(2),
      ),
      starDistribution,
    };
  }

  async getLikeDislikeTexts(propertyId: string): Promise<{
    likes: string[];
    dislikes: string[];
  }> {
    const reviews = await this.repository
      .createQueryBuilder('review')
      .select(['review.likeText', 'review.dislikeText'])
      .where('review.propertyId = :propertyId', { propertyId })
      .andWhere('review.deletedAt IS NULL')
      .getMany();

    const likes: string[] = [];
    const dislikes: string[] = [];

    for (const review of reviews) {
      if (review.likeText?.trim()) {
        likes.push(review.likeText.trim());
      }
      if (review.dislikeText?.trim()) {
        dislikes.push(review.dislikeText.trim());
      }
    }

    return { likes, dislikes };
  }
}


