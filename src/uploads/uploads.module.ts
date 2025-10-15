import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { S3Service } from '../common/aws/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule],
  controllers: [UploadsController],
  providers: [UploadsService, S3Service],
  exports: [UploadsService],
})
export class UploadsModule {}
