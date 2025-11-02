import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './user/entities/user.entity';
import { Otp } from './user/entities/otp.entity';
import { ChannelPartnerCode } from './user/entities/channel-partner-code.entity';
import { MasterPropertyListingType } from './property/entities/master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from './property/entities/master-property-category-new.entity';
import { MasterCity } from './property/entities/master-city.entity';
import { MasterSociety } from './property/entities/master-society.entity';
import { MasterLocality } from './property/entities/master-locality.entity';
import { MasterPropertyType } from './property/entities/master-property-type.entity';
import { MasterBhkType } from './property/entities/master-bhk-type.entity';
import { MasterBuiltUpArea } from './property/entities/master-built-up-area.entity';
import { UnitConfiguration } from './property/entities/unit-configuration.entity';
import { Property } from './property/entities/property.entity';
import { ContactUs } from './contact-us/entities/contact-us.entity';

// Load environment variables
config();

const useSSL = process.env.POSTGRES_SSL === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: true,
  entities: [
    User,
    Otp,
    ChannelPartnerCode,
    MasterPropertyListingType,
    MasterPropertyCategoryNew,
    MasterCity,
    MasterSociety,
    MasterLocality,
    MasterPropertyType,
    MasterBhkType,
    MasterBuiltUpArea,
    UnitConfiguration,
    Property,
    ContactUs,
  ],
  migrations: ['src/migration/*.ts'],
  subscribers: [],
  ...(useSSL && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});
