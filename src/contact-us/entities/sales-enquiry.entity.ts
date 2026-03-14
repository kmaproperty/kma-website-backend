import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('sales_enquiries')
export class SalesEnquiry extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

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
    name: 'message',
    type: 'text',
    nullable: true,
  })
  message: string | null;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'callback',
  })
  type: string;
}
