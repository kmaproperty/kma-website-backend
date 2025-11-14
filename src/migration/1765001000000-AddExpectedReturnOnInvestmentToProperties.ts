import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add expectedReturnOnInvestment column to properties for Step 2 ROI tracking.
 */
export class AddExpectedReturnOnInvestmentToProperties1765001000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN "expectedReturnOnInvestment" character varying(100)
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "properties"."expectedReturnOnInvestment" IS
      'Expected return on investment (e.g., percentage or absolute amount)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "expectedReturnOnInvestment"
    `);
  }
}


