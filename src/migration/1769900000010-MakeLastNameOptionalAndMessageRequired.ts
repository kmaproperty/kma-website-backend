import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeLastNameOptionalAndMessageRequired1769900000010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make last_name nullable
    await queryRunner.query(
      `ALTER TABLE "contact_us" ALTER COLUMN "last_name" DROP NOT NULL`,
    );

    // Update any existing null messages to empty string before making not null
    await queryRunner.query(
      `UPDATE "contact_us" SET "message" = '' WHERE "message" IS NULL`,
    );

    // Make message not nullable
    await queryRunner.query(
      `ALTER TABLE "contact_us" ALTER COLUMN "message" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: make message nullable
    await queryRunner.query(
      `ALTER TABLE "contact_us" ALTER COLUMN "message" DROP NOT NULL`,
    );

    // Revert: make last_name not nullable
    await queryRunner.query(
      `UPDATE "contact_us" SET "last_name" = '' WHERE "last_name" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact_us" ALTER COLUMN "last_name" SET NOT NULL`,
    );
  }
}
