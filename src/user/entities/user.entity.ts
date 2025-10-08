import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

export enum UserRole {
  ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @Column({
    name: 'token',
    type: 'text',
    nullable: true,
  })
  token: string | null;

  @Column({
    name: 'refresh_token',
    type: 'text',
    nullable: true,
  })
  refreshToken: string | null;
}
