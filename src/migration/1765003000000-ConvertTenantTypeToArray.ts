import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTenantTypeToArray1765003000000
  implements MigrationInterface
{
  name = 'ConvertTenantTypeToArray1765003000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ALTER COLUMN "tenantType"
      TYPE text[]
      USING CASE
        WHEN "tenantType" IS NULL THEN NULL
        ELSE ARRAY["tenantType"::text]
      END
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "properties_tenanttype_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "properties_tenanttype_enum" AS ENUM ('family', 'bachelors', 'company')
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      ALTER COLUMN "tenantType"
      TYPE "properties_tenanttype_enum"
      USING CASE
        WHEN "tenantType" IS NULL OR cardinality("tenantType") = 0 THEN NULL
        ELSE ("tenantType")[1]::text::"properties_tenanttype_enum"
      END
    `);
  }
}

