import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('help_center_faqs')
export class HelpCenterFaq extends BaseEntity {
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
    name: 'category',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  category: string | null;

  @Column({
    name: 'display_order',
    type: 'int',
    nullable: false,
    default: 0,
  })
  displayOrder: number;
}
