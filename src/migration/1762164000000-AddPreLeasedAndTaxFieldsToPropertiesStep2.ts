import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add pre-leased/pre-rented and tax/govt charge fields to properties table for Step 2
 * 
 * This migration adds the following fields:
 * - taxGovtChargeIncluded: enum field (yes/no) for tax & govt charges
 * - isPreLeasedRented: enum field (yes/no) for pre-leased/pre-rented status
 * - currentRentPerMonth: integer field for current rent per month (when pre-leased)
 * - leaseYears: integer field for lease years (when pre-leased)
 */
export class AddPreLeasedAndTaxFieldsToPropertiesStep21762164000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add taxGovtChargeIncluded column (reusing properties_charges_enum)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "taxGovtChargeIncluded" "properties_charges_enum"
        `);

        // Add isPreLeasedRented column (reusing properties_charges_enum)
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "isPreLeasedRented" "properties_charges_enum"
        `);

        // Add currentRentPerMonth column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "currentRentPerMonth" INTEGER
        `);

        // Add leaseYears column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "leaseYears" INTEGER
        `);

        // Add comments to the columns for documentation
        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."taxGovtChargeIncluded" IS 
            'Tax & Govt. charges included in rent (yes/no)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."isPreLeasedRented" IS 
            'Whether property is pre-leased or pre-rented (yes/no)'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."currentRentPerMonth" IS 
            'Current rent per month if property is pre-leased/pre-rented'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."leaseYears" IS 
            'Number of lease years if property is pre-leased/pre-rented'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "leaseYears"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "currentRentPerMonth"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "isPreLeasedRented"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "taxGovtChargeIncluded"
        `);
    }

}

