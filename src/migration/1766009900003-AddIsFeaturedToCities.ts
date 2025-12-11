import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add isFeatured field to master_cities table
 * 
 * This migration adds the is_featured column to the master_cities table
 * to support marking cities as featured for the home page.
 */
export class AddIsFeaturedToCities1766009900003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "master_cities"
      ADD COLUMN "is_featured" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "master_cities"
      DROP COLUMN "is_featured"
    `);
  }
}

