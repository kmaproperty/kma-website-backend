import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add profile_image field to users table
 * 
 * This migration adds the profile_image column to the users table
 * to support storing profile image URLs for end users.
 */
export class AddProfileImageToUsers1766009900002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "profile_image" varchar(500) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "profile_image"
    `);
  }
}

