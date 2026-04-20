import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ description: 'FAQ category', example: 'Getting Started' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiProperty({ description: 'FAQ question', example: 'Who can post a property on KMA?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'FAQ answer', example: 'Property Owners and verified Channel Partners can list properties and projects.' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the FAQ is active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
