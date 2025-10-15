import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { UserRole } from '../enum/user-role.enum';
import { UserIntent } from '../enum/user-intent.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email: string | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  phone: string;

  @Column({
    name: 'intent',
    type: 'enum',
    enum: UserIntent,
    nullable: true,
  })
  intent: UserIntent | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'phone_verified',
    type: 'boolean',
    default: false,
  })
  phoneVerified: boolean;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.OWNER,
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

  @Column({
    name: 'channel_partner_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  channelPartnerCode: string | null;

  @Column({
    name: 'experience',
    type: 'int',
    nullable: true,
  })
  experience: number | null;

  @Column({
    name: 'state',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  state: string | null;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city: string | null;

  @Column({
    name: 'about_yourself',
    type: 'text',
    nullable: true,
  })
  aboutYourSelf: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
