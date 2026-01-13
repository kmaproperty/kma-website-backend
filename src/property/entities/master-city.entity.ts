import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';

@Entity('master_cities')
export class MasterCity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;
}
