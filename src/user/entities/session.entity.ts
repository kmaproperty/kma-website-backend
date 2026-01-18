import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { SessionPropertyView } from './session-property-view.entity';

@Entity('sessions')
@Index(['sessionId'], { unique: true })
export class Session extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    name: 'session_id',
  })
  sessionId: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'ip_address',
  })
  ipAddress: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'user_agent',
  })
  userAgent: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'user_id',
    comment: 'Set when session is merged with user account after login',
  })
  userId: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'merged_at',
    comment: 'Timestamp when session was merged with user account',
  })
  mergedAt: Date | null;

  @OneToMany(() => SessionPropertyView, (view) => view.session, {
    cascade: true,
  })
  propertyViews: SessionPropertyView[];
}

