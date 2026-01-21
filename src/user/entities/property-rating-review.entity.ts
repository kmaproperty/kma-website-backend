import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';
import { Property } from '../../property/entities/property.entity';

export type PropertyRatingRole = 'owner' | 'tenant' | 'other';

@Entity('property_rating_reviews')
export class PropertyRatingReview extends BaseEntity {
  @Column({
    name: 'property_id',
    type: 'uuid',
    nullable: false,
  })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: false })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({
    name: 'end_user_id',
    type: 'uuid',
    nullable: false,
  })
  endUserId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'end_user_id' })
  endUser: User;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  role: PropertyRatingRole;

  @Column({
    name: 'connectivity_rating',
    type: 'int',
    nullable: false,
  })
  connectivityRating: number;

  @Column({
    name: 'neighbourhood_rating',
    type: 'int',
    nullable: false,
  })
  neighbourhoodRating: number;

  @Column({
    name: 'safety_rating',
    type: 'int',
    nullable: false,
  })
  safetyRating: number;

  @Column({
    name: 'livability_rating',
    type: 'int',
    nullable: false,
  })
  livabilityRating: number;

  @Column({
    name: 'like_text',
    type: 'text',
    nullable: true,
  })
  likeText: string | null;

  @Column({
    name: 'dislike_text',
    type: 'text',
    nullable: true,
  })
  dislikeText: string | null;

  @Column({
    name: 'overall_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: false,
  })
  overallRating: number;
}


