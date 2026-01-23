import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('rooms')
@Index(['name'], { unique: true })
export class Room extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'display_order',
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Order for displaying rooms in UI',
  })
  displayOrder: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: false,
    default: true,
    comment: 'Whether the room is active and available for selection',
  })
  isActive: boolean;
}

