import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Blog } from './entities/blog.entity';
import { BlogComment } from './entities/blog-comment.entity';
import { BlogRepository } from './repositories/blog.repository';
import { BlogCommentRepository } from './repositories/blog-comment.repository';
import { BlogService } from './blog.service';
import { AdminBlogController } from './admin-blog.controller';
import { EndUserBlogController } from './end-user-blog.controller';
import { AdminModule } from '../admin/admin.module';
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, BlogComment]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => AdminModule), // To access AdminRepository
  ],
  controllers: [AdminBlogController, EndUserBlogController],
  providers: [
    BlogService,
    BlogRepository,
    BlogCommentRepository,
    AdminAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [BlogService, BlogRepository],
})
export class BlogModule {}

