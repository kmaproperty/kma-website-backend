import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add KYC status enum column to users table
 * 
 * This migration adds a kyc_status enum column with values:
 * - pending: Initial state when KYC has not been started
 * - in_review: All KYC steps completed and awaiting admin approval
 * - approved: KYC has been approved by admin
 * - rejected: KYC has been rejected by admin
 */
export class AddKycStatusToUsers1768277100000 implements MigrationInterface {
  name = 'AddKycStatusToUsers1768277100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum type already exists
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'kyc_status_enum'
    `);

    if (!enumExists || enumExists.length === 0) {
      // Create enum type
      await queryRunner.query(`
        CREATE TYPE "kyc_status_enum" AS ENUM('pending', 'in_review', 'approved', 'rejected')
      `);
    }

    // Add column to users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "kyc_status" "kyc_status_enum" DEFAULT 'pending'
    `);

    // Update existing records based on kyc_completed and steps status
    // Set to 'approved' if kyc_completed is true
    await queryRunner.query(`
      UPDATE "users"
      SET "kyc_status" = 'approved'
      WHERE "kyc_completed" = true
    `);

    // Set to 'pending' if no steps are completed (default already set, but ensure consistency)
    await queryRunner.query(`
      UPDATE "users"
      SET "kyc_status" = 'pending'
      WHERE "kyc_completed" = false
      AND ("live_photo_url" IS NULL OR "live_photo_url" = '')
      AND "aadhaar_verified" = false
      AND "bank_details_filled" = false
      AND "docusign_agreement_signed" = false
    `);

    // Note: We can't automatically determine 'in_review' vs 'rejected' without more context
    // These will be set by the application logic when steps are completed or admin actions occur
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove column
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "kyc_status"
    `);

    // Drop enum type (only if no other tables use it)
    await queryRunner.query(`
      DROP TYPE IF EXISTS "kyc_status_enum"
    `);
  }
}

