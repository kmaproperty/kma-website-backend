import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add facing column to properties table
 * 
 * This migration adds a facing field to store the property's direction (e.g., North, South, East, West, etc.)
 */
export class AddFacingToProperties1761710000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add facing column as nullable varchar
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "facing" varchar(50) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove facing column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "facing"
        `);
    }

}

