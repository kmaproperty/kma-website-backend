import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAboutUsTable1769000000000 implements MigrationInterface {
  name = 'CreateAboutUsTable1769000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "about_us" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "heading" VARCHAR(500) NOT NULL,
        "description" TEXT NOT NULL,
        CONSTRAINT "PK_about_us_id" PRIMARY KEY ("id")
      )
    `);

    // Create index on created_at for faster sorting
    await queryRunner.query(`
      CREATE INDEX "IDX_about_us_created_at" ON "about_us" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_about_us_created_at"`,
    );
    await queryRunner.query(`DROP TABLE "about_us"`);
  }
}

