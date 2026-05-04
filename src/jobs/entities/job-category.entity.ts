import { Column, Entity, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Job } from './job.entity';

@Entity('job_categories')
export class JobCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => Job, (job) => job.categories)
  jobs: Job[];
}
