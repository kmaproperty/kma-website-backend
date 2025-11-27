import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { LeadNote } from './lead-note.entity';
import { LeadPropertyContact } from './lead-property-contact.entity';

export enum LeadBuildingType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

@Entity('leads')
export class Lead extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'budget_min',
  })
  budgetMin: number | null;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'budget_max',
  })
  budgetMax: number | null;

  @Column({
    type: 'int',
    nullable: true,
    name: 'size_min',
  })
  sizeMin: number | null;

  @Column({
    type: 'int',
    nullable: true,
    name: 'size_max',
  })
  sizeMax: number | null;

  @Column({
    type: 'enum',
    enum: LeadBuildingType,
    nullable: true,
    name: 'building_type',
  })
  buildingType: LeadBuildingType | null;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
    name: 'property_types',
  })
  propertyTypes: string[] | null;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
    name: 'locations',
  })
  locations: string[] | null;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'last_contacted_at',
  })
  lastContactedAt: Date | null;

  @Column({
    type: 'int',
    default: 0,
    name: 'properties_contacted_count',
  })
  propertiesContactedCount: number;

  // Legacy type column (maps to buildingType)
  @Column({
    type: 'enum',
    enum: LeadBuildingType,
    nullable: true,
  })
  type: LeadBuildingType | null;

  @OneToMany(() => LeadNote, (note) => note.lead, { cascade: true })
  notes: LeadNote[];

  @OneToMany(() => LeadPropertyContact, (contact) => contact.lead, { cascade: true })
  propertyContacts: LeadPropertyContact[];
}

