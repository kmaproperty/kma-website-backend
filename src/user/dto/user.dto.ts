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
