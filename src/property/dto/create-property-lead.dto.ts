import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEmail, Matches } from 'class-validator';

export class CreatePropertyLeadDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'Lead name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number (with country code)',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phone: string;
}

export class CreatePropertyLeadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Lead ID' })
  leadId: string;

  @ApiProperty({ description: 'Message' })
  message: string;
}

