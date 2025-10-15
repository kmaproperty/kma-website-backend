import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckUserDto {
  @ApiProperty({
    description: 'Phone number to check',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phone: string;
}

export class CheckUserResponseDto {
  @ApiProperty({
    description: 'Whether user exists',
    example: true,
  })
  exists: boolean;

  @ApiProperty({
    description: 'User status message',
    example: 'User found',
  })
  message: string;
}
