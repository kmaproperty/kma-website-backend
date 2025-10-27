import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { ContactUsRepository } from './repositories/contact-us.repository';
import { ContactUs } from './entities/contact-us.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs])],
  controllers: [ContactUsController],
  providers: [ContactUsService, ContactUsRepository],
  exports: [ContactUsService, ContactUsRepository],
})
export class ContactUsModule {}
