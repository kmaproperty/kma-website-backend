import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEndUserDto {
  @ApiProperty({
    description: 'End user name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'End user email address',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'End user phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;
}

export class CreateEndUserResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'End user account created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User ID',
    example: 'uuid-string',
  })
  userId: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      role: 'END_USER',
      isActive: true,
    },
  })
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

