import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin username',
    example: 'admin',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  username: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'StrongPassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}

export class AdminLoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Admin profile data',
    example: {
      id: 'uuid-string',
      username: 'admin',
    },
  })
  admin: {
    id: string;
    username: string;
  };
}

