import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create property_rejection_history table
 * 
 * This table stores the history of all property rejections, allowing tracking
 * of multiple rejections over time with reasons and admin information.
 */
export class CreatePropertyRejectionHistory1767002000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "property_rejection_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "property_id" uuid NOT NULL,
        "rejection_reason" text NOT NULL,
        "admin_id" uuid NOT NULL,
        CONSTRAINT "PK_property_rejection_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_property_rejection_history_property_id" 
          FOREIGN KEY ("property_id") 
          REFERENCES "properties"("id") 
          ON DELETE NO ACTION 
          ON UPDATE NO ACTION
      )
    `);

    // Create index on property_id for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_property_rejection_history_property_id" 
      ON "property_rejection_history" ("property_id")
    `);

    // Create index on created_at for chronological queries
    await queryRunner.query(`
      CREATE INDEX "IDX_property_rejection_history_created_at" 
      ON "property_rejection_history" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_property_rejection_history_created_at"
    `);
    
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_property_rejection_history_propertyId"
    `);
    
    await queryRunner.query(`
      DROP TABLE "property_rejection_history"
    `);
  }
}

