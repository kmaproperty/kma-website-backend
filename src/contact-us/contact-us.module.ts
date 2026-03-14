import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { ContactUsRepository } from './repositories/contact-us.repository';
import { JoinUsEnquiryRepository } from './repositories/join-us-enquiry.repository';
import { SalesEnquiryRepository } from './repositories/sales-enquiry.repository';
import { ContactUs } from './entities/contact-us.entity';
import { JoinUsEnquiry } from './entities/join-us-enquiry.entity';
import { SalesEnquiry } from './entities/sales-enquiry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs, JoinUsEnquiry, SalesEnquiry])],
  controllers: [ContactUsController],
  providers: [
    ContactUsService,
    ContactUsRepository,
    JoinUsEnquiryRepository,
    SalesEnquiryRepository,
  ],
  exports: [ContactUsService, ContactUsRepository, JoinUsEnquiryRepository, SalesEnquiryRepository],
})
export class ContactUsModule {}
