import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';
import { Property } from '../../property/entities/property.entity';

/**
 * Tracks properties that users have contacted/inquired about (both anonymous and logged-in).
 * - Anonymous users: sessionId is set, userId is null (after OTP verification).
 * - Logged-in users: userId is set (sessionId may or may not be set).
 * - On login/signup: records with matching sessionId get userId attached.
 */
@Entity('contacted_properties')
@Index(['sessionId', 'propertyId'])
@Index(['userId', 'propertyId'])
export class ContactedProperty extends BaseEntity {
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

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  email: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({
    type: 'varchar',
    length: 10,
    name: 'country_code',
    nullable: true,
  })
  countryCode: string | null;
}
