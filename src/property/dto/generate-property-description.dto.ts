import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class GeneratePropertyDescriptionDto {
  @ApiProperty({
    description: 'Property ID to generate description for',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}

export class GeneratePropertyDescriptionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Generated property description',
    example: 'Well-maintained 2 BHK Semi-Furnished apartment in Green Park Society, Sector 15, Gurgaon. Features include 2 bedrooms, 2 bathrooms, 2 balconies, reserved parking (1 covered, 1 open), power backup, and modern amenities.',
  })
  description: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;
}

