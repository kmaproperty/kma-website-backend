import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  ValidateNested,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyVerificationStatus } from '../entities/property-verification-request.entity';

export class RequestPropertyVerificationDto {
  @ApiProperty({
    description: 'Property ID to request verification for',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}

export class RequestPropertyVerificationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({
    description: 'Verification request ID',
    example: 'uuid-string',
  })
  verificationRequestId: string;

  @ApiProperty({
    description: 'Verification token (used in the verification link)',
    example: 'abc123def456...',
  })
  verificationToken: string;

  @ApiProperty({
    description: 'Verification link URL',
    example: 'https://example.com/verify-property/abc123def456...',
  })
  verificationLink: string;
}

export class LivePhotoDto {
  @ApiProperty({
    description: 'S3 file key for the live photo',
    example: 'uploads/1234567890-abc123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiPropertyOptional({
    description: 'View type of the image',
    example: 'Living Room',
  })
  @IsOptional()
  @IsString()
  view?: string;
}

export class LiveVideoDto {
  @ApiProperty({
    description: 'S3 file key for the live video',
    example: 'uploads/1234567890-xyz789.mp4',
  })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiPropertyOptional({
    description: 'Video format (e.g., mp4, mov)',
    example: 'mp4',
  })
  @IsOptional()
  @IsString()
  format?: string;
}

export class SubmitPropertyVerificationMediaDto {
  @ApiProperty({
    description: 'Verification token from the verification link',
    example: 'abc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @ApiProperty({
    description: 'Live photos of the property (minimum 2 required)',
    type: [LivePhotoDto],
    minItems: 2,
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 live photos are required' })
  @ArrayMaxSize(50, { message: 'Maximum 50 photos allowed' })
  @ValidateNested({ each: true })
  @Type(() => LivePhotoDto)
  livePhotos: LivePhotoDto[];

  @ApiPropertyOptional({
    description: 'Live videos of the property (optional)',
    type: [LiveVideoDto],
    maxItems: 5,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 videos allowed' })
  @ValidateNested({ each: true })
  @Type(() => LiveVideoDto)
  liveVideos?: LiveVideoDto[];

  @ApiProperty({
    description: 'Latitude coordinate of the location where media is being submitted',
    example: 28.4595,
  })
  @IsNumber()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the location where media is being submitted',
    example: 77.0266,
  })
  @IsNumber()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  @Type(() => Number)
  longitude: number;
}

export class SubmitPropertyVerificationMediaResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({
    description: 'Verification request ID',
    example: 'uuid-string',
  })
  verificationRequestId: string;
}

export class AdminPropertyVerificationListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: PropertyVerificationStatus,
  })
  @IsOptional()
  @IsEnum(PropertyVerificationStatus)
  status?: PropertyVerificationStatus;
}

export class PropertyVerificationRequestItemDto {
  @ApiProperty({ description: 'Verification request ID' })
  id: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Property title/name' })
  propertyTitle: string;

  @ApiProperty({ description: 'Requested by user ID' })
  requestedBy: string;

  @ApiProperty({ description: 'Requested by user name' })
  requestedByName: string | null;

  @ApiProperty({ description: 'Verification token' })
  verificationToken: string;

  @ApiProperty({ description: 'Status', enum: PropertyVerificationStatus })
  status: PropertyVerificationStatus;

  @ApiPropertyOptional({ description: 'Live photos count' })
  livePhotosCount?: number;

  @ApiPropertyOptional({ description: 'Live videos count' })
  liveVideosCount?: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Submitted at' })
  submittedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Reviewed by admin ID' })
  reviewedBy?: string | null;

  @ApiPropertyOptional({ description: 'Reviewed by admin username' })
  reviewedByName?: string | null;

  @ApiPropertyOptional({ description: 'Reviewed at' })
  reviewedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejectionReason?: string | null;
}

export class AdminPropertyVerificationListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of verification requests',
    type: [PropertyVerificationRequestItemDto],
  })
  data: PropertyVerificationRequestItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;
}

export class AdminPropertyVerificationDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Verification request details' })
  data: PropertyVerificationRequestItemDto & {
    livePhotos: Array<{
      fileKey: string;
      view?: string;
      uploadedAt: Date;
    }>;
    liveVideos: Array<{
      fileKey: string;
      format?: string;
      uploadedAt: Date;
    }>;
  };
}

export class AdminApprovePropertyVerificationDto {
  @ApiPropertyOptional({
    description: 'Optional comment',
    example: 'Live photos and videos verified successfully',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class AdminRejectPropertyVerificationDto {
  @ApiProperty({
    description: 'Rejection reason',
    example: 'Photos do not match the property location',
  })
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}

export class AdminPropertyVerificationActionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Verification request ID' })
  verificationRequestId: string;
}

