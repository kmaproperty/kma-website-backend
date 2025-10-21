import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterPropertyListingType } from '../entities/master-property-listing-type.entity';
import { MasterPropertyCategoryNew } from '../entities/master-property-category-new.entity';
import { MasterPropertyType } from '../entities/master-property-type.entity';
import { MasterBhkType } from '../entities/master-bhk-type.entity';
import { MasterBuiltUpArea } from '../entities/master-built-up-area.entity';
import { MasterCity } from '../entities/master-city.entity';
import { MasterLocality } from '../entities/master-locality.entity';
import { MasterSociety } from '../entities/master-society.entity';
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
    @InjectRepository(MasterLocality)
    private readonly localityRepository: Repository<MasterLocality>,
    @InjectRepository(MasterSociety)
    private readonly societyRepository: Repository<MasterSociety>,
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
      await this.propertyRepository.delete({});
      this.logger.log(`Deleted ${propertiesCount} properties`);
    }

    // 2. Societies (depends on localities and cities)
    const societiesCount = await this.societyRepository.count();
    if (societiesCount > 0) {
      await this.societyRepository.delete({});
      this.logger.log(`Deleted ${societiesCount} societies`);
    }

    // 3. Localities (depends on cities)
    const localitiesCount = await this.localityRepository.count();
    if (localitiesCount > 0) {
      await this.localityRepository.delete({});
      this.logger.log(`Deleted ${localitiesCount} localities`);
    }

    // 4. Built-up Areas (depends on BHK types)
    const builtUpAreasCount = await this.builtUpAreaRepository.count();
    if (builtUpAreasCount > 0) {
      await this.builtUpAreaRepository.delete({});
      this.logger.log(`Deleted ${builtUpAreasCount} built-up areas`);
    }

    // 5. BHK Types (depends on property types)
    const bhkTypesCount = await this.bhkTypeRepository.count();
    if (bhkTypesCount > 0) {
      await this.bhkTypeRepository.delete({});
      this.logger.log(`Deleted ${bhkTypesCount} BHK types`);
    }

    // 6. Property Types (depends on listing types and categories)
    const propertyTypesCount = await this.propertyTypeRepository.count();
    if (propertyTypesCount > 0) {
      await this.propertyTypeRepository.delete({});
      this.logger.log(`Deleted ${propertyTypesCount} property types`);
    }

    // 7. Cities (independent at this point)
    const citiesCount = await this.cityRepository.count();
    if (citiesCount > 0) {
      await this.cityRepository.delete({});
      this.logger.log(`Deleted ${citiesCount} cities`);
    }

    // 8. Property Categories (independent)
    const categoriesCount = await this.propertyCategoryRepository.count();
    if (categoriesCount > 0) {
      await this.propertyCategoryRepository.delete({});
      this.logger.log(`Deleted ${categoriesCount} property categories`);
    }

    // 9. Property Listing Types (independent)
    const listingTypesCount = await this.propertyListingTypeRepository.count();
    if (listingTypesCount > 0) {
      await this.propertyListingTypeRepository.delete({});
      this.logger.log(`Deleted ${listingTypesCount} property listing types`);
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
    await this.seedLocalities();
    await this.seedSocieties();
    
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
        localities: await this.localityRepository.count(),
        societies: await this.societyRepository.count(),
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

  private async seedPropertyListingTypes(): Promise<void> {
    this.logger.log('Seeding property listing types...');
    const propertyListingTypeOptions = [
      { 
        name: 'Sale', 
        code: 'sale'
      },
      { 
        name: 'Rent', 
        code: 'rent'
      },
    ];

    let created = 0;
    for (const optionData of propertyListingTypeOptions) {
      const existing = await this.propertyListingTypeRepository.findOne({
        where: { code: optionData.code },
      });

      if (!existing) {
        const propertyListingType = this.propertyListingTypeRepository.create(optionData);
        await this.propertyListingTypeRepository.save(propertyListingType);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} property listing types`);
  }

  private async seedBhkTypes(): Promise<void> {
    this.logger.log('Seeding BHK types...');
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
      this.logger.log('⚠ Skipping BHK type seeding - property types not found');
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

    // Create BHK types for each applicable property type
    let created = 0;
    for (const propertyType of propertyTypesWithBhk) {
      for (const bhkDef of bhkTypeDefinitions) {
        const code = `${propertyType.code}-${bhkDef.code}`;
        
        const existing = await this.bhkTypeRepository.findOne({
          where: { code },
        });

        if (!existing) {
          const bhkType = this.bhkTypeRepository.create({
            name: bhkDef.name,
            code: code,
            sortOrder: bhkDef.sortOrder,
            propertyTypeId: propertyType.id,
          });
          await this.bhkTypeRepository.save(bhkType);
          created++;
        }
      }
    }
    this.logger.log(`✓ Created ${created} BHK types for ${propertyTypesWithBhk.length} property types`);
  }

  private async seedBuiltUpAreas(): Promise<void> {
    this.logger.log('Seeding built-up areas...');

    // Get all societies and BHK types
    const allSocieties = await this.societyRepository.find();
    const allBhkTypes = await this.bhkTypeRepository.find();

    if (allSocieties.length === 0) {
      this.logger.log('⚠ Skipping built-up area seeding - societies not found');
      return;
    }

    if (allBhkTypes.length === 0) {
      this.logger.log('⚠ Skipping built-up area seeding - BHK types not found');
      return;
    }

    // Define built-up area configurations for different BHK types
    // Format: { bhkCode: suffix, configurations: [{ superBuiltUpArea, carpetArea, noOfBathrooms }] }
    const builtUpAreaData = {
      'studio': [
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
    
    // Create built-up areas for each society
    for (const society of allSocieties) {
      // For each society, create built-up areas for a subset of BHK types
      // We'll select some common BHK types (1bhk, 2bhk, 3bhk) for each society
      const commonBhkCodes = ['1bhk', '2bhk', '3bhk'];
      
      for (const bhkType of allBhkTypes) {
        // Extract the BHK code from the full code (e.g., "res-rent-flat-2bhk" -> "2bhk")
        const bhkCode = bhkType.code.split('-').pop();
        if (!bhkCode) {
          continue; // Skip if bhkCode is undefined
        }
        
        // Only create built-up areas for common BHK types or randomly include others
        const shouldInclude = commonBhkCodes.includes(bhkCode) || Math.random() > 0.6;
        if (!shouldInclude) {
          continue;
        }

        const configurations = builtUpAreaData[bhkCode as keyof typeof builtUpAreaData];

        if (configurations) {
          // Select 2-3 configurations randomly for variety
          const numConfigs = Math.floor(Math.random() * 2) + 2; // 2 or 3 configs
          const selectedConfigs = configurations.slice(0, numConfigs);
          
          for (const config of selectedConfigs) {
            // Check if this configuration already exists for this society and BHK type
            const existing = await this.builtUpAreaRepository.findOne({
              where: {
                societyId: society.id,
                bhkTypeId: bhkType.id,
                superBuiltUpArea: config.superBuiltUpArea,
                carpetArea: config.carpetArea,
                noOfBathrooms: config.noOfBathrooms,
              },
            });

            if (!existing) {
              const builtUpArea = this.builtUpAreaRepository.create({
                societyId: society.id,
                bhkTypeId: bhkType.id,
                superBuiltUpArea: config.superBuiltUpArea,
                carpetArea: config.carpetArea,
                noOfBathrooms: config.noOfBathrooms,
              });
              await this.builtUpAreaRepository.save(builtUpArea);
              created++;
            }
          }
        }
      }
    }
    this.logger.log(`✓ Created ${created} built-up area configurations for ${allSocieties.length} societies`);
  }

  private async seedPropertyTypes(): Promise<void> {
    this.logger.log('Seeding property types...');
    // Get listing types and categories first
    const saleType = await this.propertyListingTypeRepository.findOne({ where: { code: 'sale' } });
    const rentType = await this.propertyListingTypeRepository.findOne({ where: { code: 'rent' } });
    const residentialCategory = await this.propertyCategoryRepository.findOne({ where: { code: 'residential' } });
    const commercialCategory = await this.propertyCategoryRepository.findOne({ where: { code: 'commercial' } });

    if (!saleType || !rentType || !residentialCategory || !commercialCategory) {
      this.logger.log('⚠ Skipping property type seeding - prerequisites not met');
      return;
    }

    const propertyTypes = [
      // Residential Rent
      { name: 'Flat/Apartment', code: 'res-rent-flat', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      { name: 'Independent House', code: 'res-rent-house', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      { name: 'Duplex', code: 'res-rent-duplex', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      { name: 'Builder Floor', code: 'res-rent-builder-floor', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      { name: 'Villa', code: 'res-rent-villa', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      { name: 'Penthouse', code: 'res-rent-penthouse', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      { name: 'Studio', code: 'res-rent-studio', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      { name: 'Farm House', code: 'res-rent-farmhouse', categoryId: residentialCategory.id, listingTypeId: rentType.id },
      
      // Residential Sale
      { name: 'Flat/Apartment', code: 'res-sale-flat', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Independent House', code: 'res-sale-house', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Duplex', code: 'res-sale-duplex', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Builder Floor', code: 'res-sale-builder-floor', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Villa', code: 'res-sale-villa', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Penthouse', code: 'res-sale-penthouse', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: '1 RK/Studio', code: 'res-sale-studio', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Farm House', code: 'res-sale-farmhouse', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Plot', code: 'res-sale-plot', categoryId: residentialCategory.id, listingTypeId: saleType.id },
      { name: 'Agricultural Land', code: 'res-sale-agri-land', categoryId: residentialCategory.id, listingTypeId: saleType.id },
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
        code: 'residential'
      },
      { 
        name: 'Commercial', 
        code: 'commercial'
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
      { name: 'Gurgaon', code: 'gurgaon', state: 'Haryana', latitude: 28.4595, longitude: 77.0266 },
      { name: 'Delhi', code: 'delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
      { name: 'Noida', code: 'noida', state: 'Uttar Pradesh', latitude: 28.5355, longitude: 77.3910 },
      { name: 'Mumbai', code: 'mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
      { name: 'Bangalore', code: 'bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
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

  private async seedLocalities(): Promise<void> {
    this.logger.log('Seeding localities...');
    const gurgaon = await this.cityRepository.findOne({ where: { code: 'gurgaon' } });
    const delhi = await this.cityRepository.findOne({ where: { code: 'delhi' } });
    const noida = await this.cityRepository.findOne({ where: { code: 'noida' } });

    if (!gurgaon || !delhi || !noida) {
      this.logger.log('⚠ Skipping locality seeding - cities not found');
      return;
    }

    const localities = [
      // Gurgaon localities
      { name: 'DLF Phase 1', sector: 'Sector 26', cityId: gurgaon.id, latitude: 28.4749, longitude: 77.0937 },
      { name: 'DLF Phase 2', sector: 'Sector 25', cityId: gurgaon.id, latitude: 28.4840, longitude: 77.0883 },
      { name: 'Golf Course Road', cityId: gurgaon.id, latitude: 28.4511, longitude: 77.0677 },
      { name: 'Sohna Road', cityId: gurgaon.id, latitude: 28.4089, longitude: 77.0824 },
      
      // Delhi localities
      { name: 'Connaught Place', cityId: delhi.id, latitude: 28.6315, longitude: 77.2167 },
      { name: 'Dwarka', sector: 'Sector 10', cityId: delhi.id, latitude: 28.5921, longitude: 77.0460 },
      
      // Noida localities
      { name: 'Sector 62', sector: 'Sector 62', cityId: noida.id, latitude: 28.6260, longitude: 77.3705 },
      { name: 'Sector 18', sector: 'Sector 18', cityId: noida.id, latitude: 28.5687, longitude: 77.3243 },
    ];

    let created = 0;
    for (const localityData of localities) {
      const existing = await this.localityRepository.findOne({
        where: { name: localityData.name, cityId: localityData.cityId },
      });

      if (!existing) {
        const locality = this.localityRepository.create(localityData);
        await this.localityRepository.save(locality);
        created++;
      }
    }
    this.logger.log(`✓ Created ${created} localities`);
  }

  private async seedSocieties(): Promise<void> {
    this.logger.log('Seeding societies...');
    const gurgaon = await this.cityRepository.findOne({ where: { code: 'gurgaon' } });
    if (!gurgaon) {
      this.logger.log('⚠ Skipping society seeding - city not found');
      return;
    }

    const dlfPhase1 = await this.localityRepository.findOne({ 
      where: { name: 'DLF Phase 1', cityId: gurgaon.id } 
    });
    const dlfPhase2 = await this.localityRepository.findOne({ 
      where: { name: 'DLF Phase 2', cityId: gurgaon.id } 
    });
    const golfCourseRoad = await this.localityRepository.findOne({ 
      where: { name: 'Golf Course Road', cityId: gurgaon.id } 
    });

    if (!dlfPhase1 || !dlfPhase2 || !golfCourseRoad) {
      this.logger.log('⚠ Skipping society seeding - localities not found');
      return;
    }

    const societies = [
      { 
        name: 'DLF Park Place', 
        cityId: gurgaon.id, 
        localityId: dlfPhase1.id,
        address: 'Sector 26, DLF Phase 1, Gurgaon',
        pincode: '122002',
        isVerified: true
      },
      { 
        name: 'DLF Aralias', 
        cityId: gurgaon.id, 
        localityId: golfCourseRoad.id,
        address: 'Golf Course Road, Gurgaon',
        pincode: '122002',
        isVerified: true
      },
      { 
        name: 'DLF Magnolias', 
        cityId: gurgaon.id, 
        localityId: golfCourseRoad.id,
        address: 'Golf Course Road, Gurgaon',
        pincode: '122002',
        isVerified: true
      },
      { 
        name: 'Belaire', 
        cityId: gurgaon.id, 
        localityId: dlfPhase2.id,
        address: 'Sector 25, DLF Phase 2, Gurgaon',
        pincode: '122002',
        isVerified: true
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

}