import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('team_members')
export class TeamMember extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  role: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({
    name: 'profile_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  profileImage: string | null;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'display_order',
    type: 'int',
    nullable: false,
    default: 0,
  })
  displayOrder: number;

  @Column({
    name: 'is_founder',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isFounder: boolean;
}
