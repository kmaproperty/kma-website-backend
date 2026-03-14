import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AdminCreateHelpCenterFaqDto {
  @ApiProperty({ description: 'FAQ question', example: 'How do I list my property?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'FAQ answer', example: 'You can list your property by...' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({ description: 'Category', example: 'Property Listing' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class AdminUpdateHelpCenterFaqDto {
  @ApiPropertyOptional({ description: 'FAQ question' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ description: 'FAQ answer' })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
