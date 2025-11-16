import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { UserRole } from '../enum/user-role.enum';

@Entity('user_role_history')
export class UserRoleHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: UserRole })
  fromRole: UserRole;

  @Column({ type: 'enum', enum: UserRole })
  toRole: UserRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
  channelPartnerCode: string | null;
}


