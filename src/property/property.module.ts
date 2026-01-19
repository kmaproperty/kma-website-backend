import { Module, OnModuleInit, Logger, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PropertyController } from './property.controller';
import { PropertyVerificationController } from './property-verification.controller';
import { PropertyService } from './property.service';
import { PropertyListingTypeRepository } from './repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { BhkTypeRepository } from './repositories/bhk-type.repository';
import { BuiltUpAreaRepository } from './repositories/built-up-area.repository';
import { CityRepository } from './repositories/city.repository';
import { SocietyRepository } from './repositories/society.repository';
import { LocalityRepository } from './repositories/locality.repository';
import { FurnishingRepository } from './repositories/furnishing.repository';
import { AmenityRepository } from './repositories/amenity.repository';
import { PropertyRepository } from './repositories/property.repository';
import { MasterPropertyListingType } from './entities/master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from './entities/master-property-category-new.entity';
import { MasterCity } from './entities/master-city.entity';
import { MasterSociety } from './entities/master-society.entity';
import { MasterLocality } from './entities/master-locality.entity';
import { MasterPropertyType } from './entities/master-property-type.entity';
import { MasterBhkType } from './entities/master-bhk-type.entity';
import { MasterBuiltUpArea } from './entities/master-built-up-area.entity';
import { MasterFurnishing } from './entities/master-furnishing.entity';
import { MasterAmenity } from './entities/master-amenity.entity';
import { UnitConfiguration } from './entities/unit-configuration.entity';
import { Property } from './entities/property.entity';
import { PropertyRejectionHistory } from './entities/property-rejection-history.entity';
import { PropertyVerificationRequest } from './entities/property-verification-request.entity';
import { MasterDataSeederService } from './services/master-data-seeder.service';
import { GooglePlacesService } from './services/google-places.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { AdminModule } from '../admin/admin.module';
import { Admin } from '../admin/entities/admin.entity';
import { UserModule } from '../user/user.module';
import { PropertyRejectionHistoryRepository } from './repositories/property-rejection-history.repository';
import { PropertyVerificationRequestRepository } from './repositories/property-verification-request.repository';

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
      MasterFurnishing,
      MasterAmenity,
      UnitConfiguration,
      Property,
      PropertyRejectionHistory,
      PropertyVerificationRequest,
      Admin,
    ]),
    forwardRef(() => AdminModule),
    forwardRef(() => UserModule),
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
  controllers: [PropertyController, PropertyVerificationController],
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
    FurnishingRepository,
    AmenityRepository,
    PropertyRepository,
    PropertyRejectionHistoryRepository,
    PropertyVerificationRequestRepository,
    MasterDataSeederService,
    GooglePlacesService,
    JwtAuthGuard,
  ],
  exports: [
    PropertyService,
    MasterDataSeederService,
    CityRepository,
    SocietyRepository,
    BhkTypeRepository,
    LocalityRepository,
    FurnishingRepository,
    AmenityRepository,
    GooglePlacesService,
    PropertyRejectionHistoryRepository,
    PropertyVerificationRequestRepository,
    PropertyListingTypeRepository,
    PropertyCategoryNewRepository,
    PropertyTypeRepository,
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
