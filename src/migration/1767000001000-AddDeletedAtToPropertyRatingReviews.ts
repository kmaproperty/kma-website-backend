import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add deleted_at column to property_rating_reviews table
 * This column is required because PropertyRatingReview extends BaseEntity
 * which includes the deletedAt field for soft delete functionality.
 */
export class AddDeletedAtToPropertyRatingReviews1767000001000
  implements MigrationInterface
{
  name = 'AddDeletedAtToPropertyRatingReviews1767000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property_rating_reviews"
      ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property_rating_reviews"
      DROP COLUMN IF EXISTS "deleted_at"
    `);
  }
}
