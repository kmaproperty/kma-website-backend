import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogCommentDto {
  @ApiProperty({
    description: 'Blog ID',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  blogId: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'Great article! Very informative.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID (for replies)',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string;

  @ApiPropertyOptional({
    description: 'Guest name (if not authenticated)',
    example: 'John Doe',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  guestName?: string;

  @ApiPropertyOptional({
    description: 'Guest email (if not authenticated)',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;
}

export class BlogCommentResponseDto {
  @ApiProperty({ description: 'Comment ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Blog ID', example: 'uuid-string' })
  blogId: string;

  @ApiPropertyOptional({ description: 'User ID (if authenticated user)' })
  userId?: string | null;

  @ApiPropertyOptional({ description: 'Guest name (if guest comment)' })
  guestName?: string | null;

  @ApiPropertyOptional({ description: 'Guest email (if guest comment)' })
  guestEmail?: string | null;

  @ApiProperty({ description: 'Comment content' })
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID (for replies)' })
  parentCommentId?: string | null;

  @ApiProperty({ description: 'Is approved', example: false })
  isApproved: boolean;

  @ApiPropertyOptional({ description: 'Approved by admin ID' })
  approvedById?: string | null;

  @ApiPropertyOptional({ description: 'Approval date' })
  approvedAt?: Date | null;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Replies to this comment',
    type: [BlogCommentResponseDto],
  })
  replies?: BlogCommentResponseDto[];
}

export class BlogCommentListQueryDto {
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
    description: 'Filter by approval status',
    example: true,
  })
  @IsOptional()
  isApproved?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by blog ID',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsOptional()
  blogId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class BlogCommentListResponseDto {
  @ApiProperty({ description: 'List of comments', type: [BlogCommentResponseDto] })
  items: BlogCommentResponseDto[];

  @ApiProperty({ description: 'Total count', example: 50 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total pages', example: 3 })
  totalPages: number;
}

export class CreateBlogCommentResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Comment added successfully' })
  message: string;

  @ApiProperty({ description: 'Comment data', type: BlogCommentResponseDto })
  comment: BlogCommentResponseDto;
}

export class ApproveBlogCommentDto {
  @ApiProperty({
    description: 'Approve or reject comment',
    example: true,
  })
  @IsNotEmpty()
  isApproved: boolean;
}

export class ApproveBlogCommentResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Comment approved successfully' })
  message: string;

  @ApiProperty({ description: 'Comment data', type: BlogCommentResponseDto })
  comment: BlogCommentResponseDto;
}

