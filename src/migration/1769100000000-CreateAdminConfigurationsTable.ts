import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminConfigurationsTable1769100000000 implements MigrationInterface {
  name = 'CreateAdminConfigurationsTable1769100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admin_configurations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "mobile_app_available" BOOLEAN NOT NULL DEFAULT false,
        "description" TEXT,
        "phone_number" VARCHAR(20),
        "address" TEXT,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        CONSTRAINT "PK_admin_configurations_id" PRIMARY KEY ("id")
      )
    `);

    // Create index on created_at for faster sorting
    await queryRunner.query(`
      CREATE INDEX "IDX_admin_configurations_created_at" ON "admin_configurations" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_admin_configurations_created_at"`,
    );
    await queryRunner.query(`DROP TABLE "admin_configurations"`);
  }
}

