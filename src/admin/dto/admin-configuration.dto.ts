import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, IsPhoneNumber, IsEmail, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminConfigurationResponseDto {
  @ApiProperty({ description: 'Configuration ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({
    description: 'Mobile app available flag',
    example: true,
  })
  mobileAppAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Configuration description',
    example: 'Company description',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'contact@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main St, City, State, ZIP',
    nullable: true,
  })
  address: string | null;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 40.7128,
    nullable: true,
  })
  latitude: number | null;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: -74.0060,
    nullable: true,
  })
  longitude: number | null;

  @ApiPropertyOptional({
    description: 'Instagram link',
    example: 'https://instagram.com/company',
    nullable: true,
  })
  instagramLink: string | null;

  @ApiPropertyOptional({
    description: 'Facebook link',
    example: 'https://facebook.com/company',
    nullable: true,
  })
  fbLink: string | null;

  @ApiPropertyOptional({
    description: 'YouTube link',
    example: 'https://youtube.com/company',
    nullable: true,
  })
  youtubeLink: string | null;

  @ApiPropertyOptional({
    description: 'Twitter link',
    example: 'https://twitter.com/company',
    nullable: true,
  })
  twitterLink: string | null;

  @ApiProperty({ description: 'Created at', example: '2025-01-20T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-01-20T10:15:00.000Z' })
  updatedAt: Date;
}

export class AdminCreateConfigurationDto {
  @ApiProperty({
    description: 'Mobile app available flag',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  mobileAppAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Configuration description',
    example: 'Company description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'contact@example.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main St, City, State, ZIP',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 40.7128,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: -74.0060,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Instagram link',
    example: 'https://instagram.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instagramLink?: string;

  @ApiPropertyOptional({
    description: 'Facebook link',
    example: 'https://facebook.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fbLink?: string;

  @ApiPropertyOptional({
    description: 'YouTube link',
    example: 'https://youtube.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  youtubeLink?: string;

  @ApiPropertyOptional({
    description: 'Twitter link',
    example: 'https://twitter.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  twitterLink?: string;
}

export class AdminUpdateConfigurationDto {
  @ApiPropertyOptional({
    description: 'Mobile app available flag',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  mobileAppAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Configuration description',
    example: 'Company description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'contact@example.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main St, City, State, ZIP',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 40.7128,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: -74.0060,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Instagram link',
    example: 'https://instagram.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instagramLink?: string;

  @ApiPropertyOptional({
    description: 'Facebook link',
    example: 'https://facebook.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fbLink?: string;

  @ApiPropertyOptional({
    description: 'YouTube link',
    example: 'https://youtube.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  youtubeLink?: string;

  @ApiPropertyOptional({
    description: 'Twitter link',
    example: 'https://twitter.com/company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  twitterLink?: string;
}

export class AdminConfigurationSingleResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Admin configuration',
    type: AdminConfigurationResponseDto,
    nullable: true,
  })
  data: AdminConfigurationResponseDto | null;
}

// End User DTOs
export class EndUserConfigurationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Admin configuration',
    type: AdminConfigurationResponseDto,
    nullable: true,
  })
  configuration: AdminConfigurationResponseDto | null;
}

