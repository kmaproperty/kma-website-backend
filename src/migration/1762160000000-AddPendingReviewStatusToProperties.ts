import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add pending_review status to properties table
 * 
 * This migration adds a new status value 'pending_review' to the status enum.
 * Properties move to pending_review status when Step 4 (Photos/Videos) is completed.
 */
export class AddPendingReviewStatusToProperties1762160000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First check if the enum type exists
        const enumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
        `);

        if (enumExists && enumExists.length > 0) {
            // If enum type exists, add the new value
            await queryRunner.query(`
                ALTER TYPE "properties_status_enum" 
                ADD VALUE IF NOT EXISTS 'pending_review' AFTER 'draft'
            `);
        } else {
            // If column uses inline enum (check constraint), we need to recreate it
            // First, check if we're using an inline enum
            const checkConstraintExists = await queryRunner.query(`
                SELECT 1 FROM pg_constraint 
                WHERE conname LIKE 'CHK_%_status' 
                AND conrelid = 'properties'::regclass
            `);

            if (checkConstraintExists && checkConstraintExists.length > 0) {
                // Drop the existing check constraint
                await queryRunner.query(`
                    ALTER TABLE "properties" 
                    DROP CONSTRAINT IF EXISTS "CHK_properties_status"
                `);
                
                // Add new check constraint with the updated enum values
                await queryRunner.query(`
                    ALTER TABLE "properties" 
                    ADD CONSTRAINT "CHK_properties_status" 
                    CHECK (status IN ('draft', 'pending_review', 'active', 'inactive', 'sold', 'rented'))
                `);
            } else {
                // If neither exists, alter the column type directly
                await queryRunner.query(`
                    ALTER TABLE "properties" 
                    ALTER COLUMN "status" TYPE VARCHAR(50)
                `);
                
                await queryRunner.query(`
                    ALTER TABLE "properties" 
                    ADD CONSTRAINT "CHK_properties_status" 
                    CHECK (status IN ('draft', 'pending_review', 'active', 'inactive', 'sold', 'rented'))
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Update any properties with pending_review status back to draft
        await queryRunner.query(`
            UPDATE "properties" 
            SET "status" = 'draft' 
            WHERE "status" = 'pending_review'
        `);

        // Check if we're using an enum type or check constraint
        const enumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
        `);

        if (enumExists && enumExists.length > 0) {
            // Note: PostgreSQL doesn't support removing values from enums directly
            // We would need to recreate the enum type, which is complex
            // For now, we'll leave the enum value in place but document it's not used
            console.log('Note: pending_review enum value cannot be removed from PostgreSQL enum. It will remain unused.');
        } else {
            // If using check constraint, recreate it without pending_review
            await queryRunner.query(`
                ALTER TABLE "properties" 
                DROP CONSTRAINT IF EXISTS "CHK_properties_status"
            `);
            
            await queryRunner.query(`
                ALTER TABLE "properties" 
                ADD CONSTRAINT "CHK_properties_status" 
                CHECK (status IN ('draft', 'active', 'inactive', 'sold', 'rented'))
            `);
        }
    }

}

