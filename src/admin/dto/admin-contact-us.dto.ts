import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, Min, IsIn, IsInt } from 'class-validator';

export class AdminContactUsListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by name, email, or phone number',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ContactUsResponseDto {
  @ApiProperty({ description: 'Contact ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastName?: string | null;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@example.com' })
  email?: string | null;

  @ApiProperty({ description: 'Phone number', example: '9876543210' })
  phoneNumber: string;

  @ApiProperty({ description: 'Query/Message', example: 'I would like to know more...' })
  message: string;

  @ApiProperty({ description: 'Created at', example: '2025-01-20T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-01-20T10:15:00.000Z' })
  updatedAt: Date;
}

export class AdminContactUsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of contact us submissions',
    type: [ContactUsResponseDto],
  })
  data: ContactUsResponseDto[];

  @ApiProperty({ description: 'Total count', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;
}

export class AdminContactUsKmaQueryListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by name, email, or phone number',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ContactUsKmaQueryResponseDto {
  @ApiProperty({ description: 'Query ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Phone number', example: '9876543210' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@example.com' })
  email?: string | null;

  @ApiPropertyOptional({
    description: 'End user ID (if logged in)',
    example: 'uuid-string',
  })
  endUserId?: string | null;

  @ApiPropertyOptional({
    description: 'End user details (if logged in)',
    example: {
      id: 'uuid-string',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
    },
  })
  endUser?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
  } | null;

  @ApiProperty({ description: 'Created at', example: '2025-01-20T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-01-20T10:15:00.000Z' })
  updatedAt: Date;
}

export class AdminContactUsKmaQueryListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'List of contact us KMA queries',
    type: [ContactUsKmaQueryResponseDto],
  })
  data: ContactUsKmaQueryResponseDto[];

  @ApiProperty({ description: 'Total count', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;
}

export class AdminReferralListQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  channelPartnerId?: string;

  @IsOptional()
  @IsString()
  referrerSearch?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  statuses?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Buy', 'Sell', 'Rent'])
  propertyType?: 'Buy' | 'Sell' | 'Rent';
}

export class AdminReferralItemDto {
  id: string;
  referrerName: string;
  referrerUniqueId: string;
  clientName: string;
  clientMobile: string;
  channelPartnerId: string | null;
  channelPartnerName: string;
  propertyType: 'Buy' | 'Sell' | 'Rent';
  location: string | null;
  status: 'Pending' | 'In Process' | 'Deal Closed';
  coinsCredited: number;
  submittedAt: Date;
}

export class AdminReferralListResponseDto {
  success: boolean;
  data: AdminReferralItemDto[];
  total: number;
  page: number;
  limit: number;
}

export class AdminReferralUpdateDto {
  @IsOptional()
  @IsString()
  @IsIn(['Pending', 'In Process', 'Deal Closed'])
  status?: 'Pending' | 'In Process' | 'Deal Closed';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  coinsCredited?: number;

  @IsOptional()
  @IsString()
  coinsOverrideReason?: string;
}

