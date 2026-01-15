import { ApiProperty } from '@nestjs/swagger';

export class PropertyTypeExploreItemDto {
  @ApiProperty({
    description: 'Property type ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Property type name',
    example: 'Villas',
  })
  name: string;

  @ApiProperty({
    description: 'Property type code',
    example: 'res-sale-villa',
  })
  code: string;

  @ApiProperty({
    description: 'Number of active properties for this type',
    example: 28,
  })
  propertyCount: number;
}

export class PropertyTypeExploreResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of property types with their property counts',
    type: [PropertyTypeExploreItemDto],
  })
  propertyTypes: PropertyTypeExploreItemDto[];
}

