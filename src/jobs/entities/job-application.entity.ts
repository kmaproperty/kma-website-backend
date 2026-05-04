import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Job } from './job.entity';

export enum JobApplicationStatus {
  NEW = 'NEW',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
}

@Entity('job_applications')
export class JobApplication extends BaseEntity {
  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'full_name', type: 'varchar', length: 140 })
  fullName: string;

  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 30 })
  phoneNumber: string;

  @Column({ name: 'resume_url', type: 'text', nullable: true })
  resumeUrl: string | null;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string | null;

  @Column({
    type: 'enum',
    enum: JobApplicationStatus,
    default: JobApplicationStatus.NEW,
  })
  status: JobApplicationStatus;
}
