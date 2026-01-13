import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add is_top flag to properties table
 * 
 * This migration adds a boolean field to mark properties as top properties
 * which can be used by admin to highlight featured properties
 */
export class AddIsTopToProperties1768280349000 implements MigrationInterface {
  name = 'AddIsTopToProperties1768280349000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "is_top" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "is_top"
    `);
  }
}

