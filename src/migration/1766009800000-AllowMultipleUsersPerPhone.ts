import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to allow multiple users with the same phone number but different roles
 * 
 * This migration:
 * 1. Drops the UNIQUE constraint on phone column
 * 2. Adds a composite UNIQUE constraint on (phone, role) to prevent duplicate phone+role combinations
 * 3. This allows the same phone to have both END_USER and OWNER/CHANNEL_PARTNER accounts
 */
export class AllowMultipleUsersPerPhone1766009800000 implements MigrationInterface {
  name = 'AllowMultipleUsersPerPhone1766009800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing unique constraint on phone
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_phone"
    `);

    // Add composite unique constraint on (phone, role)
    // This allows same phone for different roles but prevents duplicate phone+role
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "UQ_users_phone_role" UNIQUE ("phone", "role")
    `);

    // Create index for faster lookups by phone and role
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_phone_role" ON "users" ("phone", "role")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the composite unique constraint
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_phone_role"
    `);

    // Drop the index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_phone_role"
    `);

    // Restore the original unique constraint on phone
    // Note: This might fail if there are duplicate phones after the change
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "UQ_users_phone" UNIQUE ("phone")
    `);
  }
}

