import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateSalesEnquiryDto {
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Email', example: 'john@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ description: 'Phone number', example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit number' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Message or enquiry details', example: 'Looking for commercial property in Noida' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateSalesEnquiryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Sales enquiry submitted successfully. We will call you back shortly.' })
  message: string;

  @ApiProperty({ example: 'uuid-string' })
  enquiryId: string;
}
