import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckUserDto {
  @ApiProperty({
    description: 'Phone number to check',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
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
