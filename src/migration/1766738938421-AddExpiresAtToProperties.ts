import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to add expiresAt column to properties table
 * 
 * This migration adds the expiresAt field which stores the expiry date
 * for approved properties (15 days from approval).
 */
export class AddExpiresAtToProperties1766738938421 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "expiresAt" TIMESTAMP WITH TIME ZONE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN "expiresAt"
        `);
    }

}
