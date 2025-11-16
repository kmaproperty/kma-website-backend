import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

export enum LeadType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
}

@Entity('leads')
export class Lead extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  propertyId: string | null;

  @Column({
    type: 'enum',
    enum: LeadType,
  })
  type: LeadType;
}


