import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Otp } from '../../user/entities/otp.entity';
import { ChannelPartnerCode } from '../../user/entities/channel-partner-code.entity';
import { MasterPropertyListingType } from '../../property/entities/master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from '../../property/entities/master-property-category-new.entity';
import { MasterCity } from '../../property/entities/master-city.entity';
import { MasterSociety } from '../../property/entities/master-society.entity';
import { MasterPropertyType } from '../../property/entities/master-property-type.entity';
import { MasterBhkType } from '../../property/entities/master-bhk-type.entity';
import { MasterBuiltUpArea } from '../../property/entities/master-built-up-area.entity';
import { MasterFurnishing } from '../../property/entities/master-furnishing.entity';
import { MasterAmenity } from '../../property/entities/master-amenity.entity';
import { UnitConfiguration } from '../../property/entities/unit-configuration.entity';
import { Property } from '../../property/entities/property.entity';
import { ContactUs } from '../../contact-us/entities/contact-us.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { ContactUsKmaQuery } from '../../user/entities/contact-us-kma-query.entity';

@Injectable()
export class ConfigService implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly nestConfigService: NestConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const useSSL =
      this.nestConfigService.get<string>('POSTGRES_SSL') === 'true';

    // const sslEnv = this.nestConfigService.get<string>('POSTGRES_SSL');
    // const useSSL = sslEnv !== 'false';

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

    // IMPORTANT: synchronize should be false in production
    // Use migrations for production database changes
    const isProduction = process.env.NODE_ENV === 'production';
    const synchronize = process.env.DB_SYNCHRONIZE === 'true' && !isProduction;

    if (isProduction && synchronize) {
      this.logger.warn(
        'Database synchronize is enabled in production! This can cause data loss.',
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
      synchronize, // Only true in non-production environments
      logging: !isProduction,
      entities: [
        User,
        Otp,
        ChannelPartnerCode,
        MasterPropertyListingType,
        MasterPropertyCategoryNew,
        MasterCity,
        MasterSociety,
        MasterPropertyType,
        MasterBhkType,
        MasterBuiltUpArea,
        MasterFurnishing,
        MasterAmenity,
        UnitConfiguration,
        Property,
        Admin,
        ContactUs,
        ContactUsKmaQuery,
      ],
      autoLoadEntities: true,
      ...(useSSL && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      // Enable migrations
      migrationsTableName: 'migrations',
      migrations: ['dist/migration/*.js'],
      migrationsRun: false,
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

  /**
   * Get Google Maps API key
   */
  public getGoogleMapsApiKey(): string {
    return this.nestConfigService.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }

  /**
   * Get OpenAI API key
   */
  public getOpenAIApiKey(): string {
    return this.nestConfigService.get<string>('OPENAI_API_KEY') || '';
  }

}
