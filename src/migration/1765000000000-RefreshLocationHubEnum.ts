import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshLocationHubEnum1765000000000 implements MigrationInterface {
  name = 'RefreshLocationHubEnum1765000000000';

  private newEnumValues = [
    'it_park',
    'business_park',
    'mall',
    'commercial_project',
    'residential_project',
    'retail_complex_building',
    'market_high_street',
    'others',
  ];

  private oldEnumValues = ['it_park', 'business_park', 'others'];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "properties_locationhub_enum" RENAME TO "properties_locationhub_enum_old"`
    );

    await queryRunner.query(
      `CREATE TYPE "properties_locationhub_enum" AS ENUM(${this.newEnumValues
        .map((value) => `'${value}'`)
        .join(', ')})`
    );

    await queryRunner.query(
      `ALTER TABLE "properties" ALTER COLUMN "locationHub" TYPE "properties_locationhub_enum" USING "locationHub"::text::"properties_locationhub_enum"`
    );

    await queryRunner.query(`DROP TYPE "properties_locationhub_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "properties_locationhub_enum" RENAME TO "properties_locationhub_enum_new"`
    );

    await queryRunner.query(
      `CREATE TYPE "properties_locationhub_enum" AS ENUM(${this.oldEnumValues
        .map((value) => `'${value}'`)
        .join(', ')})`
    );

    await queryRunner.query(
      `ALTER TABLE "properties" ALTER COLUMN "locationHub" TYPE "properties_locationhub_enum" USING CASE WHEN "locationHub"::text = ANY (ARRAY[${this.oldEnumValues
        .map((value) => `'${value}'`)
        .join(', ')}]) THEN "locationHub"::text::"properties_locationhub_enum" ELSE NULL END`
    );

    await queryRunner.query(`DROP TYPE "properties_locationhub_enum_new"`);
  }
}

