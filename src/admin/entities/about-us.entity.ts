import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('about_us')
export class AboutUs extends BaseEntity {
  @Column({
    name: 'heading',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  heading: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: false,
  })
  description: string;
}

