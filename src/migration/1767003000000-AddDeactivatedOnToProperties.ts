import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add deactivated_on column to properties table
 * 
 * This column tracks when a property was deactivated, providing
 * a dedicated timestamp separate from updatedAt.
 */
export class AddDeactivatedOnToProperties1767003000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "deactivated_on" timestamp with time zone
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "deactivated_on"
    `);
  }
}

