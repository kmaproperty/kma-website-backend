import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCrmSyncFieldsToProperties1775100000000
  implements MigrationInterface
{
  name = 'AddCrmSyncFieldsToProperties1775100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "syncWithCrm" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "syncedAt" timestamp with time zone
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "syncedAt"`);
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "syncWithCrm"`);
  }
}
