import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ConfigService implements TypeOrmOptionsFactory {
  private readonly envConfig: { [key: string]: string | undefined };
  private readonly logger = new Logger('Config');

  constructor() {
    try {
      this.envConfig = dotenv.parse(fs.readFileSync('.env'));
    } catch {
      this.envConfig = Object.fromEntries(
        Object.entries(process.env).filter(([_, v]) => v != null)
      );
    }
    process.env = Object.assign(process.env, this.envConfig);
  }

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.envConfig.POSTGRES_HOST,
      port: parseInt(this.envConfig.POSTGRES_PORT || '5432', 10),
      username: this.envConfig.POSTGRES_USER,
      password: this.envConfig.POSTGRES_PASS,
      database: this.envConfig.POSTGRES_DB,
      synchronize: false,
      logging: false,
      entities: [__dirname + '/../*/entities/*.entity{.ts,.js}'],
      ssl: {
        rejectUnauthorized: false,
      },
      // migrationsTableName: 'migration',
      // migrations: ['src/migration/*.ts'],
      // migrationsRun: false,
    };
  }
  /**
   * Get config value by its key with promise
   * @param key: string
   */
  public async get(key: string): Promise<string | null> {
    return this.envConfig[key] || null;
  }

  /**
   * Get config value by its key without promise
   * @param key
   */
  public getValue(key: string): string | null {
    return this.envConfig[key] || null;
  }
}
