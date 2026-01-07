import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';

@Entity('contact_us_kma_queries')
export class ContactUsKmaQuery extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  phoneNumber: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'end_user_id',
    type: 'uuid',
    nullable: true,
  })
  endUserId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'end_user_id' })
  endUser: User | null;
}

