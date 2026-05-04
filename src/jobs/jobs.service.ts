import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JobCategory } from './entities/job-category.entity';
import { Job, JobStatus } from './entities/job.entity';
import { CreateJobCategoryDto, UpdateJobCategoryDto } from './dto/job-category.dto';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JobApplication } from './entities/job-application.entity';
import { UpdateJobApplicationStatusDto } from './dto/job-application.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobCategory)
    private readonly categoryRepository: Repository<JobCategory>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
  ) {}

  async listCategories() {
    const data = await this.categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
    return { success: true, data };
  }

  async createCategory(dto: CreateJobCategoryDto) {
    const slug = this.makeSlug(dto.name);
    await this.ensureCategoryNameUnique(dto.name);
    await this.ensureCategorySlugUnique(slug);

    const created = await this.categoryRepository.save(
      this.categoryRepository.create({
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() ?? null,
        isActive: dto.isActive ?? true,
      }),
    );

    return { success: true, data: created };
  }

  async updateCategory(id: string, dto: UpdateJobCategoryDto) {
    const category = await this.mustFindCategory(id);

    if (dto.name && dto.name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const nextSlug = this.makeSlug(dto.name);
      await this.ensureCategoryNameUnique(dto.name, id);
      await this.ensureCategorySlugUnique(nextSlug, id);
      category.name = dto.name.trim();
      category.slug = nextSlug;
    }

    if (dto.description !== undefined) {
      category.description = dto.description?.trim() || null;
    }
    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    const updated = await this.categoryRepository.save(category);
    return { success: true, data: updated };
  }

  async deleteCategory(id: string) {
    await this.mustFindCategory(id);
    await this.categoryRepository.softDelete(id);
    return { success: true, message: 'Category deleted successfully', id };
  }

  async listJobs(query: { page?: number; limit?: number; search?: string; status?: JobStatus }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.categories', 'category')
      .orderBy('job.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search?.trim()) {
      qb.andWhere('(job.title ILIKE :search OR job.company_name ILIKE :search)', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.status) {
      qb.andWhere('job.status = :status', { status: query.status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { success: true, data, total, page, limit };
  }

  async getJob(id: string) {
    const data = await this.jobRepository.findOne({
      where: { id },
      relations: ['categories', 'applications'],
    });
    if (!data) {
      throw new BadRequestException(`Job with ID "${id}" not found`);
    }
    return { success: true, data };
  }

  async createJob(dto: CreateJobDto, adminId?: string) {
    await this.validateExperienceRange(dto.minExperienceYears, dto.maxExperienceYears);
    const categories = await this.fetchCategoriesOrFail(dto.categoryIds);
    const status = dto.status ?? JobStatus.DRAFT;

    const entity = this.jobRepository.create({
      title: dto.title.trim(),
      companyName: dto.companyName.trim(),
      location: dto.location.trim(),
      jobType: dto.jobType?.trim() ?? null,
      description: dto.description.trim(),
      requirements: dto.requirements?.trim() ?? null,
      benefits: dto.benefits?.trim() ?? null,
      status,
      minExperienceYears: dto.minExperienceYears ?? null,
      maxExperienceYears: dto.maxExperienceYears ?? null,
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
      publishedAt: status === JobStatus.PUBLISHED ? new Date() : null,
      isActive: dto.isActive ?? true,
      postedByAdminId: adminId ?? null,
      categories,
    });

    const data = await this.jobRepository.save(entity);
    return this.getJob(data.id);
  }

  async updateJob(id: string, dto: UpdateJobDto) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!job) {
      throw new BadRequestException(`Job with ID "${id}" not found`);
    }

    await this.validateExperienceRange(dto.minExperienceYears, dto.maxExperienceYears);
    if (dto.categoryIds?.length) {
      job.categories = await this.fetchCategoriesOrFail(dto.categoryIds);
    }

    if (dto.status && dto.status !== job.status && dto.status === JobStatus.PUBLISHED) {
      job.publishedAt = new Date();
    }

    Object.assign(job, {
      title: dto.title?.trim() ?? job.title,
      companyName: dto.companyName?.trim() ?? job.companyName,
      location: dto.location?.trim() ?? job.location,
      jobType: dto.jobType?.trim() ?? job.jobType,
      description: dto.description?.trim() ?? job.description,
      requirements: dto.requirements !== undefined ? (dto.requirements?.trim() || null) : job.requirements,
      benefits: dto.benefits !== undefined ? (dto.benefits?.trim() || null) : job.benefits,
      status: dto.status ?? job.status,
      minExperienceYears: dto.minExperienceYears ?? job.minExperienceYears,
      maxExperienceYears: dto.maxExperienceYears ?? job.maxExperienceYears,
      salaryMin: dto.salaryMin ?? job.salaryMin,
      salaryMax: dto.salaryMax ?? job.salaryMax,
      applicationDeadline:
        dto.applicationDeadline !== undefined
          ? dto.applicationDeadline
            ? new Date(dto.applicationDeadline)
            : null
          : job.applicationDeadline,
      isActive: dto.isActive ?? job.isActive,
    });

    await this.jobRepository.save(job);
    return this.getJob(id);
  }

  async deleteJob(id: string) {
    await this.getJob(id);
    await this.jobRepository.softDelete(id);
    return { success: true, message: 'Job deleted successfully', id };
  }

  async listApplications(query: { page?: number; limit?: number; jobId?: string }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
    const where = query.jobId ? { jobId: query.jobId } : {};

    const [data, total] = await this.applicationRepository.findAndCount({
      where,
      relations: ['job'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { success: true, data, total, page, limit };
  }

  async updateApplicationStatus(id: string, dto: UpdateJobApplicationStatusDto) {
    const item = await this.applicationRepository.findOne({ where: { id } });
    if (!item) {
      throw new BadRequestException(`Application with ID "${id}" not found`);
    }
    if (dto.status) {
      item.status = dto.status;
      await this.applicationRepository.save(item);
    }
    return { success: true, data: item };
  }

  private async fetchCategoriesOrFail(categoryIds: string[]) {
    const categories = await this.categoryRepository.find({
      where: { id: In(categoryIds), isActive: true },
    });
    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('One or more selected categories are invalid or inactive');
    }
    return categories;
  }

  private async mustFindCategory(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  private async ensureCategoryNameUnique(name: string, ignoreId?: string) {
    const existing = await this.categoryRepository.findOne({
      where: { name: name.trim() },
    });
    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException(`Category "${name.trim()}" already exists`);
    }
  }

  private async ensureCategorySlugUnique(slug: string, ignoreId?: string) {
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException(`Slug "${slug}" already exists`);
    }
  }

  private async validateExperienceRange(min?: number, max?: number) {
    if (min !== undefined && max !== undefined && min > max) {
      throw new BadRequestException('minExperienceYears cannot be greater than maxExperienceYears');
    }
  }

  private makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
