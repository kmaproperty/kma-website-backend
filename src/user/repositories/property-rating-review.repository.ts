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
}


