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
    name: 'is_blocked',
    type: 'boolean',
    default: false,
  })
  isBlocked: boolean;

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
    name: 'firm_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  firmName: string | null;

  @Column({
    name: 'cities',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  cities: string | null;

  @Column({
    name: 'business_since',
    type: 'date',
    nullable: true,
  })
  businessSince: string | null;

  @Column({
    name: 'about_yourself',
    type: 'text',
    nullable: true,
  })
  aboutYourSelf: string | null;
}
