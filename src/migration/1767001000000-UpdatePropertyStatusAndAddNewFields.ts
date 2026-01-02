import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Update property status enum and add new fields
 * 
 * 1. Updates status enum to only include: draft, pending_review, active, rejected, deactivated
 * 2. Migrates existing data:
 *    - 'approved' -> 'active'
 *    - 'expired', 'inactive', 'sold', 'rented' -> 'deactivated'
 * 3. Adds new fields:
 *    - rejection_reason (text, nullable)
 *    - is_verified (enum: verified, unverified, pending)
 *    - activated_at (timestamp, nullable)
 *    - deactivation_reason (enum: sold, rented, hold, owner_request, nullable)
 */
export class UpdatePropertyStatusAndAddNewFields1767001000000
  implements MigrationInterface
{
  private readonly newStatuses = [
    'draft',
    'pending_review',
    'active',
    'rejected',
    'deactivated',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add new columns first (before migrating status data)
    
    // Add rejection_reason column
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "rejection_reason" text
    `);

    // Create is_verified enum type if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "properties_is_verified_enum" AS ENUM('verified', 'unverified', 'pending');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add is_verified column
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "is_verified" "properties_is_verified_enum" NOT NULL DEFAULT 'unverified'
    `);

    // Add activated_at column
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "activated_at" timestamp with time zone
    `);

    // Create deactivation_reason enum type if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "properties_deactivation_reason_enum" AS ENUM('sold', 'rented', 'hold', 'owner_request');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add deactivation_reason column
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "deactivation_reason" "properties_deactivation_reason_enum"
    `);

    // Step 2: Update status enum/constraint (convert to text first to allow migration)
    // First, change the column to use text temporarily to allow status migration
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
    `);

    if (enumExists && enumExists.length > 0) {
      // For PostgreSQL enums, we need to recreate the type
      // First, drop the default value to remove dependency
      await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "status" DROP DEFAULT
      `);

      // Change the column to use text temporarily
      await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "status" TYPE text
        USING "status"::text
      `);

      // Drop the old enum (now safe since no dependencies)
      await queryRunner.query(`
        DROP TYPE IF EXISTS "properties_status_enum"
      `);
    } else {
      // Use check constraint approach - drop constraint first
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
    }

    // Now migrate the status data (status column is now text)
    // Map 'approved' to 'active' and set activated_at and is_verified
    await queryRunner.query(`
      UPDATE "properties"
      SET "status" = 'active',
          "activated_at" = COALESCE("adminReviewedAt", NOW()),
          "is_verified" = 'verified'
      WHERE "status" = 'approved'
    `);

    // Map 'sold' to 'deactivated' with deactivation_reason = 'sold'
    await queryRunner.query(`
      UPDATE "properties"
      SET "status" = 'deactivated',
          "deactivation_reason" = 'sold'
      WHERE "status" = 'sold'
    `);

    // Map 'rented' to 'deactivated' with deactivation_reason = 'rented'
    await queryRunner.query(`
      UPDATE "properties"
      SET "status" = 'deactivated',
          "deactivation_reason" = 'rented'
      WHERE "status" = 'rented'
    `);

    // Map 'expired' and 'inactive' to 'deactivated' (deactivation_reason remains NULL)
    await queryRunner.query(`
      UPDATE "properties"
      SET "status" = 'deactivated'
      WHERE "status" IN ('expired', 'inactive')
    `);

    // Now create new enum with only the new values
    await queryRunner.query(`
      CREATE TYPE "properties_status_enum" AS ENUM('draft', 'pending_review', 'active', 'rejected', 'deactivated')
    `);

    // Change column back to enum
    await queryRunner.query(`
      ALTER TABLE "properties"
      ALTER COLUMN "status" TYPE "properties_status_enum" USING "status"::"properties_status_enum"
    `);

    // Restore the default value
    await queryRunner.query(`
      ALTER TABLE "properties"
      ALTER COLUMN "status" SET DEFAULT 'draft'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove new columns
    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "deactivation_reason"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "activated_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "is_verified"
    `);

    await queryRunner.query(`
      ALTER TABLE "properties"
      DROP COLUMN IF EXISTS "rejection_reason"
    `);

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS "properties_deactivation_reason_enum"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "properties_is_verified_enum"
    `);

    // Revert status values (approximate - we can't perfectly restore)
    await queryRunner.query(`
      UPDATE "properties"
      SET "status" = 'approved'
      WHERE "status" = 'active'
    `);

    // Note: We can't perfectly restore expired/inactive/sold/rented
    // as we don't have that information anymore. They'll remain as deactivated.
    
    // Recreate old enum/constraint if needed
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
    `);

    if (enumExists && enumExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "status" TYPE text
      `);

      await queryRunner.query(`
        DROP TYPE IF EXISTS "properties_status_enum"
      `);

      await queryRunner.query(`
        CREATE TYPE "properties_status_enum" AS ENUM('draft', 'pending_review', 'approved', 'rejected', 'expired', 'inactive', 'sold', 'rented')
      `);

      await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "status" TYPE "properties_status_enum" USING "status"::"properties_status_enum"
      `);
    }
  }
}

