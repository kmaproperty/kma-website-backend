import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add digilocker_metadata (jsonb) to users table
 * Stores name, gender, dob, mobile_number from DigiLocker
 */
export class AddDigilockerMetadataToUsers1769800000001 implements MigrationInterface {
  name = 'AddDigilockerMetadataToUsers1769800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "digilocker_metadata" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "digilocker_metadata"
    `);
  }
}
