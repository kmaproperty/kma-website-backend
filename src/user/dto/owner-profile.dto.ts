import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserIntent } from '../enum/user-intent.enum';

export class OwnerProfileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      role: 'OWNER',
      isActive: true,
      phoneVerified: true,
      intent: 'SELL',
      city: 'Mumbai',
      profileImage: 'https://example.com/profile.jpg',
    },
  })
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
    phoneVerified: boolean;
    intent: UserIntent | null;
    city: string | null;
    profileImage: string | null;
  };
}

export class OwnerEditProfileDto {
  @ApiProperty({
    description: 'Owner name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Owner email address',
    example: 'john@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User intent (SELL or RENT)',
    example: 'SELL',
    enum: UserIntent,
    required: false,
  })
  @IsEnum(UserIntent, { message: 'Intent must be either SELL or RENT' })
  @IsOptional()
  intent?: UserIntent;

  @ApiProperty({
    description: 'City where the owner operates',
    example: 'Mumbai',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}

export class OwnerEditProfileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Profile updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      role: 'OWNER',
      isActive: true,
      intent: 'SELL',
      city: 'Mumbai',
      profileImage: 'https://example.com/profile.jpg',
    },
  })
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
    intent: UserIntent | null;
    city: string | null;
    profileImage: string | null;
  };
}

