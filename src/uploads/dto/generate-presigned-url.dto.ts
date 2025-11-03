import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsIn, Min, Max } from 'class-validator';

export class GeneratePresignedUrlDto {
  @ApiProperty({
    description: 'Name of the file (e.g., my-image.jpg)',
    example: 'my-image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  contentType: string;

  @ApiProperty({
    description: 'Optional folder path in S3 (default: uploads)',
    example: 'properties',
    required: false,
  })
  @IsString()
  @IsOptional()
  folder?: string;

  @ApiProperty({
    description: 'URL expiration time in seconds (default: 3600, min: 60, max: 36000)',
    example: 3600,
    required: false,
    minimum: 60,
    maximum: 36000,
  })
  @IsOptional()
  @Min(60)
  @Max(36000)
  expiresIn?: number;
}

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'Presigned URL for uploading the file',
    example: 'https://bucket.s3.amazonaws.com/uploads/filename.jpg?signature=...',
  })
  url: string;

  @ApiProperty({
    description: 'S3 key where the file will be stored',
    example: 'uploads/timestamp-randomstring.jpg',
  })
  key: string;

  @ApiProperty({
    description: 'URL expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;
}

