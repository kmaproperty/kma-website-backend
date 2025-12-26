import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add KYC verification fields to users table
 * 
 * This migration adds fields for the 4-step KYC verification process:
 * 1. Live photo upload and approval
 * 2. Aadhaar verification
 * 3. Bank details (stored in separate bank_details table)
 * 4. DocuSign agreement signature
 * 5. KYC completion status
 */
export class AddKycVerificationFieldsToUsers1766010000001 implements MigrationInterface {
  name = 'AddKycVerificationFieldsToUsers1766010000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Live Photo Upload
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "live_photo_url" varchar(500)
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "live_photo_approved" boolean NOT NULL DEFAULT false
    `);

    // Step 2: Aadhaar Verification
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "aadhaar_number" varchar(12)
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "aadhaar_verified" boolean NOT NULL DEFAULT false
    `);

    // Step 3: Bank Details (flag - actual details stored in bank_details table)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "bank_details_filled" boolean NOT NULL DEFAULT false
    `);

    // Step 4: DocuSign Agreement
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "docusign_agreement_signed" boolean NOT NULL DEFAULT false
    `);

    // KYC Completion Status
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "kyc_completed" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "kyc_completed"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "docusign_agreement_signed"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "bank_details_filled"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "aadhaar_verified"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "aadhaar_number"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "live_photo_approved"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "live_photo_url"
    `);
  }
}

