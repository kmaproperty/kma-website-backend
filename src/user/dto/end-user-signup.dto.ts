import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EndUserSignupDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;
}

export class EndUserSignupResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'OTP sent successfully to your mobile number',
  })
  message: string;

  @ApiProperty({
    description: 'Phone number where OTP was sent',
    example: '9876543210',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code (only in development/staging)',
    example: '1234',
    required: false,
  })
  otp?: string;
}

export class EndUserVerifyOtpDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code received on mobile',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Matches(/^\d{4}$/, {
    message: 'OTP must be exactly 4 digits',
  })
  otp: string;
}

export class EndUserVerifyOtpResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Account created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
      role: 'END_USER',
      isActive: true,
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

export class EndUserLoginDto {
  @ApiProperty({
    description: 'User phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;
}

export class EndUserLoginResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'OTP sent successfully to your mobile number',
  })
  message: string;

  @ApiProperty({
    description: 'Phone number where OTP was sent',
    example: '9876543210',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code (only in development/staging)',
    example: '1234',
    required: false,
  })
  otp?: string;
}

export class EndUserVerifyLoginOtpDto {
  @ApiProperty({
    description: 'User phone number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code received on mobile',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Matches(/^\d{4}$/, {
    message: 'OTP must be exactly 4 digits',
  })
  otp: string;
}

export class EndUserVerifyLoginOtpResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
      role: 'END_USER',
      isActive: true,
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

export class EndUserProfileResponseDto {
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
      email: 'john.doe@example.com',
      phone: '9876543210',
      role: 'END_USER',
      isActive: true,
      phoneVerified: true,
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
    profileImage: string | null;
  };
}

export class EndUserEditProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}

export class EndUserEditProfileResponseDto {
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
      email: 'john.doe@example.com',
      phone: '9876543210',
      role: 'END_USER',
      isActive: true,
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
    profileImage: string | null;
  };
}

export class EndUserChangeMobileDto {
  @ApiProperty({
    description: 'New mobile number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;
}

export class EndUserChangeMobileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'OTP sent successfully to your new mobile number',
  })
  message: string;

  @ApiProperty({
    description: 'New phone number where OTP was sent',
    example: '9876543210',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code (only in development/staging)',
    example: '1234',
    required: false,
  })
  otp?: string;
}

export class EndUserVerifyChangeMobileOtpDto {
  @ApiProperty({
    description: 'New mobile number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[1-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code received on new mobile',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Matches(/^\d{4}$/, {
    message: 'OTP must be exactly 4 digits',
  })
  otp: string;
}

export class EndUserVerifyChangeMobileOtpResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Mobile number changed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user information',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
      role: 'END_USER',
      isActive: true,
    },
  })
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

export class CityItemDto {
  @ApiProperty({
    description: 'City ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'City name',
    example: 'Delhi',
  })
  name: string;

  @ApiProperty({
    description: 'City code',
    example: 'DEL',
  })
  code: string;

  @ApiProperty({
    description: 'State name',
    example: 'Delhi',
    required: false,
  })
  state?: string | null;

  @ApiProperty({
    description: 'City icon/image URL',
    example: 'https://example.com/icons/delhi.png',
    required: false,
  })
  iconUrl?: string | null;

  @ApiProperty({
    description: 'City latitude',
    example: 28.6139,
    required: false,
  })
  latitude?: number | null;

  @ApiProperty({
    description: 'City longitude',
    example: 77.2090,
    required: false,
  })
  longitude?: number | null;
}

export class EndUserCitiesQueryDto {
  @ApiPropertyOptional({
    description: 'Search query for city name',
    example: 'Delhi',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Latitude for location-based city detection',
    example: 28.6139,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for location-based city detection',
    example: 77.2090,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}

export class EndUserHomePageResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Featured/Popular cities',
    type: [CityItemDto],
  })
  featuredCities: CityItemDto[];

  @ApiProperty({
    description: 'Detected city based on search query or latitude/longitude (if provided)',
    type: CityItemDto,
    required: false,
  })
  detectedCity?: CityItemDto | null;
}

