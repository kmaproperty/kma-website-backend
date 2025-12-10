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
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from './repositories/otp.repository';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import { ChannelPartnerAgreementRepository } from './repositories/channel-partner-agreement.repository';
import { Property } from '../property/entities/property.entity';
import { PropertyRepository } from '../property/repositories/property.repository';
import { LeadRepository } from './repositories/lead.repository';
import { UserRoleHistoryRepository } from './repositories/user-role-history.repository';
import { UserService } from './user.service';
import { ChannelPartnerCodeService } from './channel-partner-code.service';
import { DocuSignService } from './services/docusign.service';
import { UserController } from './user.controller';
import { ChannelPartnerCodeController } from './channel-partner-code.controller';
import { LoggerService } from '../logger/logger.service';
import { ErrorHandlerService } from '../common/errorHandler/error-handler.service';
import { AuthMiddleware, TokenVerificationMiddleware } from './middleware';
import { AdminModule } from '../admin/admin.module';

const entities = [User, Otp, ChannelPartnerCode, ChannelPartnerAgreement, Lead, UserRoleHistory, Property];
const repositories = [
  UserRepository,
  OtpRepository,
  ChannelPartnerCodeRepository,
  ChannelPartnerAgreementRepository,
  PropertyRepository,
  LeadRepository,
  UserRoleHistoryRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AdminModule,
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
  controllers: [UserController, ChannelPartnerCodeController],
  providers: [
    UserService,
    ChannelPartnerCodeService,
    DocuSignService,
    LoggerService,
    ErrorHandlerService,
    AuthMiddleware,
    TokenVerificationMiddleware,
    ...repositories,
  ],
  exports: [
    UserService,
    UserRepository,
    OtpRepository,
    ChannelPartnerCodeService,
    ChannelPartnerCodeRepository,
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
      );
  }
}
