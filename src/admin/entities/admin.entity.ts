import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { AdminRole } from '../enum/admin-role.enum';

@Entity('admins')
export class Admin extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  passwordHash: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  accessToken: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  refreshToken: string | null;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.ADMIN,
  })
  role: AdminRole;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  permissions: string[] | null;
}

