import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFurnishingsColumn1762155001123 implements MigrationInterface {
    name = 'RemoveFurnishingsColumn1762155001123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop furnishings column if it exists
        // Using dynamic check for compatibility; if it doesn't exist, this will error in pure SQL,
        // but typical flow assumes it exists due to earlier migration.
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "furnishings"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate furnishings column as text (simple-array)
        await queryRunner.query(`ALTER TABLE "properties" ADD "furnishings" text`);
    }
}


