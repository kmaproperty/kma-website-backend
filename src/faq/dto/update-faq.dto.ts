import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFaqDto {
  @ApiPropertyOptional({ description: 'FAQ category', example: 'Getting Started' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'FAQ question' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ description: 'FAQ answer' })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({ description: 'Sort order for display' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the FAQ is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
