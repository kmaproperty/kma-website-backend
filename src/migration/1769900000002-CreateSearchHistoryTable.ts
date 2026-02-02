import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchHistoryTable1769900000002
  implements MigrationInterface
{
  name = 'CreateSearchHistoryTable1769900000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "search_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" uuid NOT NULL,
        "search_query" varchar(500) NOT NULL,
        "location" varchar(255),
        "city" varchar(100),
        "price_range" varchar(50),
        "filters" jsonb,
        CONSTRAINT "PK_search_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_search_history_user_id" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_search_history_user_id" 
      ON "search_history" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_search_history_user_created" 
      ON "search_history" ("user_id", "created_at" DESC) 
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_search_history_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_search_history_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "search_history"`);
  }
}
