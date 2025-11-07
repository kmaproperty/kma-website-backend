import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add financial and floor detail fields to properties table for Step 2
 * 
 * This migration adds the following fields:
 * - noOfStaircases: integer field for number of staircases
 * - isRentNegotiable: boolean field for rent negotiability
 * - dgUpsChargeIncluded: enum field (yes/no) for DG & UPS charges
 * - electricityChargeIncluded: enum field (yes/no) for electricity charges
 * - waterChargeIncluded: enum field (yes/no) for water charges
 * - expectedRentIncrease: varchar field for expected rent increase
 */
export class AddFinancialAndFloorFieldsToPropertiesStep21762163000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create YesNo enum type for charges
        await queryRunner.query(`
            CREATE TYPE "properties_charges_enum" AS ENUM(
                'yes', 
                'no'
            )
        `);

        // Add noOfStaircases column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "noOfStaircases" INTEGER
        `);

        // Add isRentNegotiable column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "isRentNegotiable" BOOLEAN
        `);

        // Add dgUpsChargeIncluded column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "dgUpsChargeIncluded" "properties_charges_enum"
        `);

        // Add electricityChargeIncluded column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "electricityChargeIncluded" "properties_charges_enum"
        `);

        // Add waterChargeIncluded column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "waterChargeIncluded" "properties_charges_enum"
        `);

        // Add expectedRentIncrease column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "expectedRentIncrease" VARCHAR(100)
        `);

        // Add comments to the columns for documentation
        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."noOfStaircases" IS 
            'Number of staircases in the building'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."isRentNegotiable" IS 
            'Whether the rent is negotiable'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."dgUpsChargeIncluded" IS 
            'DG & UPS charges included in rent (yes/no)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."electricityChargeIncluded" IS 
            'Electricity charges included in rent (yes/no)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."waterChargeIncluded" IS 
            'Water charges included in rent (yes/no)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."expectedRentIncrease" IS 
            'Expected rent increase (percentage or amount)'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "expectedRentIncrease"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "waterChargeIncluded"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "electricityChargeIncluded"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "dgUpsChargeIncluded"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "isRentNegotiable"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "noOfStaircases"
        `);

        // Drop enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "properties_charges_enum"
        `);
    }

}

