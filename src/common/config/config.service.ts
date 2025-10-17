import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Otp } from '../../user/entities/otp.entity';
import { ChannelPartnerCode } from '../../user/entities/channel-partner-code.entity';

@Injectable()
export class ConfigService implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly nestConfigService: NestConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const useSSL =
      this.nestConfigService.get<string>('POSTGRES_SSL') === 'true';

    // Get environment variables using NestJS ConfigService with fallback to process.env
    const host =
      this.nestConfigService.get<string>('POSTGRES_HOST') ||
      process.env.POSTGRES_HOST;
    const username =
      this.nestConfigService.get<string>('POSTGRES_USER') ||
      process.env.POSTGRES_USER;
    const password =
      this.nestConfigService.get<string>('POSTGRES_PASS') ||
      process.env.POSTGRES_PASS;
    const database =
      this.nestConfigService.get<string>('POSTGRES_DB') ||
      process.env.POSTGRES_DB;

    // Validate required environment variables
    const missingVars: string[] = [];
    if (!host) missingVars.push('POSTGRES_HOST');
    if (!username) missingVars.push('POSTGRES_USER');
    if (!password) missingVars.push('POSTGRES_PASS');
    if (!database) missingVars.push('POSTGRES_DB');

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`,
      );
    }

    return {
      type: 'postgres',
      host,
      port: parseInt(
        this.nestConfigService.get<string>('POSTGRES_PORT') || '5432',
        10,
      ),
      username,
      password,
      database,
      synchronize: true,
      logging: false,
      entities: [User, Otp, ChannelPartnerCode],
      autoLoadEntities: true,
      ...(useSSL && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      // migrationsTableName: 'migration',
      // migrations: ['src/migration/*.ts'],
      // migrationsRun: false,
    };
  }
  /**
   * Get config value by its key
   * @param key: string
   */
  public get(key: string): string | null {
    return (this.nestConfigService.get<string>(key) as string) || null;
  }

  /**
   * Get config value by its key
   * @param key
   */
  public getValue(key: string): string | null {
    return (this.nestConfigService.get<string>(key) as string) || null;
  }
}
