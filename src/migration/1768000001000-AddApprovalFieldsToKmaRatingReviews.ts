import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovalFieldsToKmaRatingReviews1768000001000
  implements MigrationInterface
{
  name = 'AddApprovalFieldsToKmaRatingReviews1768000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_approved column
    await queryRunner.query(`
      ALTER TABLE "kma_rating_reviews"
      ADD COLUMN "is_approved" boolean NOT NULL DEFAULT false
    `);

    // Add approved_by_id column
    await queryRunner.query(`
      ALTER TABLE "kma_rating_reviews"
      ADD COLUMN "approved_by_id" uuid
    `);

    // Add approved_at column
    await queryRunner.query(`
      ALTER TABLE "kma_rating_reviews"
      ADD COLUMN "approved_at" TIMESTAMP WITH TIME ZONE
    `);

    // Add foreign key constraint for approved_by_id
    await queryRunner.query(`
      ALTER TABLE "kma_rating_reviews"
      ADD CONSTRAINT "FK_kma_rating_reviews_approved_by_id"
      FOREIGN KEY ("approved_by_id") REFERENCES "admins"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Create index on is_approved for faster filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_kma_rating_reviews_is_approved" ON "kma_rating_reviews" ("is_approved")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_kma_rating_reviews_is_approved"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kma_rating_reviews" DROP CONSTRAINT IF EXISTS "FK_kma_rating_reviews_approved_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kma_rating_reviews" DROP COLUMN IF EXISTS "approved_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kma_rating_reviews" DROP COLUMN IF EXISTS "approved_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kma_rating_reviews" DROP COLUMN IF EXISTS "is_approved"`,
    );
  }
}

