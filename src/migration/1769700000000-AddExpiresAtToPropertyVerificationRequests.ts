import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add expires_at column to property_verification_requests table
 *
 * This column stores the expiration time for verification links (24 hours from creation).
 * Links expire after 24 hours or when verification details are submitted.
 */
export class AddExpiresAtToPropertyVerificationRequests1769700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add expires_at column
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      ADD COLUMN "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
    `);

    // Update existing records to have expires_at set to 24 hours from created_at
    await queryRunner.query(`
      UPDATE "property_verification_requests"
      SET "expires_at" = "created_at" + INTERVAL '24 hours'
      WHERE "expires_at" IS NULL OR "expires_at" = (NOW() + INTERVAL '24 hours')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      DROP COLUMN "expires_at"
    `);
  }
}

