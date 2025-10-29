import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add noOfBedrooms and balconies columns to master_built_up_areas table
 * 
 * This migration adds two new nullable columns to the master_built_up_areas table:
 * - no_of_bedrooms: integer, nullable
 * - balconies: integer, nullable
 */
export class AddNoOfBedroomsAndBalconiesToBuiltUpAreas1761707646000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add no_of_bedrooms column
        await queryRunner.query(`
            ALTER TABLE "master_built_up_areas" 
            ADD COLUMN "no_of_bedrooms" integer
        `);

        // Add balconies column
        await queryRunner.query(`
            ALTER TABLE "master_built_up_areas" 
            ADD COLUMN "balconies" integer
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove balconies column
        await queryRunner.query(`
            ALTER TABLE "master_built_up_areas" 
            DROP COLUMN IF EXISTS "balconies"
        `);

        // Remove no_of_bedrooms column
        await queryRunner.query(`
            ALTER TABLE "master_built_up_areas" 
            DROP COLUMN IF EXISTS "no_of_bedrooms"
        `);
    }

}

