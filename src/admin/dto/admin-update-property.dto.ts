import { ApiPropertyOptional, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreatePropertyStep1Dto } from '../../property/dto/create-property.dto';
import { CreatePropertyStep2Dto } from '../../property/dto/create-property-step2.dto';
import { CreatePropertyStep3Dto } from '../../property/dto/create-property-step3.dto';
import { CreatePropertyStep4Dto } from '../../property/dto/create-property-step4.dto';

const Step1Base = OmitType(CreatePropertyStep1Dto, [
  'propertyId',
  'status',
] as const);
const Step2Base = OmitType(CreatePropertyStep2Dto, ['propertyId'] as const);
const Step3Base = OmitType(CreatePropertyStep3Dto, ['propertyId'] as const);
const Step4Base = OmitType(CreatePropertyStep4Dto, ['propertyId'] as const);

class AdminEditablePropertyFields extends IntersectionType(
  IntersectionType(Step1Base, Step2Base),
  IntersectionType(Step3Base, Step4Base),
) {}

const ADMIN_PROPERTY_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'active',
  'inactive',
  'sold',
  'rented',
] as const;

export type AdminPropertyStatus = (typeof ADMIN_PROPERTY_STATUSES)[number];

export class AdminUpdatePropertyDto extends PartialType(
  AdminEditablePropertyFields,
) {
  @ApiPropertyOptional({
    description: 'Override property status',
    enum: ADMIN_PROPERTY_STATUSES,
    example: 'approved',
  })
  @IsOptional()
  @IsIn(ADMIN_PROPERTY_STATUSES)
  status?: AdminPropertyStatus;

  @ApiPropertyOptional({
    description: 'Override completion step (0-5)',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  completionStep?: number;

  @ApiPropertyOptional({
    description: 'Admin review comment override',
    example: 'Adjusted amenities as per documents',
  })
  @IsOptional()
  @IsString()
  adminReviewComment?: string;

  @ApiPropertyOptional({
    description: 'Custom admin review timestamp (ISO date string)',
    example: '2025-01-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  adminReviewedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Explicitly set the reviewing admin (defaults to requester)',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adminReviewerId?: string;
}


