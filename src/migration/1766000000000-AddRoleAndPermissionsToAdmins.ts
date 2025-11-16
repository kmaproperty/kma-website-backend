import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleAndPermissionsToAdmins1766000000000
  implements MigrationInterface
{
  name = 'AddRoleAndPermissionsToAdmins1766000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for admin roles
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admins_role_enum') THEN
          CREATE TYPE "admins_role_enum" AS ENUM ('SUPER_ADMIN', 'ADMIN');
        END IF;
      END
      $$;
    `);

    // Add role column with default ADMIN
    await queryRunner.query(`
      ALTER TABLE "admins"
      ADD COLUMN IF NOT EXISTS "role" "admins_role_enum" NOT NULL DEFAULT 'ADMIN'
    `);

    // Add permissions column as text (simple-array)
    await queryRunner.query(`
      ALTER TABLE "admins"
      ADD COLUMN IF NOT EXISTS "permissions" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop permissions column
    await queryRunner.query(`
      ALTER TABLE "admins"
      DROP COLUMN IF EXISTS "permissions"
    `);

    // Drop role column
    await queryRunner.query(`
      ALTER TABLE "admins"
      DROP COLUMN IF EXISTS "role"
    `);

    // Drop enum type if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admins_role_enum') THEN
          DROP TYPE "admins_role_enum";
        END IF;
      END
      $$;
    `);
  }
}


