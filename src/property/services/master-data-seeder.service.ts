import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { MasterPropertyListingType } from '../entities/master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from '../entities/master-property-category-new.entity';
import { MasterPropertyType } from '../entities/master-property-type.entity';
import { MasterBhkType } from '../entities/master-bhk-type.entity';
import { MasterBuiltUpArea } from '../entities/master-built-up-area.entity';
import { MasterCity } from '../entities/master-city.entity';
import { MasterSociety } from '../entities/master-society.entity';
import { MasterFurnishing } from '../entities/master-furnishing.entity';
import { MasterAmenity } from '../entities/master-amenity.entity';
import { Property } from '../entities/property.entity';

@Injectable()
export class MasterDataSeederService {
  private readonly logger = new Logger(MasterDataSeederService.name);

  constructor(
    @InjectRepository(MasterPropertyListingType)
    private readonly propertyListingTypeRepository: Repository<MasterPropertyListingType>,
    @InjectRepository(MasterPropertyCategoryNew)
    private readonly propertyCategoryRepository: Repository<MasterPropertyCategoryNew>,
    @InjectRepository(MasterPropertyType)
    private readonly propertyTypeRepository: Repository<MasterPropertyType>,
    @InjectRepository(MasterBhkType)
    private readonly bhkTypeRepository: Repository<MasterBhkType>,
    @InjectRepository(MasterBuiltUpArea)
    private readonly builtUpAreaRepository: Repository<MasterBuiltUpArea>,
    @InjectRepository(MasterCity)
    private readonly cityRepository: Repository<MasterCity>,
    @InjectRepository(MasterSociety)
    private readonly societyRepository: Repository<MasterSociety>,
    @InjectRepository(MasterFurnishing)
    private readonly furnishingRepository: Repository<MasterFurnishing>,
    @InjectRepository(MasterAmenity)
    private readonly amenityRepository: Repository<MasterAmenity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  /**
   * Delete all master data in reverse dependency order
   */
  async deleteAll(): Promise<void> {
    this.logger.log('Starting deletion of all master data...');

    // Delete in reverse dependency order
    // 1. Properties first (depends on everything)
    const propertiesCount = await this.propertyRepository.count();
    if (propertiesCount > 0) {
      await this.propertyRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${propertiesCount} properties`);
    }

    // 2. Societies (depends on cities)
    const societiesCount = await this.societyRepository.count();
    if (societiesCount > 0) {
      await this.societyRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${societiesCount} societies`);
    }

    // 3. Built-up Areas (depends on BHK types)
    const builtUpAreasCount = await this.builtUpAreaRepository.count();
    if (builtUpAreasCount > 0) {
      await this.builtUpAreaRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${builtUpAreasCount} built-up areas`);
    }

    // 5. BHK Types (depends on property types)
    const bhkTypesCount = await this.bhkTypeRepository.count();
    if (bhkTypesCount > 0) {
      await this.bhkTypeRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${bhkTypesCount} BHK types`);
    }

