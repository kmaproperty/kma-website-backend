import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create bank_details table
 * 
 * This migration creates a table to store encrypted bank details for users.
 * Sensitive fields (account_number, ifsc_code) are stored encrypted.
 */
export class CreateBankDetailsTable1766010000000 implements MigrationInterface {
  name = 'CreateBankDetailsTable1766010000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bank_details" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" uuid NOT NULL,
        "account_number" text NOT NULL,
        "ifsc_code" text NOT NULL,
        "bank_name" varchar(255) NOT NULL,
        "account_holder_name" varchar(255) NOT NULL,
        "branch_name" varchar(255),
        CONSTRAINT "PK_bank_details_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bank_details_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bank_details_user_id" ON "bank_details" ("user_id")
    `);

    // Add unique constraint to ensure one bank detail record per user
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_bank_details_user_id" ON "bank_details" ("user_id") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_bank_details_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bank_details_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bank_details"`);
  }
}

