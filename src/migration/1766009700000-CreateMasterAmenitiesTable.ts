import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create master_amenities table
 * 
 * This migration creates a table to store master amenity data
 * that can be used when creating property listings.
 */
export class CreateMasterAmenitiesTable1766009700000 implements MigrationInterface {
  name = 'CreateMasterAmenitiesTable1766009700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "master_amenities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "code" varchar(100) NOT NULL,
        "icon" varchar(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_master_amenities_code" UNIQUE ("code"),
        CONSTRAINT "PK_master_amenities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_master_amenities_is_active" ON "master_amenities" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_master_amenities_sort_order" ON "master_amenities" ("sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_master_amenities_sort_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_master_amenities_is_active"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "master_amenities"`);
  }
}

