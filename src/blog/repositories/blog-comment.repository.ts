import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BlogComment } from '../entities/blog-comment.entity';

@Injectable()
export class BlogCommentRepository {
  constructor(
    @InjectRepository(BlogComment)
    private readonly repository: Repository<BlogComment>,
  ) {}

  async create(data: Partial<BlogComment>): Promise<BlogComment> {
    const comment = this.repository.create(data);
    return this.repository.save(comment);
  }

  async findById(id: string): Promise<BlogComment | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'blog', 'parentComment', 'replies', 'replies.user'],
    });
  }

  async update(id: string, data: Partial<BlogComment>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findWithPagination(options: {
    page: number;
    limit: number;
    blogId?: string;
    userId?: string;
    isApproved?: boolean;
    parentCommentId?: string | null;
  }): Promise<{ items: BlogComment[]; total: number }> {
    const { page, limit, blogId, userId, isApproved, parentCommentId } = options;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.blog', 'blog')
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .orderBy('comment.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (blogId) {
      qb.andWhere('comment.blogId = :blogId', { blogId });
    }

    if (userId) {
      qb.andWhere('comment.userId = :userId', { userId });
    }

    if (isApproved !== undefined) {
      qb.andWhere('comment.isApproved = :isApproved', { isApproved });
    }

    if (parentCommentId !== undefined) {
      if (parentCommentId === null) {
        qb.andWhere('comment.parentCommentId IS NULL');
      } else {
        qb.andWhere('comment.parentCommentId = :parentCommentId', { parentCommentId });
      }
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findApprovedByBlog(blogId: string): Promise<BlogComment[]> {
    return this.repository.find({
      where: {
        blogId,
        isApproved: true,
        parentCommentId: IsNull(), // Only top-level comments
      },
      relations: ['user', 'replies', 'replies.user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findRepliesByParentComment(parentCommentId: string): Promise<BlogComment[]> {
    return this.repository.find({
      where: {
        parentCommentId,
        isApproved: true,
      },
      relations: ['user'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async countByBlog(blogId: string, approvedOnly: boolean = false): Promise<number> {
    const qb = this.repository.createQueryBuilder('comment').where('comment.blogId = :blogId', { blogId });
    
    if (approvedOnly) {
      qb.andWhere('comment.isApproved = :isApproved', { isApproved: true });
    }

    return qb.getCount();
  }
}

