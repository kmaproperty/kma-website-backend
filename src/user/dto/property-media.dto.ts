import { ApiProperty } from '@nestjs/swagger';

export class PropertyMediaSummaryDto {
  @ApiProperty({ description: 'Property ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Property name', example: 'Property name lorem Ipsum' })
  name: string;

  @ApiProperty({ description: 'Price display', example: '₹85,000/month' })
  price: string;

  @ApiProperty({ description: 'Location address', example: 'Madhya Pradesh, India, 455001' })
  address: string;
}

export class PropertyMediaPhotoItemDto {
  @ApiProperty({ description: 'Image file key/URL', example: 'uploads/property-image.jpg' })
  fileKey: string;

  @ApiProperty({ description: 'View/category type', example: 'Exterior' })
  view: string;

  @ApiProperty({ description: 'Is cover image', example: true })
  isCoverImage: boolean;

  @ApiProperty({ description: 'Verified (from property verification)', example: false })
  isVerified: boolean;
}

export class PropertyMediaCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Cover Image' })
  name: string;

  @ApiProperty({
    description: 'Photos in this category',
    type: [PropertyMediaPhotoItemDto],
  })
  photos: PropertyMediaPhotoItemDto[];
}

export class PropertyMediaVideoItemDto {
  @ApiProperty({ description: 'Video file key/URL', example: 'uploads/property-video.mp4' })
  fileKey: string;

  @ApiProperty({ description: 'Video format', example: 'mp4' })
  format: string;

  @ApiProperty({ description: 'Verified (from property verification)', example: false })
  isVerified: boolean;
}

export class GetPropertyMediaResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Property summary for gallery header',
    type: PropertyMediaSummaryDto,
  })
  property: PropertyMediaSummaryDto;

  @ApiProperty({ description: 'Total photo count', example: 40 })
  photoCount: number;

  @ApiProperty({ description: 'Total video count', example: 2 })
  videoCount: number;

  @ApiProperty({
    description: 'Photos grouped by category (Cover Image, Exterior, Bedroom, etc.)',
    type: [PropertyMediaCategoryDto],
  })
  categories: PropertyMediaCategoryDto[];

  @ApiProperty({
    description: 'All property videos',
    type: [PropertyMediaVideoItemDto],
  })
  videos: PropertyMediaVideoItemDto[];
}
