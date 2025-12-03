import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create master_furnishings table
 * 
 * This migration creates a table to store master furnishing data
 * that can be used when creating property listings.
 */
export class CreateMasterFurnishingsTable1766009600000 implements MigrationInterface {
  name = 'CreateMasterFurnishingsTable1766009600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "master_furnishings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "code" varchar(100) NOT NULL,
        "icon" varchar(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_master_furnishings_code" UNIQUE ("code"),
        CONSTRAINT "PK_master_furnishings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_master_furnishings_is_active" ON "master_furnishings" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_master_furnishings_sort_order" ON "master_furnishings" ("sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_master_furnishings_sort_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_master_furnishings_is_active"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "master_furnishings"`);
  }
}

