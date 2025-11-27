import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeLeadUserIdNullable1766007000000 implements MigrationInterface {
  name = 'MakeLeadUserIdNullable1766007000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make userId nullable to allow public lead creation
    await queryRunner.query(`
      ALTER TABLE "leads"
      ALTER COLUMN "userId" DROP NOT NULL
    `);

    // Make type nullable (we're using buildingType now, but type is still required)
    // Set a default for existing rows first
    await queryRunner.query(`
      UPDATE "leads"
      SET "type" = 'RESIDENTIAL'
      WHERE "type" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "leads"
      ALTER COLUMN "type" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set default values for NULL types before making it NOT NULL
    await queryRunner.query(`
      UPDATE "leads"
      SET "type" = 'RESIDENTIAL'
      WHERE "type" IS NULL
    `);

    // Revert type to NOT NULL
    await queryRunner.query(`
      ALTER TABLE "leads"
      ALTER COLUMN "type" SET NOT NULL
    `);

    // Revert userId to NOT NULL
    // Note: This will fail if there are any NULL userId values
    await queryRunner.query(`
      ALTER TABLE "leads"
      ALTER COLUMN "userId" SET NOT NULL
    `);
  }
}

