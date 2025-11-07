import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add locationHub, otherLocationHub, zoneType, propertyCondition, wallConstructionStatus, ownership, area, facility, and plot/land fields to properties table
 * 
 * This migration adds twenty-four new fields to the properties table:
 * - locationHub: enum field with values (it_park, business_park, others)
 * - otherLocationHub: varchar field for custom location hub name when locationHub is 'others'
 * - zoneType: enum field with values (industrial, commercial, open_spaces, residential, 
 *   special_economic_zone, agricultural_zone, others)
 * - propertyCondition: enum field with values (ready_to_use, bare_shell)
 * - wallConstructionStatus: enum field with values (no_walls, brick_wall, cemented_walls, plastered_walls)
 * - ownership: enum field with values (freehold, leasehold, cooperative_society, power_of_attorney)
 * - builtUpArea: integer field for built up area
 * - builtUpAreaUnit: enum field with values (sq_ft, sq_yd, sq_m, acres, hectares)
 * - carpetArea: integer field for carpet area
 * - carpetAreaUnit: enum field with values (sq_ft, sq_yd, sq_m, acres, hectares)
 * - suitableFor: text array for suitable purposes (jewellery, gym, grocery, clinic, footwear, electronics, clothing, others)
 * - entranceWidth: decimal field for entrance width
 * - entranceWidthUnit: enum field with values (ft, m, in, cm)
 * - ceilingHeight: decimal field for ceiling height
 * - ceilingHeightUnit: enum field with values (ft, m, in, cm)
 * - locatedNear: text array for nearby locations (entrance, elevator, stairs)
 * - plotLengthUnit: enum field with values (ft, m, in, cm)
 * - plotWidthUnit: enum field with values (ft, m, in, cm)
 * - plotLandType: enum field with values (agricultural_farm_land, industrial_land_plots, commercial_land_plot)
 * - constructionTypeOptions: text array for construction types (shed, room, washroom, other)
 * Note: noOfOpenSides and constructionDone already exist in the database
 */
