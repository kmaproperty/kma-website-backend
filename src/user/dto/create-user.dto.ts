import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.OWNER,
  })
  @IsEnum(UserRole, {
    message: 'Role must be one of: OWNER, CHANNEL_PARTNER, ADMIN',
  })
  role: UserRole;

  @ApiProperty({
    description:
      'Channel partner code (required only for CHANNEL_PARTNER role)',
    example: 'CP001',
    required: false,
  })
  @IsOptional()
  @IsString()
  channelPartnerCode?: string;
}

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'User created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created user ID',
    example: 'uuid-string',
  })
  userId: string;
}
