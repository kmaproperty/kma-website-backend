import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { JobApplicationStatus } from '../entities/job-application.entity';

export class UpdateJobApplicationStatusDto {
  @ApiPropertyOptional({ enum: JobApplicationStatus })
  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus;
}
