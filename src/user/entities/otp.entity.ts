import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('otps')
@Index(['phone', 'isUsed'], { unique: false })
export class Otp extends BaseEntity {
  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
  })
  phone: string;

  @Column({
    name: 'otp_code',
    type: 'varchar',
    length: 6,
  })
  otpCode: string;

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: false,
  })
  isUsed: boolean;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    name: 'attempts',
    type: 'int',
    default: 0,
  })
  attempts: number;
}
