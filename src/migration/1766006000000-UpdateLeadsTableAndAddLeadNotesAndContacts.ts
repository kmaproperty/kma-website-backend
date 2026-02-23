import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLeadsTableAndAddLeadNotesAndContacts1766006000000
  implements MigrationInterface
{
  name = 'UpdateLeadsTableAndAddLeadNotesAndContacts1766006000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types (use DO block for compatibility with PostgreSQL < 13 which does not support CREATE TYPE IF NOT EXISTS)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "leads_buildingtype_enum" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "leads_status_enum" AS ENUM (
          'NEW',
          'CONTACTED',
          'INTERESTED',
          'NOT_INTERESTED',
          'CONVERTED',
          'LOST'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Make userId nullable (for public lead creation)
    await queryRunner.query(`
      ALTER TABLE "leads"
      ALTER COLUMN "userId" DROP NOT NULL
    `);

    // Add new columns to leads table
    await queryRunner.query(`
      ALTER TABLE "leads"
      ADD COLUMN IF NOT EXISTS "name" VARCHAR(255) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20),
      ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "budget_min" BIGINT,
      ADD COLUMN IF NOT EXISTS "budget_max" BIGINT,
      ADD COLUMN IF NOT EXISTS "size_min" INTEGER,
      ADD COLUMN IF NOT EXISTS "size_max" INTEGER,
      ADD COLUMN IF NOT EXISTS "building_type" "leads_buildingtype_enum",
      ADD COLUMN IF NOT EXISTS "property_types" TEXT[],
      ADD COLUMN IF NOT EXISTS "locations" TEXT[],
      ADD COLUMN IF NOT EXISTS "status" "leads_status_enum" NOT NULL DEFAULT 'NEW',
      ADD COLUMN IF NOT EXISTS "last_contacted_at" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "properties_contacted_count" INTEGER NOT NULL DEFAULT 0
    `);

    // Update existing leads to have a default name if name is empty
    await queryRunner.query(`
      UPDATE "leads"
      SET "name" = 'Lead ' || id::text
      WHERE "name" = '' OR "name" IS NULL
    `);

    // Create lead_notes table
    await queryRunner.query(`
      CREATE TABLE "lead_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "lead_id" uuid NOT NULL,
        "note" TEXT NOT NULL,
        "created_by_admin_id" uuid,
        CONSTRAINT "PK_lead_notes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_lead_notes_lead_id" FOREIGN KEY ("lead_id")
          REFERENCES "leads"("id") ON DELETE CASCADE
      )
    `);

    // Create lead_property_contacts table
    await queryRunner.query(`
      CREATE TABLE "lead_property_contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "lead_id" uuid NOT NULL,
        "property_id" uuid NOT NULL,
        "contacted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_lead_property_contacts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_lead_property_contacts_lead_id" FOREIGN KEY ("lead_id")
          REFERENCES "leads"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_lead_property_contacts_property_id" FOREIGN KEY ("property_id")
          REFERENCES "properties"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_lead_property_contacts_lead_property" UNIQUE ("lead_id", "property_id")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_lead_notes_lead_id" ON "lead_notes"("lead_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_lead_property_contacts_lead_id" ON "lead_property_contacts"("lead_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_lead_property_contacts_property_id" ON "lead_property_contacts"("property_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_leads_status" ON "leads"("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_leads_building_type" ON "leads"("building_type")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_leads_name" ON "leads"("name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_leads_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_leads_building_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_leads_status"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_lead_property_contacts_property_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_lead_property_contacts_lead_id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_lead_notes_lead_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "lead_property_contacts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lead_notes"`);

    // Remove columns from leads table
    await queryRunner.query(`
      ALTER TABLE "leads"
      DROP COLUMN IF EXISTS "properties_contacted_count",
      DROP COLUMN IF EXISTS "last_contacted_at",
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "locations",
      DROP COLUMN IF EXISTS "property_types",
      DROP COLUMN IF EXISTS "building_type",
      DROP COLUMN IF EXISTS "size_max",
      DROP COLUMN IF EXISTS "size_min",
      DROP COLUMN IF EXISTS "budget_max",
      DROP COLUMN IF EXISTS "budget_min",
      DROP COLUMN IF EXISTS "email",
      DROP COLUMN IF EXISTS "phone",
      DROP COLUMN IF EXISTS "name"
    `);

    // Revert userId to NOT NULL (if needed)
    await queryRunner.query(`
      ALTER TABLE "leads"
      ALTER COLUMN "userId" SET NOT NULL
    `);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "leads_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "leads_buildingtype_enum"`);
  }
}

