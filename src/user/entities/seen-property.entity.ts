import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';
import { Property } from '../../property/entities/property.entity';

/**
 * Tracks properties seen/viewed by users (both anonymous and logged-in).
 * - Anonymous users: sessionId is set, userId is null
 * - Logged-in users: userId is set (sessionId may or may not be set)
 * - On login: records with matching sessionId get userId attached
 */
@Entity('seen_properties')
@Index(['sessionId', 'propertyId'], { unique: true })
@Index(['userId', 'propertyId'])
export class SeenProperty extends BaseEntity {
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
    type: 'uuid',
    name: 'property_id',
  })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
