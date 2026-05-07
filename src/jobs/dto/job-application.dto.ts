import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { JobApplicationStatus } from '../entities/job-application.entity';

export class CreateJobApplicationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(140)
  fullName: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverLetter?: string;
}

export class UpdateJobApplicationStatusDto {
  @ApiPropertyOptional({ enum: JobApplicationStatus })
  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus;
}
