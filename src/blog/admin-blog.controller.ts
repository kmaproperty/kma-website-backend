import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BlogService } from './blog.service';
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { RequireAdminPermissions } from '../admin/decorators/admin-permissions.decorator';
import { AdminPermission } from '../admin/enum/admin-permission.enum';
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
  BlogCommentListQueryDto,
  BlogCommentListResponseDto,
  ApproveBlogCommentDto,
  ApproveBlogCommentResponseDto,
} from './dto/blog-comment.dto';

@ApiTags('Admin - Blog Management')
@Controller('admin/blogs')
@UseGuards(AdminAuthGuard, AdminPermissionsGuard)
@ApiBearerAuth('access-token')
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Create a new blog (Content Ops Team)',
    description: 'Content ops team can create blogs. Blog will be in draft status by default.',
  })
  @ApiResponse({
    status: 201,
    description: 'Blog created successfully',
    type: CreateBlogResponseDto,
  })
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @Req() req: Request,
  ): Promise<CreateBlogResponseDto> {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin not authenticated');
    }
    return await this.blogService.createBlog(createBlogDto, adminId);
  }

  @Get()
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'List all blogs with filters (Admin)',
    description: 'List blogs with pagination and filters. Content ops can see their own blogs, super admin can see all.',
  })
  @ApiResponse({
    status: 200,
    description: 'Blogs retrieved successfully',
    type: BlogListResponseDto,
  })
  async listBlogs(
    @Query() query: BlogListQueryDto,
    @Req() req: Request,
  ): Promise<BlogListResponseDto> {
    const adminId = (req as any).admin?.id;
    const adminRole = (req as any).admin?.role;

    // If not super admin, filter by author
    if (adminRole !== AdminRole.SUPER_ADMIN) {
      query.authorId = adminId;
    }

    return await this.blogService.listBlogs(query);
  }

  @Get(':id')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Get blog details by ID (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog retrieved successfully',
    type: BlogResponseDto,
  })
  async getBlogById(@Param('id') blogId: string): Promise<BlogResponseDto> {
    return await this.blogService.getBlogById(blogId);
  }

  @Put(':id')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Update a blog (Content Ops Team - own blogs only)',
    description: 'Content ops can update their own blogs. Super admin can update any blog.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog updated successfully',
    type: UpdateBlogResponseDto,
  })
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req: Request,
  ): Promise<UpdateBlogResponseDto> {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin not authenticated');
    }
    return await this.blogService.updateBlog(blogId, updateBlogDto, adminId);
  }

  @Patch(':id/approve')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Approve or reject a blog (Super Admin only)',
    description: 'Super admin can approve or reject blogs. If rejectionReason is provided, blog will be rejected.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog approved/rejected successfully',
    type: ApproveBlogResponseDto,
  })
  async approveBlog(
    @Param('id') blogId: string,
    @Body() approveBlogDto: ApproveBlogDto,
    @Req() req: Request,
  ): Promise<ApproveBlogResponseDto> {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin not authenticated');
    }
    return await this.blogService.approveBlog(blogId, approveBlogDto, adminId);
  }

  @Patch(':id/publish')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Publish a blog (Super Admin only)',
    description: 'Super admin can publish approved blogs. This makes them visible to end users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog published successfully',
    type: ApproveBlogResponseDto,
  })
  async publishBlog(
    @Param('id') blogId: string,
    @Req() req: Request,
  ): Promise<ApproveBlogResponseDto> {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin not authenticated');
    }
    return await this.blogService.publishBlog(blogId, adminId);
  }

  @Delete(':id')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Delete a blog (Content Ops - own blogs, Super Admin - any)',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog deleted successfully',
  })
  async deleteBlog(
    @Param('id') blogId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin not authenticated');
    }
    return await this.blogService.deleteBlog(blogId, adminId);
  }

  @Get('comments')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'List all comments with filters (Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: BlogCommentListResponseDto,
  })
  async listComments(
    @Query() query: BlogCommentListQueryDto,
  ): Promise<BlogCommentListResponseDto> {
    return await this.blogService.listComments(query);
  }

  @Patch('comments/:id/approve')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Approve or reject a comment (Super Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment approved/rejected successfully',
    type: ApproveBlogCommentResponseDto,
  })
  async approveComment(
    @Param('id') commentId: string,
    @Body() approveDto: ApproveBlogCommentDto,
    @Req() req: Request,
  ): Promise<ApproveBlogCommentResponseDto> {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin not authenticated');
    }
    return await this.blogService.approveComment(commentId, approveDto, adminId);
  }

  @Delete('comments/:id')
  @RequireAdminPermissions(AdminPermission.BLOG_MANAGEMENT)
  @ApiOperation({
    summary: 'Delete a comment (Super Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
  })
  async deleteComment(
    @Param('id') commentId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin not authenticated');
    }
    return await this.blogService.deleteComment(commentId, adminId);
  }
}

