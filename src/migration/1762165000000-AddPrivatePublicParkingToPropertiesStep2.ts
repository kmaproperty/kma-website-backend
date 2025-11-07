import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add private and public parking fields to properties table for Step 2
 * 
 * This migration adds the following fields:
 * - privateParking: integer field for private parking count
 * - publicParking: integer field for public parking count
 */
export class AddPrivatePublicParkingToPropertiesStep21762165000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add privateParking column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "privateParking" INTEGER
        `);

        // Add publicParking column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "publicParking" INTEGER
        `);

        // Add comments to the columns for documentation
        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."privateParking" IS 
            'Private parking count'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."publicParking" IS 
            'Public parking count'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "publicParking"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "privateParking"
        `);
    }

}

