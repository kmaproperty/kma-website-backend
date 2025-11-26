import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { PropertyListingTypeRepository } from './repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { BhkTypeRepository } from './repositories/bhk-type.repository';
import { BuiltUpAreaRepository } from './repositories/built-up-area.repository';
import { CityRepository } from './repositories/city.repository';
import { SocietyRepository } from './repositories/society.repository';
import { LocalityRepository } from './repositories/locality.repository';
import { PropertyRepository } from './repositories/property.repository';
import { MasterPropertyListingType } from './entities/master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from './entities/master-property-category-new.entity';
import { MasterCity } from './entities/master-city.entity';
import { MasterSociety } from './entities/master-society.entity';
import { MasterLocality } from './entities/master-locality.entity';
import { MasterPropertyType } from './entities/master-property-type.entity';
import { MasterBhkType } from './entities/master-bhk-type.entity';
import { MasterBuiltUpArea } from './entities/master-built-up-area.entity';
import { UnitConfiguration } from './entities/unit-configuration.entity';
import { Property } from './entities/property.entity';
import { MasterDataSeederService } from './services/master-data-seeder.service';
import { GooglePlacesService } from './services/google-places.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PropertyListingTypeRepository,
    PropertyCategoryNewRepository,
    PropertyTypeRepository,
    BhkTypeRepository,
    BuiltUpAreaRepository,
    CityRepository,
    SocietyRepository,
    LocalityRepository,
    PropertyRepository,
    MasterDataSeederService,
    GooglePlacesService,
    JwtAuthGuard,
  ],
  exports: [
    PropertyService,
    MasterDataSeederService,
    CityRepository,
    SocietyRepository,
  ],
})
export class PropertyModule implements OnModuleInit {
  private readonly logger = new Logger(PropertyModule.name);

  constructor(private readonly seederService: MasterDataSeederService) {}

  async onModuleInit() {
    try {
      this.logger.log('Seeding property master data...');
      // await this.seederService.seedAll();
      this.logger.log('Property master data seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed property master data', error);
    }
  }
}
