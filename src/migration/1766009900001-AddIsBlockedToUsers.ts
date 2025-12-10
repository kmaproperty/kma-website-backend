import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add isBlocked field to users table
 * 
 * This migration adds the is_blocked column to the users table
 * to support blocking/unblocking users by admins.
 */
export class AddIsBlockedToUsers1766009900001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "is_blocked" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "is_blocked"
    `);
  }
}

