import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('faqs')
export class Faq extends BaseEntity {
  @Column({
    name: 'category',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  category: string;

  @Column({
    name: 'question',
    type: 'text',
    nullable: false,
  })
  question: string;

  @Column({
    name: 'answer',
    type: 'text',
    nullable: false,
  })
  answer: string;

  @Column({
    name: 'sort_order',
    type: 'int',
    nullable: false,
    default: 0,
  })
  sortOrder: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isActive: boolean;
}
