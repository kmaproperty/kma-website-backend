import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class UpgradeToChannelPartnerDto {
  @ApiProperty({ description: 'Valid channel partner code', example: 'CP001' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  channelPartnerCode: string;
}

export class UpgradeToChannelPartnerResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Upgraded to CHANNEL_PARTNER successfully' })
  message: string;
}


