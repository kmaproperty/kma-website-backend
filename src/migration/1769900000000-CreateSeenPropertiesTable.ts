import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeenPropertiesTable1769900000000
  implements MigrationInterface
{
  name = 'CreateSeenPropertiesTable1769900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "seen_properties" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" uuid NOT NULL,
        "property_id" uuid NOT NULL,
        CONSTRAINT "PK_seen_properties_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_seen_properties_user_id" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_seen_properties_property_id" FOREIGN KEY ("property_id") 
          REFERENCES "properties"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_seen_properties_user_property" 
      ON "seen_properties" ("user_id", "property_id") 
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_seen_properties_user_id" 
      ON "seen_properties" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_seen_properties_property_id" 
      ON "seen_properties" ("property_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_seen_properties_property_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_seen_properties_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_seen_properties_user_property"`,
    );
    await queryRunner.query(`DROP TABLE "seen_properties"`);
  }
}
