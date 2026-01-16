import { ApiProperty } from '@nestjs/swagger';
import { AdminConfigurationResponseDto } from '../../admin/dto/admin-configuration.dto';

export class EndUserConfigurationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Admin configuration',
    type: AdminConfigurationResponseDto,
    nullable: true,
  })
  configuration: AdminConfigurationResponseDto | null;
}

