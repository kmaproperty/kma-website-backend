import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LoggerService } from '../logger/logger.service';
import { ErrorHandlerService } from '../common/errorHandler/error-handler.service';


const entities = [User];
const repositories = [UserRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    LoggerService,
    ErrorHandlerService,
    ...repositories,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {} 