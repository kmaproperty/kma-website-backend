import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionIdToSearchHistory1769900000003
  implements MigrationInterface
{
  name = 'AddSessionIdToSearchHistory1769900000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add session_id column
    await queryRunner.query(`
      ALTER TABLE "search_history" 
      ADD COLUMN "session_id" varchar(64)
    `);

    // Make user_id nullable
    await queryRunner.query(`
      ALTER TABLE "search_history" 
      ALTER COLUMN "user_id" DROP NOT NULL
    `);

    // Create index on session_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_search_history_session_id" 
      ON "search_history" ("session_id")
    `);

    // Create index on (session_id, created_at) for listing recent by session
    await queryRunner.query(`
      CREATE INDEX "IDX_search_history_session_created" 
      ON "search_history" ("session_id", "created_at" DESC) 
      WHERE "deleted_at" IS NULL AND "session_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_search_history_session_created"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_search_history_session_id"`,
    );

    // Make user_id NOT NULL again (will fail if there are NULL values)
    await queryRunner.query(`
      ALTER TABLE "search_history" 
      ALTER COLUMN "user_id" SET NOT NULL
    `);

    // Drop session_id column
    await queryRunner.query(`
      ALTER TABLE "search_history" 
      DROP COLUMN "session_id"
    `);
  }
}
