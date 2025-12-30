import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Blog } from './blog.entity';
import { User } from '../../user/entities/user.entity';

@Entity('blog_comments')
export class BlogComment extends BaseEntity {
  @Column({
    name: 'blog_id',
    type: 'uuid',
  })
  blogId: string;

  @ManyToOne(() => Blog, (blog) => blog.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog_id' })
  blog: Blog;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({
    name: 'guest_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  guestName: string | null;

  @Column({
    name: 'guest_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  guestEmail: string | null;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    name: 'parent_comment_id',
    type: 'uuid',
    nullable: true,
  })
  parentCommentId: string | null;

  @ManyToOne(() => BlogComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: BlogComment | null;

  @OneToMany(() => BlogComment, (comment) => comment.parentComment)
  replies: BlogComment[];

  @Column({
    name: 'is_approved',
    type: 'boolean',
    default: false,
  })
  isApproved: boolean;

  @Column({
    name: 'approved_by_id',
    type: 'uuid',
    nullable: true,
  })
  approvedById: string | null;

  @Column({
    name: 'approved_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  approvedAt: Date | null;
}

