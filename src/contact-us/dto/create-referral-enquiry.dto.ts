import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateReferralEnquiryDto {
  @ApiProperty({ description: 'Referrer full name', example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  referrerName: string;

  @ApiProperty({ description: 'Referrer mobile number', example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, { message: 'Referrer phone must be a valid 10-digit number' })
  referrerPhone: string;

  @ApiProperty({ description: 'Client name', example: 'Amit Verma' })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ description: 'Client mobile number', example: '9988776655' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, { message: 'Client mobile must be a valid 10-digit number' })
  clientMobile: string;

  @ApiProperty({ description: 'Property type', example: 'Buy', enum: ['Buy', 'Sell', 'Rent'] })
  @IsString()
  @IsIn(['Buy', 'Sell', 'Rent'])
  propertyType: 'Buy' | 'Sell' | 'Rent';

  @ApiPropertyOptional({ description: 'Preferred area/city', example: 'Gurgaon' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Channel partner identifier', example: 'CP-10234' })
  @IsOptional()
  @IsString()
  channelPartnerId?: string;
}

export class CreateReferralEnquiryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Referral submitted successfully' })
  message: string;
}
