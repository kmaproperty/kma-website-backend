import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactedPropertiesTable1769900000004
  implements MigrationInterface
{
  name = 'CreateContactedPropertiesTable1769900000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "contacted_properties" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "session_id" varchar(64),
        "user_id" uuid,
        "property_id" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "email" varchar(255) NOT NULL,
        "phone" varchar(20) NOT NULL,
        "country_code" varchar(10),
        CONSTRAINT "PK_contacted_properties_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_contacted_properties_user_id" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contacted_properties_property_id" FOREIGN KEY ("property_id") 
          REFERENCES "properties"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contacted_properties_session_id" 
      ON "contacted_properties" ("session_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contacted_properties_user_id" 
      ON "contacted_properties" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contacted_properties_property_id" 
      ON "contacted_properties" ("property_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_contacted_properties_property_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_contacted_properties_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_contacted_properties_session_id"`,
    );
    await queryRunner.query(`DROP TABLE "contacted_properties"`);
  }
}
