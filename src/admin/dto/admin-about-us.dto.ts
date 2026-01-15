import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminAboutUsListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
  })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  limit?: number = 20;
}

export class AdminAboutUsResponseDto {
  @ApiProperty({ description: 'About Us ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({
    description: 'About Us heading',
    example: 'About KMA',
  })
  heading: string;

  @ApiProperty({
    description: 'About Us description',
    example: 'KMA is a leading real estate platform...',
  })
  description: string;

  @ApiProperty({ description: 'Created at', example: '2025-01-20T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-01-20T10:15:00.000Z' })
  updatedAt: Date;
}

export class AdminCreateAboutUsDto {
  @ApiProperty({
    description: 'About Us heading',
    example: 'About KMA',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  heading: string;

  @ApiProperty({
    description: 'About Us description',
    example: 'KMA is a leading real estate platform that connects buyers, sellers, and real estate professionals.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class AdminUpdateAboutUsDto {
  @ApiPropertyOptional({
    description: 'About Us heading',
    example: 'About KMA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  heading?: string;

  @ApiPropertyOptional({
    description: 'About Us description',
    example: 'KMA is a leading real estate platform that connects buyers, sellers, and real estate professionals.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AdminAboutUsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of About Us entries',
    type: [AdminAboutUsResponseDto],
  })
  data: AdminAboutUsResponseDto[];

  @ApiProperty({ description: 'Total count', example: 1 })
  total: number;

  @ApiProperty({ description: 'Page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;
}

