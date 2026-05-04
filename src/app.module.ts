import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './user/user.module';
import { PropertyModule } from './property/property.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { UploadsModule } from './uploads/uploads.module';
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from './common/config/config.service';
import { AdminModule } from './admin/admin.module';
import { BlogModule } from './blog/blog.module';
import { FaqModule } from './faq/faq.module';
import { CacheModule } from './common/cache/cache.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.createTypeOrmOptions(),
      inject: [ConfigService],
    }),
    LoggerModule,
    UserModule,
    PropertyModule,
    ContactUsModule,
    UploadsModule,
    AdminModule,
    BlogModule,
    FaqModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
