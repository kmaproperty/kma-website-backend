import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add builtUpAreaId column referencing master_built_up_areas for Step 1 linkage.
 */
export class AddBuiltUpAreaIdToProperties1765002000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN "builtUpAreaId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD CONSTRAINT "FK_properties_builtUpArea"
      FOREIGN KEY ("builtUpAreaId")
      REFERENCES "master_built_up_areas"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP CONSTRAINT IF EXISTS "FK_properties_builtUpArea"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "builtUpAreaId"
    `);
  }
}