    // 6. Property Types (depends on listing types and categories)
    const propertyTypesCount = await this.propertyTypeRepository.count();
    if (propertyTypesCount > 0) {
      await this.propertyTypeRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${propertyTypesCount} property types`);
    }

    // 7. Cities (independent at this point)
    const citiesCount = await this.cityRepository.count();
    if (citiesCount > 0) {
      await this.cityRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${citiesCount} cities`);
    }

    // 8. Property Categories (independent)
    const categoriesCount = await this.propertyCategoryRepository.count();
    if (categoriesCount > 0) {
      await this.propertyCategoryRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${categoriesCount} property categories`);
    }

    // 9. Property Listing Types (independent)
    const listingTypesCount = await this.propertyListingTypeRepository.count();
    if (listingTypesCount > 0) {
      await this.propertyListingTypeRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${listingTypesCount} property listing types`);
    }

    // 10. Furnishings (independent)
    const furnishingsCount = await this.furnishingRepository.count();
    if (furnishingsCount > 0) {
      await this.furnishingRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${furnishingsCount} furnishings`);
    }

    // 11. Amenities (independent)
    const amenitiesCount = await this.amenityRepository.count();
    if (amenitiesCount > 0) {
      await this.amenityRepository
        .createQueryBuilder()
        .delete()
        .where('id IS NOT NULL')
        .execute();
      this.logger.log(`Deleted ${amenitiesCount} amenities`);
    }

    this.logger.log('All master data deleted successfully');
  }

  /**
   * Seed all master data in proper dependency order
   */
  async seedAll(): Promise<void> {
    this.logger.log('Starting seeding of all master data...');

    await this.seedPropertyListingTypes();
    await this.seedPropertyCategories();
    await this.seedPropertyTypes();
    await this.seedBhkTypes(); // Moved after property types since BHK types depend on them
    await this.seedBuiltUpAreas(); // After BHK types since built-up areas depend on them
    await this.seedCities();
    await this.seedSocieties(); // Societies now include localityName
    await this.seedFurnishings();
    await this.seedAmenities();

    this.logger.log('All master data seeded successfully');
  }

  /**
   * Delete and reseed all master data
   */
  async reseedAll(): Promise<{ message: string; details: any }> {
    const startTime = Date.now();

    try {
      // Delete existing data
      await this.deleteAll();

      // Seed new data
      await this.seedAll();

      // Get counts of seeded data
      const counts = {
        propertyListingTypes: await this.propertyListingTypeRepository.count(),
        propertyCategories: await this.propertyCategoryRepository.count(),
        propertyTypes: await this.propertyTypeRepository.count(),
        bhkTypes: await this.bhkTypeRepository.count(),
        builtUpAreas: await this.builtUpAreaRepository.count(),
        cities: await this.cityRepository.count(),
        societies: await this.societyRepository.count(),
        furnishings: await this.furnishingRepository.count(),
        amenities: await this.amenityRepository.count(),
      };

      const duration = Date.now() - startTime;

      return {
        message: 'Master data reseeded successfully',
        details: {
          duration: `${duration}ms`,
          counts,
        },
      };
    } catch (error) {
      this.logger.error('Error during reseeding:', error);
      throw error;
    }
  }

  /**
   * Delete and reseed only furnishings
   */
  async reseedFurnishings(): Promise<{ message: string; details: any }> {
    const startTime = Date.now();

    try {
      // Delete existing furnishings
      const furnishingsBefore = await this.furnishingRepository.count();
      if (furnishingsBefore > 0) {
        await this.furnishingRepository
          .createQueryBuilder()
          .delete()
          .where('id IS NOT NULL')
          .execute();
        this.logger.log(`Deleted ${furnishingsBefore} furnishings`);
      }

      // Seed furnishings
      await this.seedFurnishings();

      const furnishingsAfter = await this.furnishingRepository.count();
      const duration = Date.now() - startTime;

      return {
        message: 'Furnishings reseeded successfully',
        details: {
          duration: `${duration}ms`,
          counts: {
            furnishingsBefore,
            furnishingsAfter,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error during furnishings reseeding:', error);
      throw error;
    }
  }

  private async seedPropertyListingTypes(): Promise<void> {
    this.logger.log('Seeding property listing types...');
    const propertyListingTypeOptions = [
      {
        name: 'Sale',
        code: 'sale',
      },
      {
        name: 'Rent',
        code: 'rent',
      },
    ];

    let created = 0;
    for (const optionData of propertyListingTypeOptions) {
      const existing = await this.propertyListingTypeRepository.findOne({
        where: { code: optionData.code },
      });

      if (!existing) {
        const propertyListingType =
          this.propertyListingTypeRepository.create(optionData);
        await this.propertyListingTypeRepository.save(propertyListingType);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} property listing types`);
  }

  private async seedBhkTypes(): Promise<void> {
    this.logger.log('Seeding BHK types...');

    // Get all societies
    const allSocieties = await this.societyRepository.find();

    if (allSocieties.length === 0) {
      this.logger.log('⚠ Skipping BHK type seeding - societies not found');
      return;
    }

    // Get property types that should have BHK configurations
    // BHK types are only applicable to residential property types
    const propertyTypesWithBhk = await this.propertyTypeRepository.find({
      where: [
        { code: 'res-rent-flat' },
        { code: 'res-rent-house' },
        { code: 'res-rent-duplex' },
        { code: 'res-rent-builder-floor' },
        { code: 'res-rent-villa' },
        { code: 'res-rent-penthouse' },
        { code: 'res-rent-studio' },
        { code: 'res-sale-flat' },
        { code: 'res-sale-house' },
        { code: 'res-sale-duplex' },
        { code: 'res-sale-builder-floor' },
        { code: 'res-sale-villa' },
        { code: 'res-sale-penthouse' },
        { code: 'res-sale-studio' },
      ],
    });

    if (propertyTypesWithBhk.length === 0) {
      this.logger.log(
        '⚠ Skipping BHK type seeding - property types not found',
      );
      return;
    }

    // Define BHK types
    const bhkTypeDefinitions = [
      { name: 'Studio', code: 'studio', sortOrder: 1 },
      { name: '1 RK', code: '1rk', sortOrder: 2 },
      { name: '1 BHK', code: '1bhk', sortOrder: 3 },
      { name: '1.5 BHK', code: '1.5bhk', sortOrder: 4 },
      { name: '2 BHK', code: '2bhk', sortOrder: 5 },
      { name: '2.5 BHK', code: '2.5bhk', sortOrder: 6 },
      { name: '3 BHK', code: '3bhk', sortOrder: 7 },
      { name: '3.5 BHK', code: '3.5bhk', sortOrder: 8 },
      { name: '4 BHK', code: '4bhk', sortOrder: 9 },
      { name: '4.5 BHK', code: '4.5bhk', sortOrder: 10 },
      { name: '5 BHK', code: '5bhk', sortOrder: 11 },
      { name: '5+ BHK', code: '5plus', sortOrder: 12 },
    ];

    // Create BHK types for each society
    let created = 0;
    for (const society of allSocieties) {
      // Randomly select which BHK types this society has
      // Common types (1bhk, 2bhk, 3bhk) are more likely
      const commonBhkCodes = ['1bhk', '2bhk', '3bhk'];

      // Randomly select one property type for this society (e.g., flat, house, villa)
      const randomPropertyType =
        propertyTypesWithBhk[
          Math.floor(Math.random() * propertyTypesWithBhk.length)
        ];

      for (const bhkDef of bhkTypeDefinitions) {
        // Always include common BHK types, randomly include others
        const shouldInclude =
          commonBhkCodes.includes(bhkDef.code) || Math.random() > 0.5;

        if (!shouldInclude) {
          continue;
        }

        const code = `${randomPropertyType.code}-${bhkDef.code}-${society.id.substring(0, 8)}`;

        const existing = await this.bhkTypeRepository.findOne({
          where: { code },
        });

        if (!existing) {
          const bhkType = this.bhkTypeRepository.create({
            name: bhkDef.name,
            code: code,
            sortOrder: bhkDef.sortOrder,
            propertyTypeId: randomPropertyType.id,
            societyId: society.id,
          });
          await this.bhkTypeRepository.save(bhkType);
          created++;
        }
      }
    }
    this.logger.log(
      `✓ Created ${created} BHK types for ${allSocieties.length} societies`,
    );
  }

  private async seedBuiltUpAreas(): Promise<void> {
    this.logger.log('Seeding built-up areas...');

    // Get all BHK types (which are already society-specific)
    const allBhkTypes = await this.bhkTypeRepository.find();

    if (allBhkTypes.length === 0) {
      this.logger.log(
        '⚠ Skipping built-up area seeding - BHK types not found',
      );
      return;
    }

    // Define built-up area configurations for different BHK types
    // Format: { bhkCode: suffix, configurations: [{ superBuiltUpArea, carpetArea, noOfBathrooms }] }
    const builtUpAreaData = {
      studio: [
        { superBuiltUpArea: 350, carpetArea: 280, noOfBathrooms: 1 },
        { superBuiltUpArea: 450, carpetArea: 360, noOfBathrooms: 1 },
        { superBuiltUpArea: 550, carpetArea: 440, noOfBathrooms: 1 },
      ],
      '1rk': [
        { superBuiltUpArea: 400, carpetArea: 320, noOfBathrooms: 1 },
        { superBuiltUpArea: 500, carpetArea: 400, noOfBathrooms: 1 },
        { superBuiltUpArea: 600, carpetArea: 480, noOfBathrooms: 1 },
      ],
      '1bhk': [
        { superBuiltUpArea: 550, carpetArea: 440, noOfBathrooms: 1 },
        { superBuiltUpArea: 650, carpetArea: 520, noOfBathrooms: 1 },
        { superBuiltUpArea: 750, carpetArea: 600, noOfBathrooms: 2 },
        { superBuiltUpArea: 850, carpetArea: 680, noOfBathrooms: 2 },
      ],
      '1.5bhk': [
        { superBuiltUpArea: 700, carpetArea: 560, noOfBathrooms: 1 },
        { superBuiltUpArea: 800, carpetArea: 640, noOfBathrooms: 2 },
        { superBuiltUpArea: 900, carpetArea: 720, noOfBathrooms: 2 },
      ],
      '2bhk': [
        { superBuiltUpArea: 900, carpetArea: 720, noOfBathrooms: 2 },
        { superBuiltUpArea: 1050, carpetArea: 840, noOfBathrooms: 2 },
        { superBuiltUpArea: 1200, carpetArea: 960, noOfBathrooms: 2 },
        { superBuiltUpArea: 1350, carpetArea: 1080, noOfBathrooms: 3 },
      ],
      '2.5bhk': [
        { superBuiltUpArea: 1100, carpetArea: 880, noOfBathrooms: 2 },
        { superBuiltUpArea: 1250, carpetArea: 1000, noOfBathrooms: 2 },
        { superBuiltUpArea: 1400, carpetArea: 1120, noOfBathrooms: 3 },
      ],
      '3bhk': [
        { superBuiltUpArea: 1300, carpetArea: 1040, noOfBathrooms: 2 },
        { superBuiltUpArea: 1500, carpetArea: 1200, noOfBathrooms: 3 },
        { superBuiltUpArea: 1700, carpetArea: 1360, noOfBathrooms: 3 },
        { superBuiltUpArea: 1900, carpetArea: 1520, noOfBathrooms: 3 },
      ],
      '3.5bhk': [
        { superBuiltUpArea: 1600, carpetArea: 1280, noOfBathrooms: 3 },
        { superBuiltUpArea: 1800, carpetArea: 1440, noOfBathrooms: 3 },
        { superBuiltUpArea: 2000, carpetArea: 1600, noOfBathrooms: 4 },
      ],
      '4bhk': [
        { superBuiltUpArea: 1900, carpetArea: 1520, noOfBathrooms: 3 },
        { superBuiltUpArea: 2200, carpetArea: 1760, noOfBathrooms: 4 },
        { superBuiltUpArea: 2500, carpetArea: 2000, noOfBathrooms: 4 },
        { superBuiltUpArea: 2800, carpetArea: 2240, noOfBathrooms: 4 },
      ],
      '4.5bhk': [
        { superBuiltUpArea: 2300, carpetArea: 1840, noOfBathrooms: 4 },
        { superBuiltUpArea: 2600, carpetArea: 2080, noOfBathrooms: 4 },
        { superBuiltUpArea: 2900, carpetArea: 2320, noOfBathrooms: 5 },
      ],
      '5bhk': [
        { superBuiltUpArea: 2700, carpetArea: 2160, noOfBathrooms: 4 },
        { superBuiltUpArea: 3000, carpetArea: 2400, noOfBathrooms: 5 },
        { superBuiltUpArea: 3500, carpetArea: 2800, noOfBathrooms: 5 },
        { superBuiltUpArea: 4000, carpetArea: 3200, noOfBathrooms: 5 },
      ],
      '5plus': [
        { superBuiltUpArea: 3500, carpetArea: 2800, noOfBathrooms: 5 },
        { superBuiltUpArea: 4000, carpetArea: 3200, noOfBathrooms: 5 },
        { superBuiltUpArea: 4500, carpetArea: 3600, noOfBathrooms: 6 },
        { superBuiltUpArea: 5000, carpetArea: 4000, noOfBathrooms: 6 },
      ],
    };

    let created = 0;

    // Create built-up areas for each BHK type
    // Since BHK types are now society-specific, we just create built-up areas for each BHK type
    for (const bhkType of allBhkTypes) {
      // Extract the BHK code from the code (format: "property-type-bhk-societyid")
      const parts = bhkType.code.split('-');
      const bhkCode = parts.find((part) =>
        [
          'studio',
          '1rk',
          '1bhk',
          '1.5bhk',
          '2bhk',
          '2.5bhk',
          '3bhk',
          '3.5bhk',
          '4bhk',
          '4.5bhk',
          '5bhk',
          '5plus',
        ].includes(part),
      );

      if (!bhkCode) {
        continue; // Skip if bhkCode not found
      }

      const configurations =
        builtUpAreaData[bhkCode as keyof typeof builtUpAreaData];

      if (configurations) {
        // Select 2-3 configurations randomly for variety
        const numConfigs = Math.floor(Math.random() * 2) + 2; // 2 or 3 configs
        const selectedConfigs = configurations.slice(0, numConfigs);

        for (const config of selectedConfigs) {
          // Check if this configuration already exists for this BHK type
          const whereClause: any = {
            bhkTypeId: bhkType.id,
            superBuiltUpArea: config.superBuiltUpArea,
            carpetArea: config.carpetArea,
            noOfBathrooms: config.noOfBathrooms,
            noOfBedrooms: IsNull(),
            balconies: IsNull(),
          };
          
          // Handle nullable societyId - use IsNull() if null, otherwise use the value
          if (bhkType.societyId === null) {
            whereClause.societyId = IsNull();
          } else {
            whereClause.societyId = bhkType.societyId;
          }

          const existing = await this.builtUpAreaRepository.findOne({
            where: whereClause,
          });

          if (!existing) {
            const builtUpArea = this.builtUpAreaRepository.create({
              societyId: bhkType.societyId,
              bhkTypeId: bhkType.id,
              superBuiltUpArea: config.superBuiltUpArea,
              carpetArea: config.carpetArea,
              noOfBathrooms: config.noOfBathrooms,
              noOfBedrooms: null,
              balconies: null,
            });
            await this.builtUpAreaRepository.save(builtUpArea);
            created++;
          }
        }
      }
    }
    this.logger.log(
      `✓ Created ${created} built-up area configurations for ${allBhkTypes.length} BHK types`,
    );
  }

  private async seedPropertyTypes(): Promise<void> {
    this.logger.log('Seeding property types...');
    // Get listing types and categories first
    const saleType = await this.propertyListingTypeRepository.findOne({
      where: { code: 'sale' },
    });
    const rentType = await this.propertyListingTypeRepository.findOne({
      where: { code: 'rent' },
    });
    const residentialCategory = await this.propertyCategoryRepository.findOne({
      where: { code: 'residential' },
    });
    const commercialCategory = await this.propertyCategoryRepository.findOne({
      where: { code: 'commercial' },
    });

    if (!saleType || !rentType || !residentialCategory || !commercialCategory) {
      this.logger.log(
        '⚠ Skipping property type seeding - prerequisites not met',
      );
      return;
    }

    const propertyTypes = [
      // Residential Rent
      {
        name: 'Flat/Apartment',
        code: 'res-rent-flat',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Independent House',
        code: 'res-rent-house',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Duplex',
        code: 'res-rent-duplex',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Builder Floor',
        code: 'res-rent-builder-floor',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Villa',
        code: 'res-rent-villa',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Penthouse',
        code: 'res-rent-penthouse',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Studio',
        code: 'res-rent-studio',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Farm House',
        code: 'res-rent-farmhouse',
        categoryId: residentialCategory.id,
        listingTypeId: rentType.id,
      },

      // Residential Sale
      {
        name: 'Flat/Apartment',
        code: 'res-sale-flat',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Independent House',
        code: 'res-sale-house',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Duplex',
        code: 'res-sale-duplex',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Builder Floor',
        code: 'res-sale-builder-floor',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Villa',
        code: 'res-sale-villa',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Penthouse',
        code: 'res-sale-penthouse',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: '1 RK/Studio',
        code: 'res-sale-studio',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Farm House',
        code: 'res-sale-farmhouse',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Plot',
        code: 'res-sale-plot',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Agricultural Land',
        code: 'res-sale-agri-land',
        categoryId: residentialCategory.id,
        listingTypeId: saleType.id,
      },

      // Commercial Rent
      {
        name: 'Office',
        code: 'com-rent-office',
        categoryId: commercialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Retail Shop',
        code: 'com-rent-retail-shop',
        categoryId: commercialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Showroom',
        code: 'com-rent-showroom',
        categoryId: commercialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Warehouse',
        code: 'com-rent-warehouse',
        categoryId: commercialCategory.id,
        listingTypeId: rentType.id,
      },
      {
        name: 'Plot',
        code: 'com-rent-plot',
        categoryId: commercialCategory.id,
        listingTypeId: rentType.id,
      },

      // Commercial Sale
      {
        name: 'Office',
        code: 'com-sale-office',
        categoryId: commercialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Retail Shop',
        code: 'com-sale-retail-shop',
        categoryId: commercialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Showroom',
        code: 'com-sale-showroom',
        categoryId: commercialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Warehouse',
        code: 'com-sale-warehouse',
        categoryId: commercialCategory.id,
        listingTypeId: saleType.id,
      },
      {
        name: 'Plot',
        code: 'com-sale-plot',
        categoryId: commercialCategory.id,
        listingTypeId: saleType.id,
      },
    ];

    let created = 0;
    for (const typeData of propertyTypes) {
      const existing = await this.propertyTypeRepository.findOne({
        where: { code: typeData.code },
      });

      if (!existing) {
        const propertyType = this.propertyTypeRepository.create(typeData);
        await this.propertyTypeRepository.save(propertyType);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} property types`);
  }

  private async seedPropertyCategories(): Promise<void> {
    this.logger.log('Seeding property categories...');
    const categories = [
      {
        name: 'Residential',
        code: 'residential',
      },
      {
        name: 'Commercial',
        code: 'commercial',
      },
    ];

    let created = 0;
    for (const categoryData of categories) {
      const existing = await this.propertyCategoryRepository.findOne({
        where: { code: categoryData.code },
      });

      if (!existing) {
        const category = this.propertyCategoryRepository.create(categoryData);
        await this.propertyCategoryRepository.save(category);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} property categories`);
  }

  private async seedCities(): Promise<void> {
    this.logger.log('Seeding cities...');
    const cities = [
      {
        name: 'Gurgaon',
        code: 'gurgaon',
        state: 'Haryana',
        latitude: 28.4595,
        longitude: 77.0266,
      },
      {
        name: 'Delhi',
        code: 'delhi',
        state: 'Delhi',
        latitude: 28.7041,
        longitude: 77.1025,
      },
      {
        name: 'Noida',
        code: 'noida',
        state: 'Uttar Pradesh',
        latitude: 28.5355,
        longitude: 77.391,
      },
      {
        name: 'Mumbai',
        code: 'mumbai',
        state: 'Maharashtra',
        latitude: 19.076,
        longitude: 72.8777,
      },
      {
        name: 'Bangalore',
        code: 'bangalore',
        state: 'Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
      },
    ];

    let created = 0;
    for (const cityData of cities) {
      const existing = await this.cityRepository.findOne({
        where: { code: cityData.code },
      });

      if (!existing) {
        const city = this.cityRepository.create(cityData);
        await this.cityRepository.save(city);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} cities`);
  }

  // Locality seeding removed - localities are now stored as localityName in societies

  private async seedSocieties(): Promise<void> {
    this.logger.log('Seeding societies...');
    const gurgaon = await this.cityRepository.findOne({
      where: { code: 'gurgaon' },
    });
    if (!gurgaon) {
      this.logger.log('⚠ Skipping society seeding - city not found');
      return;
    }

    const societies = [
      {
        name: 'DLF Park Place',
        cityId: gurgaon.id,
        localityName: 'DLF Phase 1',
        address: 'Sector 26, DLF Phase 1, Gurgaon',
        pincode: '122002',
        isVerified: true,
      },
      {
        name: 'DLF Aralias',
        cityId: gurgaon.id,
        localityName: 'Golf Course Road',
        address: 'Golf Course Road, Gurgaon',
        pincode: '122002',
        isVerified: true,
      },
      {
        name: 'DLF Magnolias',
        cityId: gurgaon.id,
        localityName: 'Golf Course Road',
        address: 'Golf Course Road, Gurgaon',
        pincode: '122002',
        isVerified: true,
      },
      {
        name: 'Belaire',
        cityId: gurgaon.id,
        localityName: 'DLF Phase 2',
        address: 'Sector 25, DLF Phase 2, Gurgaon',
        pincode: '122002',
        isVerified: true,
      },
    ];

    let created = 0;
    for (const societyData of societies) {
      const existing = await this.societyRepository.findOne({
        where: { name: societyData.name, cityId: societyData.cityId },
      });

      if (!existing) {
        const society = this.societyRepository.create(societyData);
        await this.societyRepository.save(society);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} societies`);
  }

  /**
   * Seed furnishings master data
   */
  async seedFurnishings(): Promise<void> {
    this.logger.log('Seeding furnishings...');

    const furnishings = [
      { name: 'Water Purifier', code: 'water-purifier', icon: 'water-purifier-icon', sortOrder: 1 },
      { name: 'Fan', code: 'fan', icon: 'fan-icon', sortOrder: 2 },
      { name: 'Fridge', code: 'fridge', icon: 'fridge-icon', sortOrder: 3 },
      { name: 'Exhaust Fan', code: 'exhaust-fan', icon: 'exhaust-fan-icon', sortOrder: 4 },
      { name: 'Dining Table', code: 'dining-table', icon: 'dining-table-icon', sortOrder: 5 },
      { name: 'Geyser', code: 'geyser', icon: 'geyser-icon', sortOrder: 6 },
      { name: 'Stove', code: 'stove', icon: 'stove-icon', sortOrder: 7 },
      { name: 'Light', code: 'light', icon: 'light-icon', sortOrder: 8 },
      { name: 'Curtains', code: 'curtains', icon: 'curtains-icon', sortOrder: 9 },
      { name: 'Modular Kitchen', code: 'modular-kitchen', icon: 'modular-kitchen-icon', sortOrder: 10 },
      { name: 'TV', code: 'tv', icon: 'tv-icon', sortOrder: 11 },
      { name: 'Chimney', code: 'chimney', icon: 'chimney-icon', sortOrder: 12 },
      { name: 'Bed', code: 'bed', icon: 'bed-icon', sortOrder: 13 },
      { name: 'AC', code: 'ac', icon: 'ac-icon', sortOrder: 14 },
      { name: 'Wardrobe', code: 'wardrobe', icon: 'wardrobe-icon', sortOrder: 15 },
      { name: 'Sofa', code: 'sofa', icon: 'sofa-icon', sortOrder: 16 },
      { name: 'Washing Machine', code: 'washing-machine', icon: 'washing-machine-icon', sortOrder: 17 },
      { name: 'Microwave', code: 'microwave', icon: 'microwave-icon', sortOrder: 18 },
    ];

    let created = 0;
    for (const furnishingData of furnishings) {
      const existing = await this.furnishingRepository.findOne({
        where: { code: furnishingData.code },
      });

      if (!existing) {
        const furnishing = this.furnishingRepository.create({
          ...furnishingData,
          isActive: true,
        });
        await this.furnishingRepository.save(furnishing);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} furnishings`);
  }

  /**
   * Seed amenities master data
   */
  async seedAmenities(): Promise<void> {
    this.logger.log('Seeding amenities...');

    const amenities = [
      { name: 'Gymnasium', code: 'gymnasium', icon: 'gymnasium-icon', sortOrder: 1 },
      { name: 'Swimming Pool', code: 'swimming-pool', icon: 'swimming-pool-icon', sortOrder: 2 },
      { name: 'Badminton Court(s)', code: 'badminton-court', icon: 'badminton-court-icon', sortOrder: 3 },
      { name: 'Tennis Court(s)', code: 'tennis-court', icon: 'tennis-court-icon', sortOrder: 4 },
      { name: 'Squash Court', code: 'squash-court', icon: 'squash-court-icon', sortOrder: 5 },
      { name: 'Kids\' Play Areas', code: 'kids-play-areas', icon: 'kids-play-areas-icon', sortOrder: 6 },
      { name: 'Jogging / Cycle Track', code: 'jogging-cycle-track', icon: 'jogging-cycle-track-icon', sortOrder: 7 },
      { name: 'Power Backup', code: 'power-backup', icon: 'power-backup-icon', sortOrder: 8 },
      { name: 'Central AC', code: 'central-ac', icon: 'central-ac-icon', sortOrder: 9 },
      { name: 'Central Wi-Fi', code: 'central-wifi', icon: 'central-wifi-icon', sortOrder: 10 },
      { name: 'Attached Market', code: 'attached-market', icon: 'attached-market-icon', sortOrder: 11 },
      { name: 'Restaurant', code: 'restaurant', icon: 'restaurant-icon', sortOrder: 12 },
      { name: 'Home Automation', code: 'home-automation', icon: 'home-automation-icon', sortOrder: 13 },
      { name: '24 x 7 Security', code: '24x7-security', icon: '24x7-security-icon', sortOrder: 14 },
      { name: 'Clubhouse', code: 'clubhouse', icon: 'clubhouse-icon', sortOrder: 15 },
      { name: 'Balcony', code: 'balcony', icon: 'balcony-icon', sortOrder: 16 },
      { name: 'High Speed Elevators', code: 'high-speed-elevators', icon: 'high-speed-elevators-icon', sortOrder: 17 },
      { name: 'Pre-School', code: 'pre-school', icon: 'pre-school-icon', sortOrder: 18 },
      { name: 'Medical Facility', code: 'medical-facility', icon: 'medical-facility-icon', sortOrder: 19 },
      { name: 'Day Care Center', code: 'day-care-center', icon: 'day-care-center-icon', sortOrder: 20 },
      { name: 'Pet Area', code: 'pet-area', icon: 'pet-area-icon', sortOrder: 21 },
      { name: 'Indoor Games', code: 'indoor-games', icon: 'indoor-games-icon', sortOrder: 22 },
      { name: 'Conference Room', code: 'conference-room', icon: 'conference-room-icon', sortOrder: 23 },
      { name: 'Large Green Area', code: 'large-green-area', icon: 'large-green-area-icon', sortOrder: 24 },
      { name: 'Concierge Desk', code: 'concierge-desk', icon: 'concierge-desk-icon', sortOrder: 25 },
      { name: 'Helipad', code: 'helipad', icon: 'helipad-icon', sortOrder: 26 },
      { name: 'Golf Course', code: 'golf-course', icon: 'golf-course-icon', sortOrder: 27 },
      { name: 'Multiplex', code: 'multiplex', icon: 'multiplex-icon', sortOrder: 28 },
      { name: 'Visitor\'s Parking', code: 'visitors-parking', icon: 'visitors-parking-icon', sortOrder: 29 },
      { name: 'Serviced Apartments', code: 'serviced-apartments', icon: 'serviced-apartments-icon', sortOrder: 30 },
      { name: 'Service Elevators', code: 'service-elevators', icon: 'service-elevators-icon', sortOrder: 31 },
      { name: 'High Street Retail', code: 'high-street-retail', icon: 'high-street-retail-icon', sortOrder: 32 },
      { name: 'Hypermarket', code: 'hypermarket', icon: 'hypermarket-icon', sortOrder: 33 },
      { name: 'ATM\'s', code: 'atms', icon: 'atms-icon', sortOrder: 34 },
      { name: 'Food Court', code: 'food-court', icon: 'food-court-icon', sortOrder: 35 },
      { name: 'Servant Quarter', code: 'servant-quarter', icon: 'servant-quarter-icon', sortOrder: 36 },
      { name: 'Study Room', code: 'study-room', icon: 'study-room-icon', sortOrder: 37 },
      { name: 'Private Pool', code: 'private-pool', icon: 'private-pool-icon', sortOrder: 38 },
      { name: 'Private Gym', code: 'private-gym', icon: 'private-gym-icon', sortOrder: 39 },
      { name: 'Private Jacuzzi', code: 'private-jacuzzi', icon: 'private-jacuzzi-icon', sortOrder: 40 },
      { name: 'View of Water', code: 'view-of-water', icon: 'view-of-water-icon', sortOrder: 41 },
      { name: 'View of Landmark', code: 'view-of-landmark', icon: 'view-of-landmark-icon', sortOrder: 42 },
      { name: 'Built in Wardrobes', code: 'built-in-wardrobes', icon: 'built-in-wardrobes-icon', sortOrder: 43 },
      { name: 'Walk-in Closet', code: 'walk-in-closet', icon: 'walk-in-closet-icon', sortOrder: 44 },
      { name: 'Lobby in Building', code: 'lobby-in-building', icon: 'lobby-in-building-icon', sortOrder: 45 },
      { name: 'Barbeque Area', code: 'barbeque-area', icon: 'barbeque-area-icon', sortOrder: 46 },
      { name: 'Centrally Air-Conditioned', code: 'centrally-air-conditioned', icon: 'centrally-air-conditioned-icon', sortOrder: 47 },
      { name: 'Central Heating', code: 'central-heating', icon: 'central-heating-icon', sortOrder: 48 },
      { name: 'First Aid Medical Center', code: 'first-aid-medical-center', icon: 'first-aid-medical-center-icon', sortOrder: 49 },
      { name: 'Tiles', code: 'tiles', icon: 'tiles-icon', sortOrder: 50 },
      { name: 'Double Glazed Windows', code: 'double-glazed-windows', icon: 'double-glazed-windows-icon', sortOrder: 51 },
      { name: 'Reception/Waiting Room', code: 'reception-waiting-room', icon: 'reception-waiting-room-icon', sortOrder: 52 },
      { name: 'Intercom', code: 'intercom', icon: 'intercom-icon', sortOrder: 53 },
      { name: 'Electricity Backup', code: 'electricity-backup', icon: 'electricity-backup-icon', sortOrder: 54 },
      { name: 'Waste Disposal', code: 'waste-disposal', icon: 'waste-disposal-icon', sortOrder: 55 },
      { name: 'CCTV Security', code: 'cctv-security', icon: 'cctv-security-icon', sortOrder: 56 },
      { name: 'Maintenance Staff', code: 'maintenance-staff', icon: 'maintenance-staff-icon', sortOrder: 57 },
      { name: 'Broadband Internet', code: 'broadband-internet', icon: 'broadband-internet-icon', sortOrder: 58 },
      { name: 'Satellite/Cable TV', code: 'satellite-cable-tv', icon: 'satellite-cable-tv-icon', sortOrder: 59 },
      { name: '24 Hours Concierge', code: '24-hours-concierge', icon: '24-hours-concierge-icon', sortOrder: 60 },
      { name: 'Laundry Facility', code: 'laundry-facility', icon: 'laundry-facility-icon', sortOrder: 61 },
      { name: 'Jacuzzi', code: 'jacuzzi', icon: 'jacuzzi-icon', sortOrder: 62 },
      { name: 'Security Staff', code: 'security-staff', icon: 'security-staff-icon', sortOrder: 63 },
      { name: 'Balcony or Terrace', code: 'balcony-or-terrace', icon: 'balcony-or-terrace-icon', sortOrder: 64 },
      { name: 'Sauna', code: 'sauna', icon: 'sauna-icon', sortOrder: 65 },
      { name: 'Cleaning Services', code: 'cleaning-services', icon: 'cleaning-services-icon', sortOrder: 66 },
      { name: 'Facilities for Disabled', code: 'facilities-for-disabled', icon: 'facilities-for-disabled-icon', sortOrder: 67 },
    ];

    let created = 0;
    for (const amenityData of amenities) {
      const existing = await this.amenityRepository.findOne({
        where: { code: amenityData.code },
      });

      if (!existing) {
        const amenity = this.amenityRepository.create({
          ...amenityData,
          isActive: true,
        });
        await this.amenityRepository.save(amenity);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} amenities`);
  }

  /**
   * Delete and reseed only amenities
   */
  async reseedAmenities(): Promise<{ message: string; details: any }> {
    const startTime = Date.now();

    try {
      // Delete existing amenities
      const amenitiesCount = await this.amenityRepository.count();
      if (amenitiesCount > 0) {
        await this.amenityRepository
          .createQueryBuilder()
          .delete()
          .where('id IS NOT NULL')
          .execute();
        this.logger.log(`Deleted ${amenitiesCount} amenities`);
      }

      // Seed amenities
      await this.seedAmenities();

      const newCount = await this.amenityRepository.count();
      const duration = Date.now() - startTime;

      return {
        message: 'Amenities reseeded successfully',
        details: {
          duration: `${duration}ms`,
          counts: {
            amenitiesBefore: amenitiesCount,
            amenitiesAfter: newCount,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error during amenities reseeding:', error);
      throw error;
    }
  }
}
