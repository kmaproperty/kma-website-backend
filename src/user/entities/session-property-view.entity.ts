import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Session } from './session.entity';

@Entity('session_property_views')
@Index(['sessionId', 'propertyId'], { unique: true })
export class SessionPropertyView extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'session_id',
  })
  sessionId: string;

  @ManyToOne(() => Session, (session) => session.propertyViews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({
    type: 'uuid',
    name: 'property_id',
  })
  propertyId: string;

  @Column({
    type: 'int',
    default: 1,
    name: 'view_count',
    comment: 'Number of times this property was viewed in this session',
  })
  viewCount: number;
}

