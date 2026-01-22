import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add kyc_rejection_reason field to users table
 * 
 * This migration adds the kyc_rejection_reason column to the users table
 * to store the reason when KYC is rejected by admin.
 */
export class AddKycRejectionReasonToUsers1769200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "kyc_rejection_reason" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "kyc_rejection_reason"
    `);
  }
}

