import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add private and public washroom counts to properties table
 *
 * Adds nullable integer columns for tracking washroom counts captured during
 * Step 2 of the property workflow.
 */
export class AddWashroomsToProperties1762163000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "privateWashrooms" INTEGER
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "publicWashrooms" INTEGER
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."privateWashrooms" IS
            'Number of private washrooms available in the property'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."publicWashrooms" IS
            'Number of public washrooms available in the property'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."publicWashrooms" IS NULL
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."privateWashrooms" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN "publicWashrooms"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN "privateWashrooms"
        `);
    }
}

