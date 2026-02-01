import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';

/**
 * Tracks search queries made by users (both anonymous and logged-in).
 * - Anonymous users: sessionId is set, userId is null
 * - Logged-in users: userId is set (sessionId may or may not be set)
 * - On login: records with matching sessionId get userId attached
 */
@Entity('search_history')
@Index(['sessionId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class SearchHistory extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 64,
    name: 'session_id',
    nullable: true,
  })
  sessionId: string | null;

  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
  })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'search_query',
  })
  searchQuery: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'location',
    nullable: true,
  })
  location: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'city',
    nullable: true,
  })
  city: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'price_range',
    nullable: true,
  })
  priceRange: string | null;

  @Column({
    type: 'jsonb',
    name: 'filters',
    nullable: true,
  })
  filters: Record<string, any> | null;
}
