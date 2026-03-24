import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankAadhaarApprovalFieldsToUsers1774100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "bank_details_approved" boolean DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "bank_rejection_reason" text DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "aadhaar_admin_approved" boolean DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "aadhaar_rejection_reason" text DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "bank_details_approved",
      DROP COLUMN IF EXISTS "bank_rejection_reason",
      DROP COLUMN IF EXISTS "aadhaar_admin_approved",
      DROP COLUMN IF EXISTS "aadhaar_rejection_reason"
    `);
  }
}
