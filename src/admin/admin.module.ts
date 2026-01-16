import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './repositories/admin.repository';
import { Property } from '../property/entities/property.entity';
import { PropertyRepository } from '../property/repositories/property.repository';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { PropertyModule } from '../property/property.module';
import { UserModule } from '../user/user.module';
import { Lead } from './entities/lead.entity';
import { LeadNote } from './entities/lead-note.entity';
import { LeadPropertyContact } from './entities/lead-property-contact.entity';
import { LeadRepository } from './repositories/lead.repository';
import { LeadNoteRepository } from './repositories/lead-note.repository';
import { LeadPropertyContactRepository } from './repositories/lead-property-contact.repository';
import { LeadService } from './services/lead.service';
import { ContactUs } from '../contact-us/entities/contact-us.entity';
import { ContactUsRepository } from '../contact-us/repositories/contact-us.repository';
import { ContactUsKmaQuery } from '../user/entities/contact-us-kma-query.entity';
import { ContactUsKmaQueryRepository } from '../user/repositories/contact-us-kma-query.repository';
import { KmaRatingReview } from '../user/entities/kma-rating-review.entity';
import { KmaRatingReviewRepository } from '../user/repositories/kma-rating-review.repository';
import { PropertyVerificationRequest } from '../property/entities/property-verification-request.entity';
import { PropertyVerificationRequestRepository } from '../property/repositories/property-verification-request.repository';
import { AboutUs } from './entities/about-us.entity';
import { AboutUsRepository } from './repositories/about-us.repository';
import { AdminConfiguration } from './entities/admin-configuration.entity';
import { AdminConfigurationRepository } from './repositories/admin-configuration.repository';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PropertyModule),
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([
      Admin,
      Property,
      Lead,
      LeadNote,
      LeadPropertyContact,
      ContactUs,
      ContactUsKmaQuery,
      KmaRatingReview,
      PropertyVerificationRequest,
      AboutUs,
      AdminConfiguration,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    PropertyRepository,
    JwtAuthGuard,
    LeadRepository,
    LeadNoteRepository,
    LeadPropertyContactRepository,
    LeadService,
    ContactUsRepository,
    ContactUsKmaQueryRepository,
    KmaRatingReviewRepository,
    PropertyVerificationRequestRepository,
    AboutUsRepository,
    AdminConfigurationRepository,
  ],
  exports: [AdminService, AdminRepository, LeadService, AboutUsRepository, AdminConfigurationRepository],
})
export class AdminModule {}

