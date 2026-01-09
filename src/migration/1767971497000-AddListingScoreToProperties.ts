import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add listing_score column to properties table
 *
 * This migration adds the listing_score field which stores the listing score:
 * - 80% when all steps are completed (completion_step = 5)
 * - 100% when property is verified (is_verified = 'verified')
 */
export class AddListingScoreToProperties1767971497000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN "listing_score" DECIMAL(5,2) DEFAULT 0
    `);

    // Update existing properties with calculated scores
    await queryRunner.query(`
      UPDATE "properties"
      SET "listing_score" = CASE
        WHEN "is_verified" = 'verified' AND "completion_step" = 5 THEN 100.00
        WHEN "completion_step" = 5 THEN 80.00
        ELSE 0.00
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN "listing_score"
    `);
  }
}

