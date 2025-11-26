import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add approved/rejected statuses to properties status enum.
 *
 * The application already uses these statuses in the entity definitions and
 * admin review workflow. This migration makes sure the database enum (or the
 * fallback check constraint) is aware of the additional values so inserts and
 * updates do not fail.
 */
export class AddApprovedRejectedStatusToProperties1766004000000
  implements MigrationInterface
{
  private readonly statuses = [
    'draft',
    'pending_review',
    'approved',
    'rejected',
    'active',
    'inactive',
    'sold',
    'rented',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
    `);

    if (enumExists && enumExists.length > 0) {
      await queryRunner.query(`
        ALTER TYPE "properties_status_enum"
        ADD VALUE IF NOT EXISTS 'approved'
      `);
      await queryRunner.query(`
        ALTER TYPE "properties_status_enum"
        ADD VALUE IF NOT EXISTS 'rejected'
      `);
      return;
    }

    const constraintExists = await queryRunner.query(`
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'CHK_properties_status'
      AND conrelid = 'properties'::regclass
    `);

    if (constraintExists && constraintExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE "properties"
        DROP CONSTRAINT IF EXISTS "CHK_properties_status"
      `);
    }

    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD CONSTRAINT "CHK_properties_status"
      CHECK (status IN (${this.statuses.map((s) => `'${s}'`).join(', ')}))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "properties"
      SET "status" = 'pending_review'
      WHERE "status" IN ('approved', 'rejected')
    `);

    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
    `);

    if (enumExists && enumExists.length > 0) {
      // PostgreSQL cannot drop enum values without recreating the type.
      // Documenting via console log instead of attempting a destructive operation.
      console.log(
        'Enum values approved/rejected remain in properties_status_enum after down migration.',
      );
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP CONSTRAINT IF EXISTS "CHK_properties_status"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD CONSTRAINT "CHK_properties_status"
      CHECK (status IN ('draft', 'pending_review', 'active', 'inactive', 'sold', 'rented'))
    `);
  }
}


