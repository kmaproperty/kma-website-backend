import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export enum ImageView {
  LIVING_ROOM = 'Living Room',
  BEDROOM = 'Bedroom',
  KITCHEN = 'Kitchen',
  BATHROOM = 'Bathroom',
  BALCONY = 'Balcony',
  EXTERIOR = 'Exterior',
  PARKING = 'Parking',
  AMENITIES = 'Amenities',
  OTHER = 'Other',
}

export class PropertyPhotoDto {
  @ApiProperty({ description: 'S3 file key for the photo', example: 'uploads/1234567890-abc123.jpg' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty({ description: 'View type of the image', enum: ImageView, example: ImageView.LIVING_ROOM })
  @IsEnum(ImageView)
  view: ImageView;

  @ApiPropertyOptional({ description: 'Is this the cover image?', default: false })
  @IsOptional()
  isCoverImage?: boolean;

  @ApiPropertyOptional({ description: 'Latitude coordinate of the photo location', example: 28.709919 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate of the photo location', example: 77.090057 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class PropertyVideoDto {
  @ApiProperty({ description: 'S3 file key for the video', example: 'uploads/1234567890-xyz789.mp4' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty({ description: 'Video format (e.g., mp4, mov)', example: 'mp4' })
  @IsString()
  @IsNotEmpty()
  format: string;
}

export class CreatePropertyStep4Dto {
  @ApiProperty({ description: 'Existing property ID to update', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ 
    description: 'Property photos (minimum 2 images required for cover selection)',
    type: [PropertyPhotoDto],
    minItems: 2,
    maxItems: 50
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 photos are required' })
  @ArrayMaxSize(50, { message: 'Maximum 50 photos allowed' })
  @ValidateNested({ each: true })
  @Type(() => PropertyPhotoDto)
  photos: PropertyPhotoDto[];

  @ApiPropertyOptional({ 
    description: 'Property videos',
    type: [PropertyVideoDto],
    maxItems: 5
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 videos allowed' })
  @ValidateNested({ each: true })
  @Type(() => PropertyVideoDto)
  videos?: PropertyVideoDto[];
}

