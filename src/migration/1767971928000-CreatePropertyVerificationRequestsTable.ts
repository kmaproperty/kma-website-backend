import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create property_verification_requests table
 *
 * This table stores verification requests where owners/channel partners
 * request to verify their properties by uploading live photos/videos.
 */
export class CreatePropertyVerificationRequestsTable1767971928000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for verification status
    await queryRunner.query(`
      CREATE TYPE "property_verification_status_enum" AS ENUM(
        'pending',
        'submitted',
        'approved',
        'rejected'
      )
    `);

    // Create table
    await queryRunner.query(`
      CREATE TABLE "property_verification_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "property_id" uuid NOT NULL,
        "requested_by" uuid NOT NULL,
        "verification_token" character varying(255) NOT NULL,
        "status" "property_verification_status_enum" NOT NULL DEFAULT 'pending',
        "live_photos" jsonb,
        "live_videos" jsonb,
        "submitted_at" TIMESTAMP WITH TIME ZONE,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP WITH TIME ZONE,
        "rejection_reason" text,
        CONSTRAINT "PK_property_verification_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_property_verification_requests_token" UNIQUE ("verification_token")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_property_verification_requests_property_status"
      ON "property_verification_requests" ("property_id", "status")
    `);

    // Create foreign keys
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      ADD CONSTRAINT "FK_property_verification_requests_property_id"
      FOREIGN KEY ("property_id") REFERENCES "properties"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      ADD CONSTRAINT "FK_property_verification_requests_requested_by"
      FOREIGN KEY ("requested_by") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      ADD CONSTRAINT "FK_property_verification_requests_reviewed_by"
      FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      DROP CONSTRAINT "FK_property_verification_requests_reviewed_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      DROP CONSTRAINT "FK_property_verification_requests_requested_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "property_verification_requests"
      DROP CONSTRAINT "FK_property_verification_requests_property_id"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_property_verification_requests_property_status"
    `);

    await queryRunner.query(`DROP TABLE "property_verification_requests"`);

    await queryRunner.query(`DROP TYPE "property_verification_status_enum"`);
  }
}

