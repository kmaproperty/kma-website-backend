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

  /**
   * Seed property types master data
   */
  async seedPropertyTypes(): Promise<void> {
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

  /**
   * Delete and reseed only property types
   */
  async reseedPropertyTypes(): Promise<{ message: string; details: any }> {
    const startTime = Date.now();

    try {
      // Delete existing property types
      const propertyTypesBefore = await this.propertyTypeRepository.count();
      if (propertyTypesBefore > 0) {
        await this.propertyTypeRepository
          .createQueryBuilder()
          .delete()
          .where('id IS NOT NULL')
          .execute();
        this.logger.log(`Deleted ${propertyTypesBefore} property types`);
      }

      // Seed property types
      await this.seedPropertyTypes();

      const propertyTypesAfter = await this.propertyTypeRepository.count();
      const duration = Date.now() - startTime;

      return {
        message: 'Property types reseeded successfully',
        details: {
          duration: `${duration}ms`,
          counts: {
            propertyTypesBefore,
            propertyTypesAfter,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error during property types reseeding:', error);
      throw error;
    }
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
      // ===== Existing cities (do not change codes) =====
      { name: 'Gurgaon', code: 'gurgaon', state: 'Haryana', latitude: 28.4595, longitude: 77.0266 },
      { name: 'Delhi', code: 'delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
      { name: 'Noida', code: 'noida', state: 'Uttar Pradesh', latitude: 28.5355, longitude: 77.391 },
      { name: 'Mumbai', code: 'mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.8777 },
      { name: 'Bangalore', code: 'bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },

      // ===== Andhra Pradesh =====
      { name: 'Visakhapatnam', code: 'visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 },
      { name: 'Vijayawada', code: 'vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
      { name: 'Guntur', code: 'guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
      { name: 'Nellore', code: 'nellore', state: 'Andhra Pradesh', latitude: 14.4426, longitude: 79.9865 },
      { name: 'Kurnool', code: 'kurnool', state: 'Andhra Pradesh', latitude: 15.8281, longitude: 78.0373 },
      { name: 'Rajahmundry', code: 'rajahmundry', state: 'Andhra Pradesh', latitude: 17.0005, longitude: 81.8040 },
      { name: 'Tirupati', code: 'tirupati', state: 'Andhra Pradesh', latitude: 13.6288, longitude: 79.4192 },
      { name: 'Kakinada', code: 'kakinada', state: 'Andhra Pradesh', latitude: 16.9891, longitude: 82.2475 },
      { name: 'Kadapa', code: 'kadapa', state: 'Andhra Pradesh', latitude: 14.4674, longitude: 78.8241 },
      { name: 'Anantapur', code: 'anantapur', state: 'Andhra Pradesh', latitude: 14.6819, longitude: 77.6006 },
      { name: 'Amaravati', code: 'amaravati', state: 'Andhra Pradesh', latitude: 16.5131, longitude: 80.5150 },

      // ===== Arunachal Pradesh =====
      { name: 'Itanagar', code: 'itanagar', state: 'Arunachal Pradesh', latitude: 27.0844, longitude: 93.6053 },
      { name: 'Naharlagun', code: 'naharlagun', state: 'Arunachal Pradesh', latitude: 27.1045, longitude: 93.6942 },
      { name: 'Pasighat', code: 'pasighat', state: 'Arunachal Pradesh', latitude: 28.0670, longitude: 95.3269 },
      { name: 'Tawang', code: 'tawang', state: 'Arunachal Pradesh', latitude: 27.5860, longitude: 91.8687 },
      { name: 'Ziro', code: 'ziro', state: 'Arunachal Pradesh', latitude: 27.5945, longitude: 93.8260 },

      // ===== Assam =====
      { name: 'Guwahati', code: 'guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362 },
      { name: 'Silchar', code: 'silchar', state: 'Assam', latitude: 24.8333, longitude: 92.7789 },
      { name: 'Dibrugarh', code: 'dibrugarh', state: 'Assam', latitude: 27.4728, longitude: 94.9120 },
      { name: 'Jorhat', code: 'jorhat', state: 'Assam', latitude: 26.7509, longitude: 94.2037 },
      { name: 'Nagaon', code: 'nagaon', state: 'Assam', latitude: 26.3500, longitude: 92.6840 },
      { name: 'Tinsukia', code: 'tinsukia', state: 'Assam', latitude: 27.4922, longitude: 95.3547 },
      { name: 'Tezpur', code: 'tezpur', state: 'Assam', latitude: 26.6338, longitude: 92.8006 },

      // ===== Bihar =====
      { name: 'Patna', code: 'patna', state: 'Bihar', latitude: 25.6093, longitude: 85.1376 },
      { name: 'Gaya', code: 'gaya', state: 'Bihar', latitude: 24.7955, longitude: 84.9994 },
      { name: 'Bhagalpur', code: 'bhagalpur', state: 'Bihar', latitude: 25.2425, longitude: 86.9842 },
      { name: 'Muzaffarpur', code: 'muzaffarpur', state: 'Bihar', latitude: 26.1209, longitude: 85.3647 },
      { name: 'Purnia', code: 'purnia', state: 'Bihar', latitude: 25.7771, longitude: 87.4753 },
      { name: 'Darbhanga', code: 'darbhanga', state: 'Bihar', latitude: 26.1542, longitude: 85.8918 },
      { name: 'Bihar Sharif', code: 'bihar-sharif', state: 'Bihar', latitude: 25.1982, longitude: 85.5204 },
      { name: 'Arrah', code: 'arrah', state: 'Bihar', latitude: 25.5541, longitude: 84.6603 },
      { name: 'Begusarai', code: 'begusarai', state: 'Bihar', latitude: 25.4182, longitude: 86.1272 },

      // ===== Chhattisgarh =====
      { name: 'Raipur', code: 'raipur', state: 'Chhattisgarh', latitude: 21.2514, longitude: 81.6296 },
      { name: 'Bhilai', code: 'bhilai', state: 'Chhattisgarh', latitude: 21.2094, longitude: 81.3784 },
      { name: 'Bilaspur', code: 'bilaspur-cg', state: 'Chhattisgarh', latitude: 22.0797, longitude: 82.1409 },
      { name: 'Korba', code: 'korba', state: 'Chhattisgarh', latitude: 22.3595, longitude: 82.7501 },
      { name: 'Durg', code: 'durg', state: 'Chhattisgarh', latitude: 21.1904, longitude: 81.2849 },
      { name: 'Rajnandgaon', code: 'rajnandgaon', state: 'Chhattisgarh', latitude: 21.0974, longitude: 81.0280 },
      { name: 'Jagdalpur', code: 'jagdalpur', state: 'Chhattisgarh', latitude: 19.0780, longitude: 82.0206 },

      // ===== Goa =====
      { name: 'Panaji', code: 'panaji', state: 'Goa', latitude: 15.4909, longitude: 73.8278 },
      { name: 'Margao', code: 'margao', state: 'Goa', latitude: 15.2832, longitude: 73.9862 },
      { name: 'Vasco da Gama', code: 'vasco-da-gama', state: 'Goa', latitude: 15.3982, longitude: 73.8113 },
      { name: 'Mapusa', code: 'mapusa', state: 'Goa', latitude: 15.5915, longitude: 73.8101 },
      { name: 'Ponda', code: 'ponda', state: 'Goa', latitude: 15.4006, longitude: 74.0083 },

      // ===== Gujarat =====
      { name: 'Ahmedabad', code: 'ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
      { name: 'Surat', code: 'surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
      { name: 'Vadodara', code: 'vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
      { name: 'Rajkot', code: 'rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
      { name: 'Bhavnagar', code: 'bhavnagar', state: 'Gujarat', latitude: 21.7645, longitude: 72.1519 },
      { name: 'Jamnagar', code: 'jamnagar', state: 'Gujarat', latitude: 22.4707, longitude: 70.0577 },
      { name: 'Junagadh', code: 'junagadh', state: 'Gujarat', latitude: 21.5222, longitude: 70.4579 },
      { name: 'Gandhinagar', code: 'gandhinagar', state: 'Gujarat', latitude: 23.2156, longitude: 72.6369 },
      { name: 'Anand', code: 'anand', state: 'Gujarat', latitude: 22.5645, longitude: 72.9289 },
      { name: 'Morbi', code: 'morbi', state: 'Gujarat', latitude: 22.8120, longitude: 70.8370 },

      // ===== Haryana (additional cities) =====
      { name: 'Faridabad', code: 'faridabad', state: 'Haryana', latitude: 28.4089, longitude: 77.3178 },
      { name: 'Panipat', code: 'panipat', state: 'Haryana', latitude: 29.3909, longitude: 76.9635 },
      { name: 'Ambala', code: 'ambala', state: 'Haryana', latitude: 30.3782, longitude: 76.7767 },
      { name: 'Karnal', code: 'karnal', state: 'Haryana', latitude: 29.6857, longitude: 76.9905 },
      { name: 'Hisar', code: 'hisar', state: 'Haryana', latitude: 29.1492, longitude: 75.7217 },
      { name: 'Rohtak', code: 'rohtak', state: 'Haryana', latitude: 28.8955, longitude: 76.6066 },
      { name: 'Sonipat', code: 'sonipat', state: 'Haryana', latitude: 28.9931, longitude: 77.0151 },
      { name: 'Panchkula', code: 'panchkula', state: 'Haryana', latitude: 30.6942, longitude: 76.8606 },

      // ===== Himachal Pradesh =====
      { name: 'Shimla', code: 'shimla', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734 },
      { name: 'Manali', code: 'manali', state: 'Himachal Pradesh', latitude: 32.2396, longitude: 77.1887 },
      { name: 'Dharamshala', code: 'dharamshala', state: 'Himachal Pradesh', latitude: 32.2190, longitude: 76.3234 },
      { name: 'Solan', code: 'solan', state: 'Himachal Pradesh', latitude: 30.9045, longitude: 77.0967 },
      { name: 'Mandi', code: 'mandi', state: 'Himachal Pradesh', latitude: 31.7100, longitude: 76.9316 },
      { name: 'Kullu', code: 'kullu', state: 'Himachal Pradesh', latitude: 31.9592, longitude: 77.1089 },
      { name: 'Hamirpur', code: 'hamirpur-hp', state: 'Himachal Pradesh', latitude: 31.6862, longitude: 76.5213 },

      // ===== Jharkhand =====
      { name: 'Ranchi', code: 'ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096 },
      { name: 'Jamshedpur', code: 'jamshedpur', state: 'Jharkhand', latitude: 22.8046, longitude: 86.2029 },
      { name: 'Dhanbad', code: 'dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
      { name: 'Bokaro', code: 'bokaro', state: 'Jharkhand', latitude: 23.6693, longitude: 86.1511 },
      { name: 'Deoghar', code: 'deoghar', state: 'Jharkhand', latitude: 24.4764, longitude: 86.6944 },
      { name: 'Hazaribagh', code: 'hazaribagh', state: 'Jharkhand', latitude: 23.9966, longitude: 85.3637 },
      { name: 'Giridih', code: 'giridih', state: 'Jharkhand', latitude: 24.1854, longitude: 86.3003 },

      // ===== Karnataka (additional cities) =====
      { name: 'Mysore', code: 'mysore', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
      { name: 'Hubli', code: 'hubli', state: 'Karnataka', latitude: 15.3647, longitude: 75.1240 },
      { name: 'Mangalore', code: 'mangalore', state: 'Karnataka', latitude: 12.9141, longitude: 74.8560 },
      { name: 'Belgaum', code: 'belgaum', state: 'Karnataka', latitude: 15.8497, longitude: 74.4977 },
      { name: 'Gulbarga', code: 'gulbarga', state: 'Karnataka', latitude: 17.3297, longitude: 76.8343 },
      { name: 'Davangere', code: 'davangere', state: 'Karnataka', latitude: 14.4644, longitude: 75.9218 },
      { name: 'Bellary', code: 'bellary', state: 'Karnataka', latitude: 15.1394, longitude: 76.9214 },
      { name: 'Shimoga', code: 'shimoga', state: 'Karnataka', latitude: 13.9299, longitude: 75.5681 },
      { name: 'Tumkur', code: 'tumkur', state: 'Karnataka', latitude: 13.3379, longitude: 77.1173 },
      { name: 'Udupi', code: 'udupi', state: 'Karnataka', latitude: 13.3409, longitude: 74.7421 },

      // ===== Kerala =====
      { name: 'Thiruvananthapuram', code: 'thiruvananthapuram', state: 'Kerala', latitude: 8.5241, longitude: 76.9366 },
      { name: 'Kochi', code: 'kochi', state: 'Kerala', latitude: 9.9312, longitude: 76.2673 },
      { name: 'Kozhikode', code: 'kozhikode', state: 'Kerala', latitude: 11.2588, longitude: 75.7804 },
      { name: 'Thrissur', code: 'thrissur', state: 'Kerala', latitude: 10.5276, longitude: 76.2144 },
      { name: 'Kollam', code: 'kollam', state: 'Kerala', latitude: 8.8932, longitude: 76.6141 },
      { name: 'Kannur', code: 'kannur', state: 'Kerala', latitude: 11.8745, longitude: 75.3704 },
      { name: 'Alappuzha', code: 'alappuzha', state: 'Kerala', latitude: 9.4981, longitude: 76.3388 },
      { name: 'Palakkad', code: 'palakkad', state: 'Kerala', latitude: 10.7867, longitude: 76.6548 },
      { name: 'Malappuram', code: 'malappuram', state: 'Kerala', latitude: 11.0510, longitude: 76.0711 },
      { name: 'Kottayam', code: 'kottayam', state: 'Kerala', latitude: 9.5916, longitude: 76.5222 },

      // ===== Madhya Pradesh =====
      { name: 'Bhopal', code: 'bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
      { name: 'Indore', code: 'indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
      { name: 'Jabalpur', code: 'jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },
      { name: 'Gwalior', code: 'gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
      { name: 'Ujjain', code: 'ujjain', state: 'Madhya Pradesh', latitude: 23.1765, longitude: 75.7885 },
      { name: 'Sagar', code: 'sagar', state: 'Madhya Pradesh', latitude: 23.8388, longitude: 78.7378 },
      { name: 'Dewas', code: 'dewas', state: 'Madhya Pradesh', latitude: 22.9676, longitude: 76.0534 },
      { name: 'Satna', code: 'satna', state: 'Madhya Pradesh', latitude: 24.5004, longitude: 80.8322 },
      { name: 'Ratlam', code: 'ratlam', state: 'Madhya Pradesh', latitude: 23.3315, longitude: 75.0367 },
      { name: 'Rewa', code: 'rewa', state: 'Madhya Pradesh', latitude: 24.5373, longitude: 81.2960 },

      // ===== Maharashtra (additional cities) =====
      { name: 'Pune', code: 'pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
      { name: 'Nagpur', code: 'nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
      { name: 'Thane', code: 'thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
      { name: 'Nashik', code: 'nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
      { name: 'Aurangabad', code: 'aurangabad', state: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
      { name: 'Solapur', code: 'solapur', state: 'Maharashtra', latitude: 17.6599, longitude: 75.9064 },
      { name: 'Kolhapur', code: 'kolhapur', state: 'Maharashtra', latitude: 16.7050, longitude: 74.2433 },
      { name: 'Navi Mumbai', code: 'navi-mumbai', state: 'Maharashtra', latitude: 19.0330, longitude: 73.0297 },
      { name: 'Amravati', code: 'amravati', state: 'Maharashtra', latitude: 20.9374, longitude: 77.7796 },
      { name: 'Sangli', code: 'sangli', state: 'Maharashtra', latitude: 16.8524, longitude: 74.5815 },

      // ===== Manipur =====
      { name: 'Imphal', code: 'imphal', state: 'Manipur', latitude: 24.8170, longitude: 93.9368 },
      { name: 'Thoubal', code: 'thoubal', state: 'Manipur', latitude: 24.6300, longitude: 94.0100 },
      { name: 'Bishnupur', code: 'bishnupur-mn', state: 'Manipur', latitude: 24.6260, longitude: 93.7800 },
      { name: 'Churachandpur', code: 'churachandpur', state: 'Manipur', latitude: 24.3337, longitude: 93.6835 },
      { name: 'Kakching', code: 'kakching', state: 'Manipur', latitude: 24.4980, longitude: 93.9820 },

      // ===== Meghalaya =====
      { name: 'Shillong', code: 'shillong', state: 'Meghalaya', latitude: 25.5788, longitude: 91.8933 },
      { name: 'Tura', code: 'tura', state: 'Meghalaya', latitude: 25.5145, longitude: 90.2186 },
      { name: 'Jowai', code: 'jowai', state: 'Meghalaya', latitude: 25.4530, longitude: 92.2020 },
      { name: 'Nongstoin', code: 'nongstoin', state: 'Meghalaya', latitude: 25.5170, longitude: 91.2640 },
      { name: 'Williamnagar', code: 'williamnagar', state: 'Meghalaya', latitude: 25.4930, longitude: 90.6170 },

      // ===== Mizoram =====
      { name: 'Aizawl', code: 'aizawl', state: 'Mizoram', latitude: 23.7271, longitude: 92.7176 },
      { name: 'Lunglei', code: 'lunglei', state: 'Mizoram', latitude: 22.8870, longitude: 92.7336 },
      { name: 'Champhai', code: 'champhai', state: 'Mizoram', latitude: 23.4567, longitude: 93.3281 },
      { name: 'Serchhip', code: 'serchhip', state: 'Mizoram', latitude: 23.3044, longitude: 92.8455 },
      { name: 'Kolasib', code: 'kolasib', state: 'Mizoram', latitude: 24.2238, longitude: 92.6789 },

      // ===== Nagaland =====
      { name: 'Kohima', code: 'kohima', state: 'Nagaland', latitude: 25.6751, longitude: 94.1086 },
      { name: 'Dimapur', code: 'dimapur', state: 'Nagaland', latitude: 25.8697, longitude: 93.7220 },
      { name: 'Mokokchung', code: 'mokokchung', state: 'Nagaland', latitude: 26.3222, longitude: 94.5191 },
      { name: 'Tuensang', code: 'tuensang', state: 'Nagaland', latitude: 26.2710, longitude: 94.8270 },
      { name: 'Wokha', code: 'wokha', state: 'Nagaland', latitude: 26.1000, longitude: 94.2660 },

      // ===== Odisha =====
      { name: 'Bhubaneswar', code: 'bhubaneswar', state: 'Odisha', latitude: 20.2961, longitude: 85.8245 },
      { name: 'Cuttack', code: 'cuttack', state: 'Odisha', latitude: 20.4625, longitude: 85.8830 },
      { name: 'Rourkela', code: 'rourkela', state: 'Odisha', latitude: 22.2604, longitude: 84.8536 },
      { name: 'Berhampur', code: 'berhampur', state: 'Odisha', latitude: 19.3150, longitude: 84.7941 },
      { name: 'Sambalpur', code: 'sambalpur', state: 'Odisha', latitude: 21.4669, longitude: 83.9812 },
      { name: 'Puri', code: 'puri', state: 'Odisha', latitude: 19.7983, longitude: 85.8249 },
      { name: 'Balasore', code: 'balasore', state: 'Odisha', latitude: 21.4942, longitude: 86.9337 },
      { name: 'Bhadrak', code: 'bhadrak', state: 'Odisha', latitude: 21.0517, longitude: 86.4958 },

      // ===== Punjab =====
      { name: 'Ludhiana', code: 'ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
      { name: 'Amritsar', code: 'amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723 },
      { name: 'Jalandhar', code: 'jalandhar', state: 'Punjab', latitude: 31.3260, longitude: 75.5762 },
      { name: 'Patiala', code: 'patiala', state: 'Punjab', latitude: 30.3398, longitude: 76.3869 },
      { name: 'Bathinda', code: 'bathinda', state: 'Punjab', latitude: 30.2110, longitude: 74.9455 },
      { name: 'Mohali', code: 'mohali', state: 'Punjab', latitude: 30.7046, longitude: 76.7179 },
      { name: 'Pathankot', code: 'pathankot', state: 'Punjab', latitude: 32.2643, longitude: 75.6421 },
      { name: 'Hoshiarpur', code: 'hoshiarpur', state: 'Punjab', latitude: 31.5143, longitude: 75.9115 },

      // ===== Rajasthan =====
      { name: 'Jaipur', code: 'jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
      { name: 'Jodhpur', code: 'jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
      { name: 'Udaipur', code: 'udaipur', state: 'Rajasthan', latitude: 24.5854, longitude: 73.7125 },
      { name: 'Kota', code: 'kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
      { name: 'Ajmer', code: 'ajmer', state: 'Rajasthan', latitude: 26.4499, longitude: 74.6399 },
      { name: 'Bikaner', code: 'bikaner', state: 'Rajasthan', latitude: 28.0229, longitude: 73.3119 },
      { name: 'Bhilwara', code: 'bhilwara', state: 'Rajasthan', latitude: 25.3407, longitude: 74.6313 },
      { name: 'Alwar', code: 'alwar', state: 'Rajasthan', latitude: 27.5530, longitude: 76.6346 },
      { name: 'Sikar', code: 'sikar', state: 'Rajasthan', latitude: 27.6094, longitude: 75.1398 },
      { name: 'Sri Ganganagar', code: 'sri-ganganagar', state: 'Rajasthan', latitude: 29.9094, longitude: 73.8790 },

      // ===== Sikkim =====
      { name: 'Gangtok', code: 'gangtok', state: 'Sikkim', latitude: 27.3389, longitude: 88.6065 },
      { name: 'Namchi', code: 'namchi', state: 'Sikkim', latitude: 27.1667, longitude: 88.3500 },
      { name: 'Gyalshing', code: 'gyalshing', state: 'Sikkim', latitude: 27.2867, longitude: 88.2567 },
      { name: 'Mangan', code: 'mangan', state: 'Sikkim', latitude: 27.5100, longitude: 88.5300 },
      { name: 'Rangpo', code: 'rangpo', state: 'Sikkim', latitude: 27.1750, longitude: 88.5330 },

      // ===== Tamil Nadu =====
      { name: 'Chennai', code: 'chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
      { name: 'Coimbatore', code: 'coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
      { name: 'Madurai', code: 'madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
      { name: 'Tiruchirappalli', code: 'tiruchirappalli', state: 'Tamil Nadu', latitude: 10.7905, longitude: 78.7047 },
      { name: 'Salem', code: 'salem', state: 'Tamil Nadu', latitude: 11.6643, longitude: 78.1460 },
      { name: 'Tirunelveli', code: 'tirunelveli', state: 'Tamil Nadu', latitude: 8.7139, longitude: 77.7567 },
      { name: 'Erode', code: 'erode', state: 'Tamil Nadu', latitude: 11.3410, longitude: 77.7172 },
      { name: 'Vellore', code: 'vellore', state: 'Tamil Nadu', latitude: 12.9165, longitude: 79.1325 },
      { name: 'Tiruppur', code: 'tiruppur', state: 'Tamil Nadu', latitude: 11.1085, longitude: 77.3411 },
      { name: 'Thoothukudi', code: 'thoothukudi', state: 'Tamil Nadu', latitude: 8.7642, longitude: 78.1348 },

      // ===== Telangana =====
      { name: 'Hyderabad', code: 'hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
      { name: 'Warangal', code: 'warangal', state: 'Telangana', latitude: 17.9784, longitude: 79.5941 },
      { name: 'Nizamabad', code: 'nizamabad', state: 'Telangana', latitude: 18.6725, longitude: 78.0941 },
      { name: 'Karimnagar', code: 'karimnagar', state: 'Telangana', latitude: 18.4386, longitude: 79.1288 },
      { name: 'Khammam', code: 'khammam', state: 'Telangana', latitude: 17.2473, longitude: 80.1514 },
      { name: 'Mahbubnagar', code: 'mahbubnagar', state: 'Telangana', latitude: 16.7488, longitude: 77.9850 },
      { name: 'Nalgonda', code: 'nalgonda', state: 'Telangana', latitude: 17.0500, longitude: 79.2667 },
      { name: 'Secunderabad', code: 'secunderabad', state: 'Telangana', latitude: 17.4399, longitude: 78.4983 },

      // ===== Tripura =====
      { name: 'Agartala', code: 'agartala', state: 'Tripura', latitude: 23.8315, longitude: 91.2868 },
      { name: 'Udaipur', code: 'udaipur-tripura', state: 'Tripura', latitude: 23.5333, longitude: 91.4833 },
      { name: 'Dharmanagar', code: 'dharmanagar', state: 'Tripura', latitude: 24.3800, longitude: 92.1680 },
      { name: 'Kailasahar', code: 'kailasahar', state: 'Tripura', latitude: 24.3310, longitude: 92.0050 },
      { name: 'Ambassa', code: 'ambassa', state: 'Tripura', latitude: 23.9200, longitude: 91.8500 },

      // ===== Uttar Pradesh (additional cities) =====
      { name: 'Lucknow', code: 'lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
      { name: 'Kanpur', code: 'kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
      { name: 'Agra', code: 'agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
      { name: 'Varanasi', code: 'varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
      { name: 'Prayagraj', code: 'prayagraj', state: 'Uttar Pradesh', latitude: 25.4358, longitude: 81.8463 },
      { name: 'Meerut', code: 'meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },
      { name: 'Ghaziabad', code: 'ghaziabad', state: 'Uttar Pradesh', latitude: 28.6692, longitude: 77.4538 },
      { name: 'Bareilly', code: 'bareilly', state: 'Uttar Pradesh', latitude: 28.3670, longitude: 79.4304 },
      { name: 'Aligarh', code: 'aligarh', state: 'Uttar Pradesh', latitude: 27.8974, longitude: 78.0880 },
      { name: 'Moradabad', code: 'moradabad', state: 'Uttar Pradesh', latitude: 28.8386, longitude: 78.7733 },
      { name: 'Gorakhpur', code: 'gorakhpur', state: 'Uttar Pradesh', latitude: 26.7606, longitude: 83.3732 },
      { name: 'Mathura', code: 'mathura', state: 'Uttar Pradesh', latitude: 27.4924, longitude: 77.6737 },
      { name: 'Greater Noida', code: 'greater-noida', state: 'Uttar Pradesh', latitude: 28.4744, longitude: 77.5040 },

      // ===== Uttarakhand =====
      { name: 'Dehradun', code: 'dehradun', state: 'Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
      { name: 'Haridwar', code: 'haridwar', state: 'Uttarakhand', latitude: 29.9457, longitude: 78.1642 },
      { name: 'Rishikesh', code: 'rishikesh', state: 'Uttarakhand', latitude: 30.0869, longitude: 78.2676 },
      { name: 'Haldwani', code: 'haldwani', state: 'Uttarakhand', latitude: 29.2183, longitude: 79.5130 },
      { name: 'Roorkee', code: 'roorkee', state: 'Uttarakhand', latitude: 29.8543, longitude: 77.8880 },
      { name: 'Kashipur', code: 'kashipur', state: 'Uttarakhand', latitude: 29.2138, longitude: 78.9629 },
      { name: 'Rudrapur', code: 'rudrapur', state: 'Uttarakhand', latitude: 28.9739, longitude: 79.4040 },
      { name: 'Nainital', code: 'nainital', state: 'Uttarakhand', latitude: 29.3803, longitude: 79.4636 },
      { name: 'Mussoorie', code: 'mussoorie', state: 'Uttarakhand', latitude: 30.4598, longitude: 78.0644 },

      // ===== West Bengal =====
      { name: 'Kolkata', code: 'kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
      { name: 'Howrah', code: 'howrah', state: 'West Bengal', latitude: 22.5958, longitude: 88.2636 },
      { name: 'Durgapur', code: 'durgapur', state: 'West Bengal', latitude: 23.5204, longitude: 87.3119 },
      { name: 'Asansol', code: 'asansol', state: 'West Bengal', latitude: 23.6739, longitude: 86.9524 },
      { name: 'Siliguri', code: 'siliguri', state: 'West Bengal', latitude: 26.7271, longitude: 88.3953 },
      { name: 'Bardhaman', code: 'bardhaman', state: 'West Bengal', latitude: 23.2324, longitude: 87.8615 },
      { name: 'Malda', code: 'malda', state: 'West Bengal', latitude: 25.0108, longitude: 88.1411 },
      { name: 'Kharagpur', code: 'kharagpur', state: 'West Bengal', latitude: 22.3460, longitude: 87.2320 },
      { name: 'Haldia', code: 'haldia', state: 'West Bengal', latitude: 22.0257, longitude: 88.0583 },
      { name: 'Baharampur', code: 'baharampur', state: 'West Bengal', latitude: 24.1024, longitude: 88.2516 },

      // ===== Andaman and Nicobar Islands =====
      { name: 'Port Blair', code: 'port-blair', state: 'Andaman and Nicobar Islands', latitude: 11.6234, longitude: 92.7265 },
      { name: 'Car Nicobar', code: 'car-nicobar', state: 'Andaman and Nicobar Islands', latitude: 9.1556, longitude: 92.8198 },
      { name: 'Mayabunder', code: 'mayabunder', state: 'Andaman and Nicobar Islands', latitude: 12.9253, longitude: 92.9010 },
      { name: 'Diglipur', code: 'diglipur', state: 'Andaman and Nicobar Islands', latitude: 13.2673, longitude: 93.0090 },
      { name: 'Havelock Island', code: 'havelock-island', state: 'Andaman and Nicobar Islands', latitude: 12.0170, longitude: 93.0020 },

      // ===== Chandigarh =====
      { name: 'Chandigarh', code: 'chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },

      // ===== Dadra and Nagar Haveli and Daman and Diu =====
      { name: 'Silvassa', code: 'silvassa', state: 'Dadra and Nagar Haveli and Daman and Diu', latitude: 20.2766, longitude: 72.9958 },
      { name: 'Daman', code: 'daman', state: 'Dadra and Nagar Haveli and Daman and Diu', latitude: 20.3974, longitude: 72.8328 },
      { name: 'Diu', code: 'diu', state: 'Dadra and Nagar Haveli and Daman and Diu', latitude: 20.7141, longitude: 70.9872 },

      // ===== Delhi (additional cities/areas) =====
      { name: 'New Delhi', code: 'new-delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
      { name: 'Dwarka', code: 'dwarka-delhi', state: 'Delhi', latitude: 28.5921, longitude: 77.0460 },
      { name: 'Rohini', code: 'rohini', state: 'Delhi', latitude: 28.7495, longitude: 77.0565 },
      { name: 'Saket', code: 'saket', state: 'Delhi', latitude: 28.5244, longitude: 77.2066 },

      // ===== Jammu and Kashmir =====
      { name: 'Srinagar', code: 'srinagar', state: 'Jammu and Kashmir', latitude: 34.0837, longitude: 74.7973 },
      { name: 'Jammu', code: 'jammu', state: 'Jammu and Kashmir', latitude: 32.7266, longitude: 74.8570 },
      { name: 'Anantnag', code: 'anantnag', state: 'Jammu and Kashmir', latitude: 33.7311, longitude: 75.1547 },
      { name: 'Baramulla', code: 'baramulla', state: 'Jammu and Kashmir', latitude: 34.1980, longitude: 74.3636 },
      { name: 'Sopore', code: 'sopore', state: 'Jammu and Kashmir', latitude: 34.2983, longitude: 74.4678 },
      { name: 'Kathua', code: 'kathua', state: 'Jammu and Kashmir', latitude: 32.3867, longitude: 75.5132 },
      { name: 'Udhampur', code: 'udhampur', state: 'Jammu and Kashmir', latitude: 32.9160, longitude: 75.1419 },

      // ===== Ladakh =====
      { name: 'Leh', code: 'leh', state: 'Ladakh', latitude: 34.1526, longitude: 77.5771 },
      { name: 'Kargil', code: 'kargil', state: 'Ladakh', latitude: 34.5539, longitude: 76.1349 },
      { name: 'Diskit', code: 'diskit', state: 'Ladakh', latitude: 34.5321, longitude: 77.5610 },

      // ===== Lakshadweep =====
      { name: 'Kavaratti', code: 'kavaratti', state: 'Lakshadweep', latitude: 10.5626, longitude: 72.6369 },
      { name: 'Agatti', code: 'agatti', state: 'Lakshadweep', latitude: 10.8565, longitude: 72.1939 },
      { name: 'Minicoy', code: 'minicoy', state: 'Lakshadweep', latitude: 8.2833, longitude: 73.0500 },

      // ===== Puducherry =====
      { name: 'Puducherry', code: 'puducherry', state: 'Puducherry', latitude: 11.9416, longitude: 79.8083 },
      { name: 'Karaikal', code: 'karaikal', state: 'Puducherry', latitude: 10.9254, longitude: 79.8380 },
      { name: 'Mahe', code: 'mahe', state: 'Puducherry', latitude: 11.7036, longitude: 75.5354 },
      { name: 'Yanam', code: 'yanam', state: 'Puducherry', latitude: 16.7307, longitude: 82.2132 },
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
