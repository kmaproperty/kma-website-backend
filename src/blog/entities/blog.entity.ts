import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { BlogComment } from './blog-comment.entity';

export enum BlogStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

@Entity('blogs')
export class Blog extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 500,
  })
  title: string;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  excerpt: string | null;

  @Column({
    name: 'featured_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  featuredImage: string | null;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  author: string | null;

  @Column({
    name: 'author_id',
    type: 'uuid',
    nullable: true,
  })
  authorId: string | null;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  authorAdmin: Admin | null;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status: BlogStatus;

  @Column({
    name: 'approved_by_id',
    type: 'uuid',
    nullable: true,
  })
  approvedById: string | null;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: Admin | null;

  @Column({
    name: 'approved_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  approvedAt: Date | null;

  @Column({
    name: 'rejection_reason',
    type: 'text',
    nullable: true,
  })
  rejectionReason: string | null;

  @Column({
    name: 'published_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  publishedAt: Date | null;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  tags: string[] | null;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  category: string | null;

  @Column({
    name: 'meta_title',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  metaTitle: string | null;

  @Column({
    name: 'meta_description',
    type: 'text',
    nullable: true,
  })
  metaDescription: string | null;

  @Column({
    name: 'view_count',
    type: 'int',
    default: 0,
  })
  viewCount: number;

  @Column({
    name: 'allow_comments',
    type: 'boolean',
    default: true,
  })
  allowComments: boolean;

  @OneToMany(() => BlogComment, (comment) => comment.blog)
  comments: BlogComment[];
}

