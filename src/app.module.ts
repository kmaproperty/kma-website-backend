import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { PropertyModule } from './property/property.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from './common/config/config.service';

@Module({
  imports: [
    ConfigModule,
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
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
