import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { User } from './user.entity';

@Entity('bank_details')
export class BankDetails extends BaseEntity {
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Encrypted fields
  @Column({
    name: 'account_number',
    type: 'text',
    nullable: false,
  })
  accountNumber: string; // Encrypted

  @Column({
    name: 'ifsc_code',
    type: 'text',
    nullable: false,
  })
  ifscCode: string; // Encrypted

  @Column({
    name: 'bank_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  bankName: string; // Can be stored as plain text (less sensitive)

  @Column({
    name: 'account_holder_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  accountHolderName: string; // Can be stored as plain text (less sensitive)

  @Column({
    name: 'branch_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  branchName: string | null; // Can be stored as plain text (less sensitive)
}

