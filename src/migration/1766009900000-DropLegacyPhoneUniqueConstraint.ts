import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cleanup migration for Option B (multiple users per phone with different roles).
 *
 * The earlier migration added a composite UNIQUE(phone, role), but the original
 * auto-generated unique constraint on phone alone (e.g. "UQ_a000cca60bcf04454e727699490")
 * may still exist in some databases. That constraint is what your error log shows.
 *
 * This migration:
 * - Dynamically finds ANY unique constraint on "users.phone"
 * - Drops those constraints safely
 * - Leaves the composite UNIQUE(phone, role) intact
 */
export class DropLegacyPhoneUniqueConstraint1766009900000
  implements MigrationInterface
{
  name = 'DropLegacyPhoneUniqueConstraint1766009900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find all unique constraints that include the "phone" column on "users" table
    const constraints: Array<{ conname: string }> = await queryRunner.query(`
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
      WHERE t.relname = 'users'
        AND n.nspname = 'public'
        AND c.contype = 'u'
        AND a.attname = 'phone'
    `);

    for (const row of constraints) {
      // Skip composite (phone, role) constraint if it exists
      if (row.conname === 'UQ_users_phone_role') {
        continue;
      }

      await queryRunner.query(
        `ALTER TABLE "users" DROP CONSTRAINT "${row.conname}"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op: we don't know the original auto-generated constraint name(s) in a portable way
    // and re-adding a UNIQUE(phone) would break the Option B design.
  }
}


