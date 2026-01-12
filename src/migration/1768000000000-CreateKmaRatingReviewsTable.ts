import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKmaRatingReviewsTable1768000000000
  implements MigrationInterface
{
  name = 'CreateKmaRatingReviewsTable1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "kma_rating_reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "rating" DECIMAL(3,2) NOT NULL,
        "review" TEXT,
        "name" VARCHAR(255) NOT NULL,
        "phone_number" VARCHAR(20) NOT NULL,
        "email" VARCHAR(255),
        "end_user_id" uuid,
        CONSTRAINT "PK_kma_rating_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_kma_rating_reviews_end_user_id" FOREIGN KEY ("end_user_id") 
          REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Create index on end_user_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_kma_rating_reviews_end_user_id" ON "kma_rating_reviews" ("end_user_id")
    `);

    // Create index on phone_number for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_kma_rating_reviews_phone_number" ON "kma_rating_reviews" ("phone_number")
    `);

    // Create index on created_at for faster sorting
    await queryRunner.query(`
      CREATE INDEX "IDX_kma_rating_reviews_created_at" ON "kma_rating_reviews" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_kma_rating_reviews_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_kma_rating_reviews_phone_number"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_kma_rating_reviews_end_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "kma_rating_reviews"`);
  }
}

