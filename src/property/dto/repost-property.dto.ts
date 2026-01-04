import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class RepostPropertyDto {
  @ApiProperty({
    description: 'Property ID to repost',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsUUID(4, { message: 'propertyId must be a valid UUID' })
  @IsNotEmpty()
  propertyId: string;
}

export class RepostPropertyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({
    description: 'Property status after repost',
    enum: ['pending_review'],
  })
  status: string;
}

