import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ResetPropertyDto {
  @ApiProperty({
    description: 'Property ID whose data should be cleared',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsUUID(4, { message: 'propertyId must be a valid UUID' })
  propertyId: string;
}

