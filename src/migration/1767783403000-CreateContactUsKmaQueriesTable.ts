import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactUsKmaQueriesTable1767783403000
  implements MigrationInterface
{
  name = 'CreateContactUsKmaQueriesTable1767783403000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "contact_us_kma_queries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" VARCHAR(255) NOT NULL,
        "phone_number" VARCHAR(20) NOT NULL,
        "email" VARCHAR(255),
        "end_user_id" uuid,
        CONSTRAINT "PK_contact_us_kma_queries_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_contact_us_kma_queries_end_user_id" FOREIGN KEY ("end_user_id") 
          REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Create index on end_user_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_contact_us_kma_queries_end_user_id" ON "contact_us_kma_queries" ("end_user_id")
    `);

    // Create index on phone_number for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_contact_us_kma_queries_phone_number" ON "contact_us_kma_queries" ("phone_number")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_contact_us_kma_queries_phone_number"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_contact_us_kma_queries_end_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "contact_us_kma_queries"`);
  }
}

