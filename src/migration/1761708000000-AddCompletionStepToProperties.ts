import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add completionStep column to properties table
 * 
 * This migration adds a completionStep field to track the progress of property posting workflow:
 * - 0: Not started
 * - 1: Step 1 completed (Basic details)
 * - 2: Step 2 completed (Additional details)
 * - 3: Step 3 completed (Media/Photos)
 * - 4: Step 4 completed (Review)
 * - 5: All steps completed
 */
export class AddCompletionStepToProperties1761708000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add completion_step column with default value 0
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "completion_step" integer NOT NULL DEFAULT 0
        `);

        // Add comment to the column for documentation
        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."completion_step" IS 
            'Current completion step (0=not started, 1-4=in progress, 5=completed)'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove completion_step column
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN IF EXISTS "completion_step"
        `);
    }

}

