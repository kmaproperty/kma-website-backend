import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChannelPartnerReviews1774000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "channel_partner_reviews" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "channel_partner_id" uuid NOT NULL,
        "reviewer_id" uuid NOT NULL,
        "rating" numeric NOT NULL,
        "review" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_channel_partner_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "FK_channel_partner_reviews_channel_partner" FOREIGN KEY ("channel_partner_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_channel_partner_reviews_reviewer" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Unique index: one review per user per channel partner
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_channel_partner_reviews_cp_reviewer"
      ON "channel_partner_reviews" ("channel_partner_id", "reviewer_id")
      WHERE "deleted_at" IS NULL
    `);

    // Index on channel_partner_id for fast lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_channel_partner_reviews_cp_id"
      ON "channel_partner_reviews" ("channel_partner_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_channel_partner_reviews_cp_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_channel_partner_reviews_cp_reviewer"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "channel_partner_reviews"`);
  }
}
