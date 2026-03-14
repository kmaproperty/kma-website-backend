import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('join_us_enquiries')
export class JoinUsEnquiry extends BaseEntity {
  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  lastName: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  phoneNumber: string;

  @Column({
    name: 'state',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  state: string | null;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  city: string | null;

  @Column({
    name: 'message',
    type: 'text',
    nullable: true,
  })
  message: string | null;
}
