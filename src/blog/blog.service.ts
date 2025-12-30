import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogRepository } from './repositories/blog.repository';
import { BlogCommentRepository } from './repositories/blog-comment.repository';
import { AdminRepository } from '../admin/repositories/admin.repository';
import { Blog, BlogStatus } from './entities/blog.entity';
import { BlogComment } from './entities/blog-comment.entity';
import { AdminRole } from '../admin/enum/admin-role.enum';
import {
  CreateBlogDto,
  UpdateBlogDto,
  ApproveBlogDto,
  BlogListQueryDto,
  BlogListResponseDto,
  BlogResponseDto,
  CreateBlogResponseDto,
  UpdateBlogResponseDto,
  ApproveBlogResponseDto,
} from './dto';
import {
  CreateBlogCommentDto,
  BlogCommentListQueryDto,
  BlogCommentListResponseDto,
  BlogCommentResponseDto,
  CreateBlogCommentResponseDto,
  ApproveBlogCommentDto,
  ApproveBlogCommentResponseDto,
} from './dto/blog-comment.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly blogCommentRepository: BlogCommentRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  /**
   * Create a new blog (Content Ops Team)
   */
  async createBlog(
    createBlogDto: CreateBlogDto,
    adminId: string,
  ): Promise<CreateBlogResponseDto> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const blog = await this.blogRepository.create({
      ...createBlogDto,
      authorId: adminId,
      author: createBlogDto.author || admin.username,
      status: createBlogDto.status || BlogStatus.DRAFT,
      allowComments: createBlogDto.allowComments ?? true,
    });

    return {
      success: true,
      message: 'Blog created successfully',
      blog: this.mapBlogToResponse(blog),
    };
  }

  /**
   * Update a blog (Content Ops Team - only their own blogs or super admin)
   */
  async updateBlog(
    blogId: string,
    updateBlogDto: UpdateBlogDto,
    adminId: string,
  ): Promise<UpdateBlogResponseDto> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Only author or super admin can update
    if (blog.authorId !== adminId && admin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('You can only update your own blogs');
    }

    // If blog is published, don't allow updates (or require re-approval)
    if (blog.status === BlogStatus.PUBLISHED) {
      // Optionally, you can set status back to pending_approval on update
      // For now, we'll allow updates but they won't affect published status
    }

    await this.blogRepository.update(blogId, updateBlogDto);
    const updatedBlog = await this.blogRepository.findById(blogId);

    if (!updatedBlog) {
      throw new NotFoundException('Blog not found after update');
    }

    return {
      success: true,
      message: 'Blog updated successfully',
      blog: this.mapBlogToResponse(updatedBlog),
    };
  }

  /**
   * Approve or reject a blog (Super Admin only)
   */
  async approveBlog(
    blogId: string,
    approveBlogDto: ApproveBlogDto,
    adminId: string,
  ): Promise<ApproveBlogResponseDto> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can approve blogs');
    }

    if (blog.status === BlogStatus.PUBLISHED) {
      throw new BadRequestException('Blog is already published');
    }

    const updateData: Partial<Blog> = {
      approvedById: adminId,
      approvedAt: new Date(),
    };

    if (approveBlogDto.rejectionReason) {
      // Rejecting the blog
      updateData.status = BlogStatus.REJECTED;
      updateData.rejectionReason = approveBlogDto.rejectionReason;
    } else {
      // Approving the blog
      updateData.status = BlogStatus.APPROVED;
      updateData.rejectionReason = null;
    }

    await this.blogRepository.update(blogId, updateData);
    const updatedBlog = await this.blogRepository.findById(blogId);

    if (!updatedBlog) {
      throw new NotFoundException('Blog not found after approval');
    }

    return {
      success: true,
      message: approveBlogDto.rejectionReason
        ? 'Blog rejected successfully'
        : 'Blog approved successfully',
      blog: this.mapBlogToResponse(updatedBlog),
    };
  }

  /**
   * Publish a blog (Super Admin - moves from approved to published)
   */
  async publishBlog(blogId: string, adminId: string): Promise<ApproveBlogResponseDto> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can publish blogs');
    }

    if (blog.status !== BlogStatus.APPROVED) {
      throw new BadRequestException('Only approved blogs can be published');
    }

    await this.blogRepository.update(blogId, {
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    const updatedBlog = await this.blogRepository.findById(blogId);
    if (!updatedBlog) {
      throw new NotFoundException('Blog not found after publishing');
    }

    return {
      success: true,
      message: 'Blog published successfully',
      blog: this.mapBlogToResponse(updatedBlog),
    };
  }

  /**
   * List blogs with filters (Admin)
   */
  async listBlogs(query: BlogListQueryDto): Promise<BlogListResponseDto> {
    const { page = 1, limit = 20, status, search, category, authorId } = query;

    const result = await this.blogRepository.findWithPagination({
      page,
      limit,
      status,
      search,
      category,
      authorId,
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      items: result.items.map((blog) => this.mapBlogToResponse(blog)),
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get blog by ID (Admin)
   */
  async getBlogById(blogId: string): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.mapBlogToResponse(blog);
  }

  /**
   * Delete a blog (Content Ops - own blogs, Super Admin - any)
   */
  async deleteBlog(blogId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Only author or super admin can delete
    if (blog.authorId !== adminId && admin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    await this.blogRepository.delete(blogId);

    return {
      success: true,
      message: 'Blog deleted successfully',
    };
  }

  /**
   * List published blogs (End Users - Public)
   */
  async listPublishedBlogs(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<BlogListResponseDto> {
    const { page = 1, limit = 20, search, category } = query;

    const result = await this.blogRepository.findPublished({
      page,
      limit,
      search,
      category,
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      items: result.items.map((blog) => this.mapBlogToResponse(blog)),
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get published blog by ID (End Users - Public)
   */
  async getPublishedBlogById(blogId: string): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.status !== BlogStatus.PUBLISHED) {
      throw new NotFoundException('Blog not found');
    }

    // Increment view count
    await this.blogRepository.incrementViewCount(blogId);

    return this.mapBlogToResponse(blog);
  }

  /**
   * Create a comment on a blog (End Users - Public)
   */
  async createComment(
    createCommentDto: CreateBlogCommentDto,
    userId?: string,
  ): Promise<CreateBlogCommentResponseDto> {
    const blog = await this.blogRepository.findById(createCommentDto.blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.status !== BlogStatus.PUBLISHED) {
      throw new BadRequestException('Comments can only be added to published blogs');
    }

    if (!blog.allowComments) {
      throw new BadRequestException('Comments are disabled for this blog');
    }

    // If it's a reply, verify parent comment exists
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.blogCommentRepository.findById(
        createCommentDto.parentCommentId,
      );
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parentComment.blogId !== createCommentDto.blogId) {
        throw new BadRequestException('Parent comment does not belong to this blog');
      }
    }

    // Validate: authenticated users don't need guest name/email
    if (!userId) {
      if (!createCommentDto.guestName || !createCommentDto.guestEmail) {
        throw new BadRequestException('Guest name and email are required for unauthenticated users');
      }
    }

    const comment = await this.blogCommentRepository.create({
      blogId: createCommentDto.blogId,
      userId: userId || null,
      guestName: createCommentDto.guestName || null,
      guestEmail: createCommentDto.guestEmail || null,
      content: createCommentDto.content,
      parentCommentId: createCommentDto.parentCommentId || null,
      isApproved: false, // Comments need approval by default
    });

    const savedComment = await this.blogCommentRepository.findById(comment.id);
    if (!savedComment) {
      throw new NotFoundException('Comment not found after creation');
    }

    return {
      success: true,
      message: 'Comment added successfully. It will be visible after approval.',
      comment: this.mapCommentToResponse(savedComment),
    };
  }

  /**
   * List comments for a blog (End Users - Public, only approved)
   */
  async listBlogComments(blogId: string): Promise<BlogCommentResponseDto[]> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const comments = await this.blogCommentRepository.findApprovedByBlog(blogId);

    // Map comments with their replies
    return comments.map((comment) => {
      const commentResponse = this.mapCommentToResponse(comment);
      if (comment.replies && comment.replies.length > 0) {
        commentResponse.replies = comment.replies
          .filter((reply) => reply.isApproved)
          .map((reply) => this.mapCommentToResponse(reply));
      }
      return commentResponse;
    });
  }

  /**
   * List all comments with filters (Admin)
   */
  async listComments(query: BlogCommentListQueryDto): Promise<BlogCommentListResponseDto> {
    const { page = 1, limit = 20, blogId, userId, isApproved } = query;

    const result = await this.blogCommentRepository.findWithPagination({
      page,
      limit,
      blogId,
      userId,
      isApproved,
      parentCommentId: null, // Only top-level comments in list
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      items: result.items.map((comment) => this.mapCommentToResponse(comment)),
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Approve or reject a comment (Super Admin)
   */
  async approveComment(
    commentId: string,
    approveDto: ApproveBlogCommentDto,
    adminId: string,
  ): Promise<ApproveBlogCommentResponseDto> {
    const comment = await this.blogCommentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can approve comments');
    }

    await this.blogCommentRepository.update(commentId, {
      isApproved: approveDto.isApproved,
      approvedById: adminId,
      approvedAt: approveDto.isApproved ? new Date() : null,
    });

    const updatedComment = await this.blogCommentRepository.findById(commentId);
    if (!updatedComment) {
      throw new NotFoundException('Comment not found after approval');
    }

    return {
      success: true,
      message: approveDto.isApproved
        ? 'Comment approved successfully'
        : 'Comment rejected successfully',
      comment: this.mapCommentToResponse(updatedComment),
    };
  }

  /**
   * Delete a comment (Super Admin)
   */
  async deleteComment(commentId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    const comment = await this.blogCommentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can delete comments');
    }

    await this.blogCommentRepository.delete(commentId);

    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }

  /**
   * Map Blog entity to response DTO
   */
  private mapBlogToResponse(blog: Blog): BlogResponseDto {
    return {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage,
      author: blog.author,
      authorId: blog.authorId,
      status: blog.status,
      approvedById: blog.approvedById,
      approvedAt: blog.approvedAt,
      rejectionReason: blog.rejectionReason,
      publishedAt: blog.publishedAt,
      tags: blog.tags,
      category: blog.category,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      viewCount: blog.viewCount,
      allowComments: blog.allowComments,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }

  /**
   * Map BlogComment entity to response DTO
   */
  private mapCommentToResponse(comment: BlogComment): BlogCommentResponseDto {
    return {
      id: comment.id,
      blogId: comment.blogId,
      userId: comment.userId,
      guestName: comment.guestName,
      guestEmail: comment.guestEmail,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      isApproved: comment.isApproved,
      approvedById: comment.approvedById,
      approvedAt: comment.approvedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies: comment.replies
        ? comment.replies
            .filter((reply) => reply.isApproved)
            .map((reply) => this.mapCommentToResponse(reply))
        : undefined,
    };
  }
}

