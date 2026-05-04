import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JobsService } from './jobs.service';
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { RequireAdminPermissions } from '../admin/decorators/admin-permissions.decorator';
import { AdminPermission } from '../admin/enum/admin-permission.enum';
import { CreateJobCategoryDto, UpdateJobCategoryDto } from './dto/job-category.dto';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { UpdateJobApplicationStatusDto } from './dto/job-application.dto';

@ApiTags('Admin - Jobs')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, AdminPermissionsGuard)
@RequireAdminPermissions(AdminPermission.JOB_MANAGEMENT)
@Controller('admin')
export class JobsAdminController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('job-categories')
  @ApiOperation({ summary: 'List all job categories' })
  listCategories() {
    return this.jobsService.listCategories();
  }

  @Post('job-categories')
  @ApiOperation({ summary: 'Create a job category' })
  createCategory(@Body() dto: CreateJobCategoryDto) {
    return this.jobsService.createCategory(dto);
  }

  @Patch('job-categories/:id')
  @ApiOperation({ summary: 'Update a job category' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateJobCategoryDto) {
    return this.jobsService.updateCategory(id, dto);
  }

  @Delete('job-categories/:id')
  @ApiOperation({ summary: 'Delete a job category' })
  deleteCategory(@Param('id') id: string) {
    return this.jobsService.deleteCategory(id);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs with filters' })
  listJobs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: any,
  ) {
    return this.jobsService.listJobs({ page, limit, search, status });
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get job details with categories and applications' })
  getJob(@Param('id') id: string) {
    return this.jobsService.getJob(id);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create a new job with multi categories' })
  createJob(@Body() dto: CreateJobDto, @Req() req: Request) {
    return this.jobsService.createJob(dto, (req as any).admin?.id);
  }

  @Patch('jobs/:id')
  @ApiOperation({ summary: 'Update a job' })
  updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.updateJob(id, dto);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Soft delete a job' })
  deleteJob(@Param('id') id: string) {
    return this.jobsService.deleteJob(id);
  }

  @Get('job-applications')
  @ApiOperation({ summary: 'List in-app job applications' })
  listApplications(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('jobId') jobId?: string,
  ) {
    return this.jobsService.listApplications({ page, limit, jobId });
  }

  @Patch('job-applications/:id')
  @ApiOperation({ summary: 'Update application status' })
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateJobApplicationStatusDto,
  ) {
    return this.jobsService.updateApplicationStatus(id, dto);
  }
}
