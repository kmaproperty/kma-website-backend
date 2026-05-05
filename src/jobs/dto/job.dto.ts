import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApplyType, ApprovalStatus, JobStatus } from '../entities/job.entity';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @MaxLength(180)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  companyName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  jobType?: string;



  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  openingsCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workMode?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;





  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiProperty({ type: [String], description: 'Multiple job category IDs' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  categoryIds: string[];

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;





  @ApiPropertyOptional({ enum: ApprovalStatus })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({ enum: ApplyType })
  @IsOptional()
  @IsEnum(ApplyType)
  applyType?: ApplyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applyLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  minExperienceYears?: number;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateJobDto) => o.maxExperienceYears !== undefined)
  @IsInt()
  @Min(0)
  maxExperienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experienceLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  minimumQualification?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryMin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryMax?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  salaryVisibility?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  urgentHiring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hrName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hrMobileNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo?: string;
}

export class UpdateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  jobType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  openingsCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workMode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiPropertyOptional({ type: [String], description: 'Multiple job category IDs' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ enum: ApprovalStatus })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({ enum: ApplyType })
  @IsOptional()
  @IsEnum(ApplyType)
  applyType?: ApplyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applyLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  minExperienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  maxExperienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experienceLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  minimumQualification?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryMin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryMax?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  salaryVisibility?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  urgentHiring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hrName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hrMobileNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo?: string;
}
