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


