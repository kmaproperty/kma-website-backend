import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Lead } from './lead.entity';
import { Property } from '../../property/entities/property.entity';

@Entity('lead_property_contacts')
export class LeadPropertyContact extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'lead_id',
  })
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.propertyContacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({
    type: 'uuid',
    name: 'property_id',
  })
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'contacted_at',
  })
  contactedAt: Date | null;
}

