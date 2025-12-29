import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    type: 'string',
  })
  @IsString()
  @IsEmail()
  email: string;
}

export class CheckDuplicateEmailResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Email is available',
  })
  message: string;
}
