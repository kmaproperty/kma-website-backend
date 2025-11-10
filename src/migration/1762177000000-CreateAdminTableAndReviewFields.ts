import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminTableAndReviewFields1762177000000
  implements MigrationInterface
{
  name = 'CreateAdminTableAndReviewFields1762177000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "username" character varying(150) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "accessToken" text,
        "refreshToken" text,
        CONSTRAINT "PK_admins_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admins_username" UNIQUE ("username")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN "adminReviewComment" text
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN "adminReviewedBy" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN "adminReviewedAt" TIMESTAMP WITH TIME ZONE
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD CONSTRAINT "FK_properties_adminReviewedBy"
      FOREIGN KEY ("adminReviewedBy") REFERENCES "admins"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_adminReviewedBy"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties" DROP COLUMN "adminReviewedAt"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties" DROP COLUMN "adminReviewedBy"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties" DROP COLUMN "adminReviewComment"
    `);

    await queryRunner.query(`
      DROP TABLE "admins"
    `);
  }
}

