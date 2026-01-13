import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add icon and imageUrl columns to master_cities table
 * 
 * This migration adds optional icon and imageUrl fields to cities
 * which can be used to display city icons and images in the UI
 */
export class AddIconAndImageUrlToCities1768281900000 implements MigrationInterface {
  name = 'AddIconAndImageUrlToCities1768281900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "master_cities"
      ADD COLUMN IF NOT EXISTS "icon" varchar(500) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "master_cities"
      ADD COLUMN IF NOT EXISTS "imageUrl" varchar(500) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "master_cities"
      DROP COLUMN IF EXISTS "imageUrl"
    `);
    await queryRunner.query(`
      ALTER TABLE "master_cities"
      DROP COLUMN IF EXISTS "icon"
    `);
  }
}

