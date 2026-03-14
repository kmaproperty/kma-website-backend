import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('regional_offices')
export class RegionalOffice extends BaseEntity {
  @Column({
    name: 'city',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  city: string;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @Column({
    name: 'contact_person',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  contactPerson: string;

  @Column({
    name: 'designation',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  designation: string | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  phone: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'display_order',
    type: 'int',
    nullable: false,
    default: 0,
  })
  displayOrder: number;
}
