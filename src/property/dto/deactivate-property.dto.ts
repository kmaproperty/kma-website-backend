import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { DeactivationReason } from '../enum/property-status.enum';

export class DeactivatePropertyDto {
  @ApiProperty({
    description: 'Property ID to deactivate',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsUUID(4, { message: 'propertyId must be a valid UUID' })
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'Reason for deactivation',
    enum: DeactivationReason,
    example: DeactivationReason.SOLD,
  })
  @IsEnum(DeactivationReason, {
    message: 'deactivationReason must be one of: sold, rented, hold, owner_request',
  })
  @IsNotEmpty()
  deactivationReason: DeactivationReason;
}

export class DeactivatePropertyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({
    description: 'Property status after deactivation',
    enum: ['deactivated'],
  })
  status: string;

  @ApiProperty({
    description: 'Deactivation reason',
    enum: DeactivationReason,
  })
  deactivationReason: DeactivationReason;
}

