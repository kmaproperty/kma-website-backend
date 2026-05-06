import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobStatus } from './entities/job.entity';
import { JobsService } from './jobs.service';

@ApiTags('End User - Jobs')
@Controller('end-user')
export class JobsPublicController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('job-categories')
  @ApiOperation({ summary: 'List active job categories for end users' })
  listCategories() {
    return this.jobsService.listPublicCategories();
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List published jobs with filters for careers page' })
  listJobs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('location') location?: string,
    @Query('jobType') jobType?: string,
    @Query('workMode') workMode?: string,
    @Query('status') status?: JobStatus,
  ) {
    return this.jobsService.listPublicJobs({
      page,
      limit,
      search,
      categoryId,
      location,
      jobType,
      workMode,
      status,
    });
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get published job details for end users' })
  getJob(@Param('id') id: string) {
    return this.jobsService.getPublicJob(id);
  }
}
