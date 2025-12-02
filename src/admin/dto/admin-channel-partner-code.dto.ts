import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class AdminChannelPartnerCodeListQueryDto {
  @ApiPropertyOptional({
    description: 'Search channel partner codes by code (case insensitive)',
    example: 'CP001',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (max 100)',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AdminChannelPartnerCodeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminCreateChannelPartnerCodeDto {
  @ApiProperty({
    description: 'Channel partner code',
    example: 'CP001',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, { message: 'Code must be between 3 and 50 characters' })
  code: string;
}

export class AdminUpdateChannelPartnerCodeDto extends PartialType(
  AdminCreateChannelPartnerCodeDto,
) {}

