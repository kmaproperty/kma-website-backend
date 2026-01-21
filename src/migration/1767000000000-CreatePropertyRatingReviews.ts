import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Create property_rating_reviews table to store per-property,
 * per-user locality ratings (connectivity, neighbourhood, safety, livability)
 * along with like/dislike texts and an overall rating.
 */
export class CreatePropertyRatingReviews1767000000000 implements MigrationInterface {
  name = 'CreatePropertyRatingReviews1767000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "property_rating_reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        "property_id" uuid NOT NULL,
        "end_user_id" uuid NOT NULL,
        "role" varchar(20) NOT NULL,

        "connectivity_rating" integer NOT NULL,
        "neighbourhood_rating" integer NOT NULL,
        "safety_rating" integer NOT NULL,
        "livability_rating" integer NOT NULL,

        "like_text" text NULL,
        "dislike_text" text NULL,

        "overall_rating" numeric(3,2) NOT NULL,

        CONSTRAINT "PK_property_rating_reviews_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "property_rating_reviews"
      ADD CONSTRAINT "FK_property_rating_reviews_property"
      FOREIGN KEY ("property_id") REFERENCES "properties"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_rating_reviews"
      ADD CONSTRAINT "FK_property_rating_reviews_end_user"
      FOREIGN KEY ("end_user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_property_rating_reviews_unique_per_user_property"
      ON "property_rating_reviews" ("property_id", "end_user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_property_rating_reviews_unique_per_user_property"
    `);
    await queryRunner.query(`
      ALTER TABLE "property_rating_reviews"
      DROP CONSTRAINT IF EXISTS "FK_property_rating_reviews_end_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "property_rating_reviews"
      DROP CONSTRAINT IF EXISTS "FK_property_rating_reviews_property"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "property_rating_reviews"
    `);
  }
}


