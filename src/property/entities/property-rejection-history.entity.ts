import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Property } from './property.entity';

@Entity('property_rejection_history')
export class PropertyRejectionHistory extends BaseEntity {
  @Column({ type: 'uuid', name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'text', name: 'rejection_reason' })
  rejectionReason: string;

  @Column({ type: 'uuid', name: 'admin_id' })
  adminId: string;
}

