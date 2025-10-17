import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { PropertyTypeRepository } from './repositories/property-type.repository';
import { PropertyCategoryNewRepository } from './repositories/property-category-new.repository';
import { MasterPropertyType } from './entities/master-property-type.entity';
import { MasterPropertyCategoryNew } from './entities/master-property-category-new.entity';
import { MasterDataSeederService } from './services/master-data-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasterPropertyType,
      MasterPropertyCategoryNew,
    ]),
  ],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PropertyTypeRepository,
    PropertyCategoryNewRepository,
    MasterDataSeederService,
  ],
  exports: [PropertyService, MasterDataSeederService],
})
export class PropertyModule {}