import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelPartnerCodeDto {
  @ApiProperty({
    description: 'Channel partner code',
    example: 'CP001',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, { message: 'Code must be between 3 and 50 characters' })
  code: string;
}

export class ValidateChannelPartnerCodeQueryDto {
  @ApiProperty({
    description: 'Channel partner code to validate',
    example: 'CP001',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, { message: 'Code must be between 3 and 50 characters' })
  code: string;
}

export class ValidateChannelPartnerCodeResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Whether the provided code is valid',
    example: true,
  })
  valid: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Channel partner code is valid',
  })
  message: string;
}

export class ChannelPartnerCodeResponseDto {
  @ApiProperty({
    description: 'Channel partner code ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Channel partner code',
    example: 'CP001',
  })
  code: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-01-11T10:30:00.000Z',
  })
  createdAt: Date;
}

export class CreateChannelPartnerCodeResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Channel partner code created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created channel partner code',
    type: ChannelPartnerCodeResponseDto,
  })
  data: ChannelPartnerCodeResponseDto;
}

export class ListChannelPartnerCodesResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Channel partner codes retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of channel partner codes',
    type: [ChannelPartnerCodeResponseDto],
  })
  data: ChannelPartnerCodeResponseDto[];
}
