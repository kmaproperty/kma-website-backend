import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to change property_verification_requests.reviewed_by
 * foreign key from users table to admins table
 *
 * This fixes the issue where admin IDs were being set but the foreign key
 * constraint expected user IDs, causing foreign key violations.
 */
export class ChangePropertyVerificationReviewedByToAdmins1769600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      DROP CONSTRAINT "FK_property_verification_requests_reviewed_by"
    `);

    // Add new foreign key constraint referencing admins table
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      ADD CONSTRAINT "FK_property_verification_requests_reviewed_by"
      FOREIGN KEY ("reviewed_by") REFERENCES "admins"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the admins foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      DROP CONSTRAINT "FK_property_verification_requests_reviewed_by"
    `);

    // Restore the original foreign key constraint referencing users table
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      ADD CONSTRAINT "FK_property_verification_requests_reviewed_by"
      FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }
}

