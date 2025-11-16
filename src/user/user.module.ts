import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { ChannelPartnerCode } from './entities/channel-partner-code.entity';
import { Lead } from './entities/lead.entity';
import { UserRoleHistory } from './entities/user-role-history.entity';
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from './repositories/otp.repository';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import { Property } from '../property/entities/property.entity';
import { PropertyRepository } from '../property/repositories/property.repository';
import { LeadRepository } from './repositories/lead.repository';
import { UserRoleHistoryRepository } from './repositories/user-role-history.repository';
import { UserService } from './user.service';
import { ChannelPartnerCodeService } from './channel-partner-code.service';
import { UserController } from './user.controller';
import { ChannelPartnerCodeController } from './channel-partner-code.controller';
import { LoggerService } from '../logger/logger.service';
import { ErrorHandlerService } from '../common/errorHandler/error-handler.service';
import { AuthMiddleware, TokenVerificationMiddleware } from './middleware';

const entities = [User, Otp, ChannelPartnerCode, Lead, UserRoleHistory, Property];
const repositories = [
  UserRepository,
  OtpRepository,
  ChannelPartnerCodeRepository,
  PropertyRepository,
  LeadRepository,
  UserRoleHistoryRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
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
    // Apply token verification middleware to create-owner and create-channel-partner endpoints
    consumer
      .apply(TokenVerificationMiddleware)
      .forRoutes(
        'users/create-owner',
        'users/create-channel-partner',
        'users/upgrade-channel-partner',
        'users/profile',
        'users/dashboard',
        'users/logout',
      );

    // Apply auth middleware to profile and logout endpoints
    consumer
      .apply(AuthMiddleware)
      .forRoutes('users/profile', 'users/upgrade-channel-partner', 'users/dashboard', 'users/logout');
  }
}
