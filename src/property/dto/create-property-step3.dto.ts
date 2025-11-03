import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
  ArrayMaxSize,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum AdditionalRoomType {
  POOJA_ROOM = 'Pooja Room',
  SERVANT_ROOM = 'Servant Room',
  STUDY_ROOM = 'Study Room',
  EXTRA_ROOM = 'Extra Room',
}

export enum PowerBackupType {
  NONE = 'No Back-up',
  AVAILABLE = 'Available',
}

export enum FurnishType {
  FURNISHED = 'Furnished',
  SEMI_FURNISHED = 'Semi-Furnished',
  UNFURNISHED = 'Unfurnished',
}

export class FurnishingCountDto {
  @ApiProperty({ type: String })
  @IsString()
  item: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  count: number;
}

export class CreatePropertyStep3Dto {
  @ApiProperty({ description: 'Existing property ID to update', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiPropertyOptional({ description: 'Additional rooms', enum: AdditionalRoomType, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsEnum(AdditionalRoomType, { each: true })
  additionalRooms?: AdditionalRoomType[];

  @ApiPropertyOptional({ description: 'Covered reserved parking count (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  reservedParkingCovered?: number;

  @ApiPropertyOptional({ description: 'Open reserved parking count (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  reservedParkingOpen?: number;

  @ApiPropertyOptional({ description: 'Power back-up', enum: PowerBackupType })
  @IsOptional()
  @IsEnum(PowerBackupType)
  powerBackup?: PowerBackupType;

  @ApiPropertyOptional({ description: 'Furnish type', enum: FurnishType })
  @IsOptional()
  @IsEnum(FurnishType)
  furnishType?: FurnishType;

  @ApiPropertyOptional({ description: 'Furnishings with counts (0-100 each)', isArray: true, type: () => FurnishingCountDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FurnishingCountDto)
  furnishingsCounts?: FurnishingCountDto[];

  @ApiPropertyOptional({ description: 'Amenities selection', isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Property description (AI generated/edited)' })
  @IsOptional()
  @IsString()
  propertyDescription?: string;

  @ApiPropertyOptional({ description: 'Water source', enum: ['Municipal Supply', 'BoreWell/ Underground', 'other'] })
  @IsOptional()
  @IsEnum(['Municipal Supply', 'BoreWell/ Underground', 'other'])
  waterSource?: 'Municipal Supply' | 'BoreWell/ Underground' | 'other';

  @ApiPropertyOptional({ description: 'Lift availability (Yes/No)' })
  @IsOptional()
  isLiftAvailable?: boolean;
}
