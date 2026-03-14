import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateJoinUsDto {
  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'Email', example: 'john@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ description: 'Phone number', example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit number' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'State', example: 'Rajasthan' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Jaipur' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Message', example: 'I want to become a channel partner' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateJoinUsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Application submitted successfully' })
  message: string;

  @ApiProperty({ example: 'uuid-string' })
  enquiryId: string;
}
