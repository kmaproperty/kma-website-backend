import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobCategory } from './entities/job-category.entity';
import { Job } from './entities/job.entity';
import { JobApplication } from './entities/job-application.entity';
import { JobsService } from './jobs.service';
import { JobsAdminController } from './jobs.admin.controller';
import { Admin } from '../admin/entities/admin.entity';
import { AdminRepository } from '../admin/repositories/admin.repository';
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([JobCategory, Job, JobApplication, Admin]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JobsService, AdminRepository, AdminAuthGuard, AdminPermissionsGuard],
  controllers: [JobsAdminController],
  exports: [JobsService],
})
export class JobsModule {}
