import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KmaRatingReview } from '../entities/kma-rating-review.entity';

@Injectable()
export class KmaRatingReviewRepository {
  constructor(
    @InjectRepository(KmaRatingReview)
    private readonly kmaRatingReviewRepository: Repository<KmaRatingReview>,
  ) {}

  /**
   * Create a new KMA rating and review
   */
  async create(
    ratingReviewData: Partial<KmaRatingReview>,
  ): Promise<KmaRatingReview> {
    const ratingReview = this.kmaRatingReviewRepository.create(ratingReviewData);
    return await this.kmaRatingReviewRepository.save(ratingReview);
  }

  /**
   * Get all KMA ratings and reviews with pagination
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
  ): Promise<KmaRatingReview[]> {
    return await this.kmaRatingReviewRepository.find({
      relations: ['endUser'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * Get all KMA ratings and reviews with pagination and search
   */
  async findAllWithSearch(
    skip: number = 0,
    take: number = 10,
    search?: string,
    isApproved?: boolean,
  ): Promise<{ items: KmaRatingReview[]; total: number }> {
    const queryBuilder = this.kmaRatingReviewRepository
      .createQueryBuilder('ratingReview')
      .leftJoinAndSelect('ratingReview.endUser', 'endUser');

    if (search) {
      queryBuilder.where(
        '(LOWER(ratingReview.name) LIKE LOWER(:search) OR LOWER(ratingReview.email) LIKE LOWER(:search) OR ratingReview.phoneNumber LIKE :search OR LOWER(ratingReview.review) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (isApproved !== undefined) {
      if (search) {
        queryBuilder.andWhere('ratingReview.isApproved = :isApproved', { isApproved });
      } else {
        queryBuilder.where('ratingReview.isApproved = :isApproved', { isApproved });
      }
    }

    queryBuilder.orderBy('ratingReview.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  /**
   * Get total count of KMA ratings and reviews
   */
  async count(): Promise<number> {
    return await this.kmaRatingReviewRepository.count();
  }

  /**
   * Find rating review by ID
   */
  async findById(id: string): Promise<KmaRatingReview | null> {
    return await this.kmaRatingReviewRepository.findOne({
      where: { id },
      relations: ['endUser'],
    });
  }

  /**
   * Update rating review
   */
  async update(
    id: string,
    data: Partial<KmaRatingReview>,
  ): Promise<void> {
    await this.kmaRatingReviewRepository.update(id, data);
  }

  /**
   * Get top approved reviews for home page (sorted by approvedAt DESC, limit 5)
   */
  async findTopApprovedReviews(limit: number = 5): Promise<KmaRatingReview[]> {
    return await this.kmaRatingReviewRepository.find({
      where: { isApproved: true },
      relations: ['endUser'],
      order: { approvedAt: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get statistics for approved reviews
   */
  async getApprovedReviewsStatistics(): Promise<{
    totalCount: number;
    averageRating: number;
  }> {
    const queryBuilder = this.kmaRatingReviewRepository
      .createQueryBuilder('ratingReview')
      .where('ratingReview.isApproved = :isApproved', { isApproved: true });

    const totalCount = await queryBuilder.getCount();

    const result = await queryBuilder
      .select('AVG(ratingReview.rating)', 'averageRating')
      .getRawOne();

    const averageRating = result?.averageRating
      ? parseFloat(result.averageRating)
      : 0;

    return {
      totalCount,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    };
  }

  /**
   * Find a rating review by end user (used for upsert + prefill).
   * One review per logged-in end user; phone-only submissions are ignored here.
   */
  async findOneByEndUserId(
    endUserId: string,
  ): Promise<KmaRatingReview | null> {
    return await this.kmaRatingReviewRepository.findOne({
      where: { endUserId },
      relations: ['endUser'],
    });
  }

  /**
   * Approved-review counts bucketed by floor(rating) so the home page
   * can render a real distribution bar chart for stars 1–5.
   */
  async getApprovedRatingDistribution(): Promise<Record<number, number>> {
    const rows = await this.kmaRatingReviewRepository
      .createQueryBuilder('ratingReview')
      .select('FLOOR(ratingReview.rating)', 'bucket')
      .addSelect('COUNT(*)', 'count')
      .where('ratingReview.isApproved = :isApproved', { isApproved: true })
      .groupBy('FLOOR(ratingReview.rating)')
      .getRawMany<{ bucket: string; count: string }>();

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rows) {
      const bucket = Number(row.bucket);
      if (bucket >= 1 && bucket <= 5) {
        distribution[bucket] = Number(row.count);
      }
    }
    return distribution;
  }
}

