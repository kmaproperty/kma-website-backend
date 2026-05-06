import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeContactedPropertyEmailNullable1775300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacted_properties" ALTER COLUMN "email" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacted_properties" ALTER COLUMN "email" SET DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore NOT NULL by blanking any nulls first so the constraint can be re-added
    await queryRunner.query(
      `UPDATE "contacted_properties" SET "email" = '' WHERE "email" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacted_properties" ALTER COLUMN "email" SET NOT NULL`,
    );
  }
}
