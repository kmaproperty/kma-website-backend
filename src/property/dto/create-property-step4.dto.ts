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
}

export enum VideoFormat {
  MPEG = 'MPEG',
  FLV = 'FLV',
  MOV = 'MOV',
  SWF = 'SWF',
}

export class PropertyVideoDto {
  @ApiProperty({ description: 'S3 file key for the video', example: 'uploads/1234567890-xyz789.mp4' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty({ description: 'Video format', enum: VideoFormat, example: VideoFormat.MPEG })
  @IsEnum(VideoFormat)
  format: VideoFormat;
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

