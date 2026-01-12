import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitRatingReviewDto {
  @ApiProperty({
    description: 'Rating (1.0 to 5.0)',
    example: 4.5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Review text',
    example: 'Great service! Very satisfied with KMA.',
  })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiProperty({
    description: 'Name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'OTP code for verification (required for non-logged in users)',
    example: '1234',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'OTP must be exactly 4 digits',
  })
  otp?: string;
}

export class SubmitRatingReviewResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Rating and review submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created rating and review ID',
    example: 'uuid-string',
  })
  ratingReviewId: string;
}

