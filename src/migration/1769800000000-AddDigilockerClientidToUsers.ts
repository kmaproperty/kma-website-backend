import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add digilocker_clientid to users table
 * Used when adding Aadhaar details via DigiLocker flow
 */
export class AddDigilockerClientidToUsers1769800000000 implements MigrationInterface {
  name = 'AddDigilockerClientidToUsers1769800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "digilocker_clientid" varchar(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "digilocker_clientid"
    `);
  }
}
