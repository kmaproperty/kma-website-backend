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

export enum ApplyType {
  IN_APP = 'IN_APP',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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

  @Column({ name: 'openings_count', type: 'int', nullable: true })
  openingsCount: number | null;

  @Column({ name: 'country', type: 'varchar', length: 120, default: 'India' })
  country: string;

  @Column({ name: 'state', type: 'varchar', length: 120, nullable: true })
  state: string | null;

  @Column({ name: 'city', type: 'varchar', length: 120, nullable: true })
  city: string | null;

  @Column({ name: 'work_mode', type: 'varchar', length: 40, nullable: true })
  workMode: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string | null;

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

  @Column({
    name: 'approval_status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Column({
    name: 'apply_type',
    type: 'enum',
    enum: ApplyType,
    default: ApplyType.IN_APP,
  })
  applyType: ApplyType;

  @Column({ name: 'apply_link', type: 'varchar', length: 600, nullable: true })
  applyLink: string | null;

  @Column({ name: 'min_experience_years', type: 'int', nullable: true })
  minExperienceYears: number | null;

  @Column({ name: 'max_experience_years', type: 'int', nullable: true })
  maxExperienceYears: number | null;

  @Column({ name: 'experience_label', type: 'varchar', length: 120, nullable: true })
  experienceLabel: string | null;

  @Column({ name: 'minimum_qualification', type: 'varchar', length: 150, nullable: true })
  minimumQualification: string | null;

  @Column({ name: 'skills', type: 'text', nullable: true })
  skills: string | null;

  @Column({ name: 'salary_min', type: 'numeric', precision: 12, scale: 2, nullable: true })
  salaryMin: string | null;

  @Column({ name: 'salary_max', type: 'numeric', precision: 12, scale: 2, nullable: true })
  salaryMax: string | null;

  @Column({ name: 'salary_type', type: 'varchar', length: 40, nullable: true })
  salaryType: string | null;

  @Column({ name: 'salary_visibility', type: 'boolean', default: true })
  salaryVisibility: boolean;

  @Column({ name: 'application_deadline', type: 'timestamp with time zone', nullable: true })
  applicationDeadline: Date | null;

  @Column({ name: 'published_at', type: 'timestamp with time zone', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'featured', type: 'boolean', default: false })
  featured: boolean;

  @Column({ name: 'urgent_hiring', type: 'boolean', default: false })
  urgentHiring: boolean;

  @Column({ name: 'hr_name', type: 'varchar', length: 140, nullable: true })
  hrName: string | null;

  @Column({ name: 'hr_mobile_number', type: 'varchar', length: 30, nullable: true })
  hrMobileNumber: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 160, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'company_website', type: 'varchar', length: 255, nullable: true })
  companyWebsite: string | null;

  @Column({ name: 'company_logo', type: 'varchar', length: 500, nullable: true })
  companyLogo: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'apply_count', type: 'int', default: 0 })
  applyCount: number;

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