export class AddLocationHubAndZoneTypeToProperties1762161000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create LocationHub enum type
        await queryRunner.query(`
            CREATE TYPE "properties_locationhub_enum" AS ENUM(
                'it_park', 
                'business_park', 
                'mall', 
                'commercial_project', 
                'residential_project', 
                'retail_complex_building', 
                'market_high_street', 
                'others'
            )
        `);

        // Create ZoneType enum type
        await queryRunner.query(`
            CREATE TYPE "properties_zonetype_enum" AS ENUM(
                'industrial', 
                'commercial', 
                'open_spaces', 
                'residential', 
                'special_economic_zone', 
                'agricultural_zone', 
                'others'
            )
        `);

        // Create PropertyCondition enum type
        await queryRunner.query(`
            CREATE TYPE "properties_propertycondition_enum" AS ENUM(
                'ready_to_use', 
                'bare_shell'
            )
        `);

        // Create WallConstructionStatus enum type
        await queryRunner.query(`
            CREATE TYPE "properties_wallconstructionstatus_enum" AS ENUM(
                'no_walls', 
                'brick_wall', 
                'cemented_walls', 
                'plastered_walls'
            )
        `);

        // Create Ownership enum type
        await queryRunner.query(`
            CREATE TYPE "properties_ownership_enum" AS ENUM(
                'freehold', 
                'leasehold', 
                'cooperative_society', 
                'power_of_attorney'
            )
        `);

        // Create AreaUnit enum type
        await queryRunner.query(`
            CREATE TYPE "properties_areaunit_enum" AS ENUM(
                'sq_ft', 
                'sq_yd', 
                'sq_m', 
                'acres', 
                'hectares'
            )
        `);

        // Create DistanceUnit enum type
        await queryRunner.query(`
            CREATE TYPE "properties_distanceunit_enum" AS ENUM(
                'ft', 
                'm', 
                'in', 
                'cm'
            )
        `);

        // Create PlotLandType enum type
        await queryRunner.query(`
            CREATE TYPE "properties_plotlandtype_enum" AS ENUM(
                'agricultural_farm_land', 
                'industrial_land_plots', 
                'commercial_land_plot'
            )
        `);

        // Add locationHub column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "locationHub" "properties_locationhub_enum"
        `);

        // Add otherLocationHub column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "otherLocationHub" VARCHAR(255)
        `);

        // Add zoneType column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "zoneType" "properties_zonetype_enum"
        `);

        // Add propertyCondition column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "propertyCondition" "properties_propertycondition_enum"
        `);

        // Add wallConstructionStatus column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "wallConstructionStatus" "properties_wallconstructionstatus_enum"
        `);

        // Add ownership column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "ownership" "properties_ownership_enum"
        `);

        // Add builtUpArea column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "builtUpArea" INTEGER
        `);

        // Add builtUpAreaUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "builtUpAreaUnit" "properties_areaunit_enum"
        `);

        // Add carpetArea column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "carpetArea" INTEGER
        `);

        // Add carpetAreaUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "carpetAreaUnit" "properties_areaunit_enum"
        `);

        // Add suitableFor column (text array)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "suitableFor" TEXT
        `);

        // Add entranceWidth column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "entranceWidth" DECIMAL(10, 2)
        `);

        // Add entranceWidthUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "entranceWidthUnit" "properties_distanceunit_enum"
        `);

        // Add ceilingHeight column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "ceilingHeight" DECIMAL(10, 2)
        `);

        // Add ceilingHeightUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "ceilingHeightUnit" "properties_distanceunit_enum"
        `);

        // Add locatedNear column (text array)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "locatedNear" TEXT
        `);

        // Modify plotLength to be DECIMAL
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ALTER COLUMN "plotLength" TYPE DECIMAL(10, 2)
        `);

        // Add plotLengthUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "plotLengthUnit" "properties_distanceunit_enum"
        `);

        // Modify plotWidth to be DECIMAL
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ALTER COLUMN "plotWidth" TYPE DECIMAL(10, 2)
        `);

        // Add plotWidthUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "plotWidthUnit" "properties_distanceunit_enum"
        `);

        // Add plotLandType column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "plotLandType" "properties_plotlandtype_enum"
        `);

        // Add constructionTypeOptions column (text array)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "constructionTypeOptions" TEXT
        `);

        // Add comments to the columns for documentation
        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."locationHub" IS 
            'Location hub type (IT Park, Business Park, or Others)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."otherLocationHub" IS 
            'Custom location hub name when locationHub is set to others'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."zoneType" IS 
            'Zone type of the property (Industrial, Commercial, Residential, etc.)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."propertyCondition" IS 
            'Property condition (Ready to use or Bare shell)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."wallConstructionStatus" IS 
            'Wall construction status (No Walls, Brick Wall, Cemented walls, Plastered Walls)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."ownership" IS 
            'Ownership type (Freehold, Leasehold, Cooperative society, Power of Attorney)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."builtUpArea" IS 
            'Built up area value'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."builtUpAreaUnit" IS 
            'Built up area unit (sq ft, sq yd, sq m, acres, hectares)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."carpetArea" IS 
            'Carpet area value'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."carpetAreaUnit" IS 
            'Carpet area unit (sq ft, sq yd, sq m, acres, hectares)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."suitableFor" IS 
            'Suitable for purposes (jewellery, gym, grocery, clinic, footwear, electronics, clothing, others)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."entranceWidth" IS 
            'Entrance width value'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."entranceWidthUnit" IS 
            'Entrance width unit (ft, m, in, cm)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."ceilingHeight" IS 
            'Ceiling height value'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."ceilingHeightUnit" IS 
            'Ceiling height unit (ft, m, in, cm)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."locatedNear" IS 
            'Located near (entrance, elevator, stairs)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."plotLengthUnit" IS 
            'Plot length unit (ft, m, in, cm)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."plotWidthUnit" IS 
            'Plot width unit (ft, m, in, cm)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."plotLandType" IS 
            'Plot/Land type (Agricultural/Farm Land, Industrial Land/Plots, Commercial Land/Plot)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."constructionTypeOptions" IS 
            'Construction type options (shed, room, washroom, other)'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "constructionTypeOptions"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "plotLandType"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "plotWidthUnit"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "plotLengthUnit"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "locatedNear"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "ceilingHeightUnit"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "ceilingHeight"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "entranceWidthUnit"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "entranceWidth"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "suitableFor"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "carpetAreaUnit"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "carpetArea"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "builtUpAreaUnit"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "builtUpArea"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "ownership"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "wallConstructionStatus"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "propertyCondition"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "zoneType"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "otherLocationHub"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "locationHub"
        `);

        // Drop enum types
        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_plotlandtype_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_distanceunit_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_areaunit_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_ownership_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_wallconstructionstatus_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_propertycondition_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_zonetype_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_locationhub_enum"
        `);
    }

}

