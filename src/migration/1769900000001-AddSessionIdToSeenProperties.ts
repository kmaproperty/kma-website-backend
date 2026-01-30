import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionIdToSeenProperties1769900000001
  implements MigrationInterface
{
  name = 'AddSessionIdToSeenProperties1769900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old unique index on user_id + property_id
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_seen_properties_user_property"`,
    );

    // Add session_id column
    await queryRunner.query(`
      ALTER TABLE "seen_properties" 
      ADD COLUMN "session_id" varchar(64)
    `);

    // Make user_id nullable
    await queryRunner.query(`
      ALTER TABLE "seen_properties" 
      ALTER COLUMN "user_id" DROP NOT NULL
    `);

    // Create unique index on session_id + property_id (for anonymous users)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_seen_properties_session_property" 
      ON "seen_properties" ("session_id", "property_id") 
      WHERE "deleted_at" IS NULL AND "session_id" IS NOT NULL
    `);

    // Create index on user_id + property_id (for logged-in users lookup)
    await queryRunner.query(`
      CREATE INDEX "IDX_seen_properties_user_property" 
      ON "seen_properties" ("user_id", "property_id") 
      WHERE "deleted_at" IS NULL
    `);

    // Create index on session_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_seen_properties_session_id" 
      ON "seen_properties" ("session_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_seen_properties_session_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_seen_properties_user_property"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_seen_properties_session_property"`,
    );

    // Make user_id NOT NULL again (will fail if there are NULL values)
    await queryRunner.query(`
      ALTER TABLE "seen_properties" 
      ALTER COLUMN "user_id" SET NOT NULL
    `);

    // Drop session_id column
    await queryRunner.query(`
      ALTER TABLE "seen_properties" 
      DROP COLUMN "session_id"
    `);

    // Recreate original unique index on user_id + property_id
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_seen_properties_user_property" 
      ON "seen_properties" ("user_id", "property_id") 
      WHERE "deleted_at" IS NULL
    `);
  }
}
