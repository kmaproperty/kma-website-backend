import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Lead } from './lead.entity';

@Entity('lead_notes')
export class LeadNote extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'lead_id',
  })
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({
    type: 'text',
    nullable: false,
  })
  note: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'created_by_admin_id',
  })
  createdByAdminId: string | null;
}

