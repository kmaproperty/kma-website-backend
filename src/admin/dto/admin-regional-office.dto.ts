import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminCreateRegionalOfficeDto {
  @ApiProperty({ description: 'City name', example: 'Noida' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  city: string;

  @ApiPropertyOptional({ description: 'Office address', example: 'Tower A, Sector 62' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Contact person name', example: 'Rahul Mehta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contactPerson: string;

  @ApiPropertyOptional({ description: 'Designation', example: 'Sales Consultant' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({ description: 'Phone number', example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Email', example: 'rahul@kma.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class AdminUpdateRegionalOfficeDto {
  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({ description: 'Office address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Contact person name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Designation' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
