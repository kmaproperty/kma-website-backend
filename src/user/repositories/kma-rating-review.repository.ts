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
}

