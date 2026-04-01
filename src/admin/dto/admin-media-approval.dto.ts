import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsArray, IsIn, IsOptional } from 'class-validator';

export class AdminApproveMediaDto {
  @ApiProperty({
    description: 'File key of the media item to approve',
    example: 'uploads/1234567890-abc123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileKey: string;
}

export class AdminRejectMediaDto {
  @ApiProperty({
    description: 'File key of the media item to reject',
    example: 'uploads/1234567890-abc123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty({
    description: 'Reason for rejecting the media',
    example: 'Image is blurry and does not clearly show the property',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export class AdminBulkMediaApprovalDto {
  @ApiProperty({
    description: 'Array of file keys to approve',
    example: ['uploads/1234567890-abc123.jpg', 'uploads/1234567890-xyz789.mp4'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  fileKeys: string[];
}

export class AdminMediaApprovalResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Media approved successfully' })
  message: string;

  @ApiProperty({ example: 'uploads/1234567890-abc123.jpg' })
  fileKey: string;

  @ApiProperty({ example: 'approved', enum: ['approved', 'rejected'] })
  approvalStatus: string;

  @ApiPropertyOptional({ example: 'Image is blurry' })
  rejectionReason?: string;
}
