import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '../entities/blog.entity';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Blog title',
    example: 'Top 10 Most Expensive Localities in Mumbai',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: 'Blog content (HTML or markdown)',
    example: '<p>Mumbai is a diverse city...</p>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Short excerpt/summary of the blog',
    example: 'Discover the most expensive localities in Mumbai and what makes them special.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Featured image URL',
    example: 'https://example.com/blog-image.jpg',
  })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiPropertyOptional({
    description: 'Author name (if different from admin username)',
    example: 'Admin',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional({
    description: 'Blog category',
    example: 'Real Estate',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  category?: string;

  @ApiPropertyOptional({
    description: 'Tags for the blog',
    example: ['RealEstate', 'HomeLoans', 'DreamHome'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Top 10 Most Expensive Localities in Mumbai | KMA',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Discover the most expensive localities in Mumbai...',
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'Allow comments on this blog',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  allowComments?: boolean;

  @ApiPropertyOptional({
    description: 'Initial status (default: draft)',
    enum: BlogStatus,
    example: BlogStatus.DRAFT,
  })
  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;
}

export class UpdateBlogDto {
  @ApiPropertyOptional({
    description: 'Blog title',
    example: 'Top 10 Most Expensive Localities in Mumbai',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({
    description: 'Blog content (HTML or markdown)',
    example: '<p>Mumbai is a diverse city...</p>',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Short excerpt/summary of the blog',
    example: 'Discover the most expensive localities in Mumbai...',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Featured image URL',
    example: 'https://example.com/blog-image.jpg',
  })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiPropertyOptional({
    description: 'Author name',
    example: 'Admin',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional({
    description: 'Blog category',
    example: 'Real Estate',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  category?: string;

  @ApiPropertyOptional({
    description: 'Tags for the blog',
    example: ['RealEstate', 'HomeLoans'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Top 10 Most Expensive Localities in Mumbai | KMA',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Discover the most expensive localities...',
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'Allow comments on this blog',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  allowComments?: boolean;
}

export class ApproveBlogDto {
  @ApiPropertyOptional({
    description: 'Rejection reason (if rejecting)',
    example: 'Content does not meet quality standards',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class BlogListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: BlogStatus,
  })
  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;

  @ApiPropertyOptional({
    description: 'Search by title or content',
    example: 'Mumbai',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'Real Estate',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by author ID',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  authorId?: string;
}

export class BlogResponseDto {
  @ApiProperty({ description: 'Blog ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Blog title', example: 'Top 10 Most Expensive Localities in Mumbai' })
  title: string;

  @ApiProperty({ description: 'Blog content', example: '<p>Mumbai is a diverse city...</p>' })
  content: string;

  @ApiPropertyOptional({ description: 'Blog excerpt', example: 'Discover the most expensive...' })
  excerpt?: string | null;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  featuredImage?: string | null;

  @ApiPropertyOptional({ description: 'Author name' })
  author?: string | null;

  @ApiPropertyOptional({ description: 'Author admin ID' })
  authorId?: string | null;

  @ApiProperty({ description: 'Blog status', enum: BlogStatus })
  status: BlogStatus;

  @ApiPropertyOptional({ description: 'Approved by admin ID' })
  approvedById?: string | null;

  @ApiPropertyOptional({ description: 'Approval date' })
  approvedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejectionReason?: string | null;

  @ApiPropertyOptional({ description: 'Published date' })
  publishedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  tags?: string[] | null;

  @ApiPropertyOptional({ description: 'Category' })
  category?: string | null;

  @ApiPropertyOptional({ description: 'Meta title' })
  metaTitle?: string | null;

  @ApiPropertyOptional({ description: 'Meta description' })
  metaDescription?: string | null;

  @ApiProperty({ description: 'View count', example: 0 })
  viewCount: number;

  @ApiProperty({ description: 'Allow comments', example: true })
  allowComments: boolean;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

export class BlogListResponseDto {
  @ApiProperty({ description: 'List of blogs', type: [BlogResponseDto] })
  items: BlogResponseDto[];

  @ApiProperty({ description: 'Total count', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total pages', example: 5 })
  totalPages: number;
}

export class CreateBlogResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Blog created successfully' })
  message: string;

  @ApiProperty({ description: 'Blog data', type: BlogResponseDto })
  blog: BlogResponseDto;
}

export class UpdateBlogResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Blog updated successfully' })
  message: string;

  @ApiProperty({ description: 'Updated blog data', type: BlogResponseDto })
  blog: BlogResponseDto;
}

export class ApproveBlogResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Blog approved successfully' })
  message: string;

  @ApiProperty({ description: 'Blog data', type: BlogResponseDto })
  blog: BlogResponseDto;
}

