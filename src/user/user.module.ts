import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { ChannelPartnerCode } from './entities/channel-partner-code.entity';
import { ChannelPartnerAgreement } from './entities/channel-partner-agreement.entity';
import { Lead } from './entities/lead.entity';
import { UserRoleHistory } from './entities/user-role-history.entity';
import { BankDetails } from './entities/bank-details.entity';
import { ContactUsKmaQuery } from './entities/contact-us-kma-query.entity';
import { KmaRatingReview } from './entities/kma-rating-review.entity';
import { PropertyRatingReview } from './entities/property-rating-review.entity';
import { ChannelPartnerReview } from './entities/channel-partner-review.entity';
import { FavoriteProperty } from './entities/favorite-property.entity';
import { Session } from './entities/session.entity';
import { SessionPropertyView } from './entities/session-property-view.entity';
import { SeenProperty } from './entities/seen-property.entity';
import { SearchHistory } from './entities/search-history.entity';
import { ContactedProperty } from './entities/contacted-property.entity';
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from './repositories/otp.repository';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import { ChannelPartnerAgreementRepository } from './repositories/channel-partner-agreement.repository';
import { BankDetailsRepository } from './repositories/bank-details.repository';
import { Property } from '../property/entities/property.entity';
import { PropertyRepository } from '../property/repositories/property.repository';
import { LeadRepository } from './repositories/lead.repository';
import { UserRoleHistoryRepository } from './repositories/user-role-history.repository';
import { ContactUsKmaQueryRepository } from './repositories/contact-us-kma-query.repository';
import { KmaRatingReviewRepository } from './repositories/kma-rating-review.repository';
import { PropertyRatingReviewRepository } from './repositories/property-rating-review.repository';
import { ChannelPartnerReviewRepository } from './repositories/channel-partner-review.repository';
import { FavoritePropertyRepository } from './repositories/favorite-property.repository';
import { SessionRepository } from './repositories/session.repository';
import { SessionPropertyViewRepository } from './repositories/session-property-view.repository';
import { SeenPropertyRepository } from './repositories/seen-property.repository';
import { SearchHistoryRepository } from './repositories/search-history.repository';
import { ContactedPropertyRepository } from './repositories/contacted-property.repository';
import { UserService } from './user.service';
import { ChannelPartnerCodeService } from './channel-partner-code.service';
import { DocuSignService } from './services/docusign.service';
import { EncryptionService } from './services/encryption.service';
import { PropertyViewTrackerService } from './services/property-view-tracker.service';
import { SearchTrackerService } from './services/search-tracker.service';
import { UserController } from './user.controller';
import { ChannelPartnerCodeController } from './channel-partner-code.controller';
import { EndUserController } from './end-user.controller';
import { LoggerService } from '../logger/logger.service';
import { ErrorHandlerService } from '../common/errorHandler/error-handler.service';
import { AuthMiddleware, TokenVerificationMiddleware } from './middleware';
import { AdminModule } from '../admin/admin.module';
import { PropertyModule } from '../property/property.module';
import { TeamMember } from '../admin/entities/team-member.entity';
import { RegionalOffice } from '../admin/entities/regional-office.entity';
import { HelpCenterFaq } from '../admin/entities/help-center-faq.entity';
import { TeamMemberRepository } from '../admin/repositories/team-member.repository';
import { RegionalOfficeRepository } from '../admin/repositories/regional-office.repository';
import { HelpCenterFaqRepository } from '../admin/repositories/help-center-faq.repository';
import { MetaWhatsappService } from '../common/whatsapp/meta-whatsapp.service';
import { S3Service } from '../common/aws/s3.service';

const entities = [
  User,
  Otp,
  ChannelPartnerCode,
  ChannelPartnerAgreement,
  Lead,
  UserRoleHistory,
  Property,
  BankDetails,
  ContactUsKmaQuery,
  KmaRatingReview,
  PropertyRatingReview,
  ChannelPartnerReview,
  FavoriteProperty,
  Session,
  SessionPropertyView,
  SeenProperty,
  SearchHistory,
  ContactedProperty,
  TeamMember,
  RegionalOffice,
  HelpCenterFaq,
];
const repositories = [
  UserRepository,
  OtpRepository,
  ChannelPartnerCodeRepository,
  ChannelPartnerAgreementRepository,
  BankDetailsRepository,
  PropertyRepository,
  LeadRepository,
  UserRoleHistoryRepository,
  ContactUsKmaQueryRepository,
  KmaRatingReviewRepository,
  PropertyRatingReviewRepository,
  ChannelPartnerReviewRepository,
  FavoritePropertyRepository,
  SessionRepository,
  SessionPropertyViewRepository,
  SeenPropertyRepository,
  SearchHistoryRepository,
  ContactedPropertyRepository,
  TeamMemberRepository,
  RegionalOfficeRepository,
  HelpCenterFaqRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AdminModule,
    PropertyModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET is not defined in environment variables. This is required for security.',
          );
        }
        return {
          secret,
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController, ChannelPartnerCodeController, EndUserController],
  providers: [
    UserService,
    ChannelPartnerCodeService,
    DocuSignService,
    EncryptionService,
    PropertyViewTrackerService,
    SearchTrackerService,
    LoggerService,
    ErrorHandlerService,
    AuthMiddleware,
    TokenVerificationMiddleware,
    MetaWhatsappService,
    S3Service,
    ...repositories,
  ],
  exports: [
    UserService,
    UserRepository,
    OtpRepository,
    ChannelPartnerCodeService,
    ChannelPartnerCodeRepository,
    ChannelPartnerAgreementRepository,
    LeadRepository,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply token verification middleware to create-owner, create-channel-partner, and create-end-user endpoints
    consumer
      .apply(TokenVerificationMiddleware)
      .forRoutes(
        'users/create-owner',
        'users/create-channel-partner',
        'users/create-end-user',
        'users/upgrade-channel-partner',
        'users/profile',
        'users/dashboard',
        'users/logout',
        'users/agreements',
        'users/docusign/create-envelope',
        'users/docusign/create-template',
        'users/docusign/agreements',
        'users/docusign/update-status',
        'users/docusign/channel-partner-agreement',
      );

    // Apply auth middleware to profile and logout endpoints
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        'users/profile',
        'users/upgrade-channel-partner',
        'users/dashboard',
        'users/logout',
        'users/agreements',
        'users/docusign/create-envelope',
        'users/docusign/create-template',
        'users/docusign/agreements',
        'users/docusign/update-status',
        'users/docusign/channel-partner-agreement',
        'users/verification/live-photo',
        'users/verification/aadhaar',
        'users/verification/bank-details',
        'users/verification/docusign-agreement',
        'users/verification/status',
        'users/profile-pic',
        'end-user/profile',
        'end-user/change-mobile',
        'end-user/verify-change-mobile-otp',
      );
  }
}
