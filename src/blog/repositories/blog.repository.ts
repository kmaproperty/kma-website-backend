import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from '../entities/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly repository: Repository<Blog>,
  ) {}

  async create(data: Partial<Blog>): Promise<Blog> {
    const blog = this.repository.create(data);
    return this.repository.save(blog);
  }

  async findById(id: string): Promise<Blog | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['authorAdmin', 'approvedBy', 'comments'],
    });
  }

  async findByIdWithComments(id: string): Promise<Blog | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['authorAdmin', 'approvedBy', 'comments', 'comments.user', 'comments.replies'],
    });
  }

  async update(id: string, data: Partial<Blog>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findWithPagination(options: {
    page: number;
    limit: number;
    status?: BlogStatus;
    search?: string;
    category?: string;
    authorId?: string;
  }): Promise<{ items: Blog[]; total: number }> {
    const { page, limit, status, search, category, authorId } = options;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.authorAdmin', 'authorAdmin')
      .leftJoinAndSelect('blog.approvedBy', 'approvedBy')
      .orderBy('blog.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      qb.andWhere('blog.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(blog.title ILIKE :search OR blog.content ILIKE :search OR blog.excerpt ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere('blog.category = :category', { category });
    }

    if (authorId) {
      qb.andWhere('blog.authorId = :authorId', { authorId });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findPublished(options: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
  }): Promise<{ items: Blog[]; total: number }> {
    const { page, limit, search, category } = options;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.authorAdmin', 'authorAdmin')
      .where('blog.status = :status', { status: BlogStatus.PUBLISHED })
      .orderBy('blog.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.andWhere(
        '(blog.title ILIKE :search OR blog.content ILIKE :search OR blog.excerpt ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere('blog.category = :category', { category });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'viewCount', 1);
  }

  async findByStatus(status: BlogStatus): Promise<Blog[]> {
    return this.repository.find({
      where: { status },
      relations: ['authorAdmin'],
      order: { createdAt: 'DESC' },
    });
  }
}

