import {
  Controller,
  Get,
  Post,
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
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import {
  BlogListResponseDto,
  BlogResponseDto,
} from './dto';
import {
  CreateBlogCommentDto,
  CreateBlogCommentResponseDto,
  BlogCommentResponseDto,
} from './dto/blog-comment.dto';

@ApiTags('Blogs')
@Controller('blogs')
export class EndUserBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List published blogs (Public)',
    description: 'Get list of published blogs with pagination and search. Available to all users.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'Mumbai',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    example: 'Real Estate',
  })
  @ApiResponse({
    status: 200,
    description: 'Published blogs retrieved successfully',
    type: BlogListResponseDto,
  })
  async listPublishedBlogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ): Promise<BlogListResponseDto> {
    return await this.blogService.listPublishedBlogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      category,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get published blog details (Public)',
    description: 'Get detailed information about a published blog. View count is automatically incremented.',
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
  @ApiResponse({
    status: 404,
    description: 'Blog not found or not published',
  })
  async getPublishedBlogById(@Param('id') blogId: string): Promise<BlogResponseDto> {
    return await this.blogService.getPublishedBlogById(blogId);
  }

  @Get(':id/comments')
  @Public()
  @ApiOperation({
    summary: 'Get comments for a blog (Public)',
    description: 'Get all approved comments and replies for a published blog.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: [BlogCommentResponseDto],
  })
  async getBlogComments(@Param('id') blogId: string): Promise<BlogCommentResponseDto[]> {
    return await this.blogService.listBlogComments(blogId);
  }

  @Post(':id/comments')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Add a comment to a blog (Public - Optional Auth)',
    description: 'Add a comment to a published blog. Authenticated users don\'t need to provide name/email. Guest users must provide name and email. Comments require approval before being visible.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully. It will be visible after approval.',
    type: CreateBlogCommentResponseDto,
  })
  async createComment(
    @Param('id') blogId: string,
    @Body() createCommentDto: Omit<CreateBlogCommentDto, 'blogId'>,
    @Req() req: Request,
  ): Promise<CreateBlogCommentResponseDto> {
    const userId = (req as any).user?.id || undefined;

    return await this.blogService.createComment(
      {
        ...createCommentDto,
        blogId,
      },
      userId,
    );
  }
}

