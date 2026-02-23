import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add remaining Step 1 fields to properties table
 * 
 * This migration adds all the fields that were designed after the previous migration was executed:
 * - Creates missing enum types (distanceunit, areaunit, propertycondition, wallconstructionstatus, ownership, plotlandtype)
 * - Adds all missing columns with their respective types
 * - Modifies plotLength and plotWidth from INTEGER to DECIMAL(10, 2)
 */
export class AddRemainingStep1FieldsToProperties1762162000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create DistanceUnit enum type (may already exist from AddLocationHubAndZoneTypeToProperties)
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "properties_distanceunit_enum" AS ENUM('ft', 'm', 'in', 'cm');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create AreaUnit enum type
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "properties_areaunit_enum" AS ENUM('sq_ft', 'sq_yd', 'sq_m', 'acres', 'hectares');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create PropertyCondition enum type
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "properties_propertycondition_enum" AS ENUM('ready_to_use', 'bare_shell');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create WallConstructionStatus enum type
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "properties_wallconstructionstatus_enum" AS ENUM('no_walls', 'brick_wall', 'cemented_walls', 'plastered_walls');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create Ownership enum type
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "properties_ownership_enum" AS ENUM('freehold', 'leasehold', 'cooperative_society', 'power_of_attorney');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create PlotLandType enum type (may already exist from AddLocationHubAndZoneTypeToProperties)
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "properties_plotlandtype_enum" AS ENUM('agricultural_farm_land', 'industrial_land_plots', 'commercial_land_plot');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Add propertyCondition column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "propertyCondition" "properties_propertycondition_enum"
        `);

        // Add wallConstructionStatus column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "wallConstructionStatus" "properties_wallconstructionstatus_enum"
        `);

        // Add ownership column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "ownership" "properties_ownership_enum"
        `);

        // Add builtUpArea column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "builtUpArea" INTEGER
        `);

        // Add builtUpAreaUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "builtUpAreaUnit" "properties_areaunit_enum"
        `);

        // Add carpetArea column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "carpetArea" INTEGER
        `);

        // Add carpetAreaUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "carpetAreaUnit" "properties_areaunit_enum"
        `);

        // Modify plotLength to be DECIMAL
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ALTER COLUMN "plotLength" TYPE DECIMAL(10, 2)
        `);

        // Add plotLengthUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "plotLengthUnit" "properties_distanceunit_enum"
        `);

        // Modify plotWidth to be DECIMAL
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ALTER COLUMN "plotWidth" TYPE DECIMAL(10, 2)
        `);

        // Add plotWidthUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "plotWidthUnit" "properties_distanceunit_enum"
        `);

        // Add plotLandType column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "plotLandType" "properties_plotlandtype_enum"
        `);

        // Add suitableFor column (text array)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "suitableFor" TEXT
        `);

        // Add entranceWidth column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "entranceWidth" DECIMAL(10, 2)
        `);

        // Add entranceWidthUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "entranceWidthUnit" "properties_distanceunit_enum"
        `);

        // Add ceilingHeight column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "ceilingHeight" DECIMAL(10, 2)
        `);

        // Add ceilingHeightUnit column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "ceilingHeightUnit" "properties_distanceunit_enum"
        `);

        // Add locatedNear column (text array)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "locatedNear" TEXT
        `);

        // Add constructionTypeOptions column (text array)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "constructionTypeOptions" TEXT
        `);

        // Add comments to the columns for documentation
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

        // Revert plotLength and plotWidth back to INTEGER
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ALTER COLUMN "plotLength" TYPE INTEGER USING "plotLength"::integer
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            ALTER COLUMN "plotWidth" TYPE INTEGER USING "plotWidth"::integer
        `);

        // Drop enum types
        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_plotlandtype_enum"
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
            DROP TYPE IF EXISTS "properties_areaunit_enum"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_distanceunit_enum"
        `);
    }

}

