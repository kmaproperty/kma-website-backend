import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserIntent } from '../enum/user-intent.enum';

export class CreateOwnerDto {
  @ApiProperty({
    description: 'Owner name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Owner email address',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Owner phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be a valid international format (e.g., +1234567890)',
  })
  phone: string;

  @ApiProperty({
    description: 'User intent (SELL or RENT)',
    example: 'SELL',
    enum: UserIntent,
    required: false,
  })
  @IsEnum(UserIntent, { message: 'Intent must be either SELL or RENT' })
  @IsOptional()
  intent?: UserIntent;
}

export class CreateOwnerResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Owner account created successfully',
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
      phone: '+1234567890',
      role: 'OWNER',
      isActive: true,
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}
