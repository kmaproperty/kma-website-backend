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
   * Get statistics for approved reviews. One-review-per-end-user is enforced
   * for new submissions, but historical rows may still hold accidental
   * duplicates — so we collapse to the latest row per endUserId at SQL level
   * to keep totalCount / averageRating honest. Phone-only rows
   * (end_user_id IS NULL) are treated as independent entries.
   */
  async getApprovedReviewsStatistics(): Promise<{
    totalCount: number;
    averageRating: number;
  }> {
    const result = await this.kmaRatingReviewRepository.query(
      `
      WITH ranked AS (
        SELECT
          rating,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE(end_user_id::text, id::text)
            ORDER BY created_at DESC
          ) AS rn
        FROM kma_rating_reviews
        WHERE is_approved = true AND deleted_at IS NULL
      )
      SELECT
        COUNT(*)::int AS total_count,
        AVG(rating)::float AS average_rating
      FROM ranked
      WHERE rn = 1
      `,
    );

    const row = Array.isArray(result) && result.length > 0 ? result[0] : null;
    const totalCount = row ? Number(row.total_count) || 0 : 0;
    const averageRatingRaw = row?.average_rating ? Number(row.average_rating) : 0;

    return {
      totalCount,
      averageRating: Math.round(averageRatingRaw * 10) / 10,
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
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find every rating review for an end user — used to self-heal accidental
   * duplicates (e.g. from a race when the unique constraint isn't installed).
   */
  async findAllByEndUserId(
    endUserId: string,
  ): Promise<KmaRatingReview[]> {
    return await this.kmaRatingReviewRepository.find({
      where: { endUserId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Hard-delete a set of rating reviews by id. Used after picking the winner
   * row to drop leftover duplicates for the same end user.
   */
  async deleteByIds(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.kmaRatingReviewRepository.delete(ids);
  }

  /**
   * Approved-review counts bucketed by floor(rating) so the home page
   * can render a real distribution bar chart for stars 1–5. Like the
   * statistics method above, we dedupe to one row per end user so that
   * duplicates from the pre-upsert era don't double-count.
   */
  async getApprovedRatingDistribution(): Promise<Record<number, number>> {
    const rows = await this.kmaRatingReviewRepository.query(
      `
      WITH ranked AS (
        SELECT
          rating,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE(end_user_id::text, id::text)
            ORDER BY created_at DESC
          ) AS rn
        FROM kma_rating_reviews
        WHERE is_approved = true AND deleted_at IS NULL
      )
      SELECT FLOOR(rating)::int AS bucket, COUNT(*)::int AS count
      FROM ranked
      WHERE rn = 1
      GROUP BY FLOOR(rating)
      `,
    );

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rows ?? []) {
      const bucket = Number(row.bucket);
      if (bucket >= 1 && bucket <= 5) {
        distribution[bucket] = Number(row.count);
      }
    }
    return distribution;
  }
}

