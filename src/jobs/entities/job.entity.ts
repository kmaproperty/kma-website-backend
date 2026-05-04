import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { JobCategory } from './job-category.entity';
import { JobApplication } from './job-application.entity';
import { Admin } from '../../admin/entities/admin.entity';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

@Entity('jobs')
export class Job extends BaseEntity {
  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ name: 'company_name', type: 'varchar', length: 180 })
  companyName: string;

  @Column({ type: 'varchar', length: 150 })
  location: string;

  @Column({ name: 'job_type', type: 'varchar', length: 80, nullable: true })
  jobType: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @Column({ type: 'text', nullable: true })
  benefits: string | null;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column({ name: 'min_experience_years', type: 'int', nullable: true })
  minExperienceYears: number | null;

  @Column({ name: 'max_experience_years', type: 'int', nullable: true })
  maxExperienceYears: number | null;

  @Column({ name: 'salary_min', type: 'numeric', precision: 12, scale: 2, nullable: true })
  salaryMin: string | null;

  @Column({ name: 'salary_max', type: 'numeric', precision: 12, scale: 2, nullable: true })
  salaryMax: string | null;

  @Column({ name: 'application_deadline', type: 'timestamp with time zone', nullable: true })
  applicationDeadline: Date | null;

  @Column({ name: 'published_at', type: 'timestamp with time zone', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'posted_by_admin_id', type: 'uuid', nullable: true })
  postedByAdminId: string | null;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'posted_by_admin_id' })
  postedByAdmin: Admin | null;

  @ManyToMany(() => JobCategory, (category) => category.jobs)
  @JoinTable({
    name: 'job_category_mappings',
    joinColumn: { name: 'job_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: JobCategory[];

  @OneToMany(() => JobApplication, (application) => application.job)
  applications: JobApplication[];
}
