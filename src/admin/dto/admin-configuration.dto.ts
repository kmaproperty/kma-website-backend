import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, IsPhoneNumber, MaxLength } from 'class-validator';
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

