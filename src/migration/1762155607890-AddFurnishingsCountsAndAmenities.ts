import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFurnishingsCountsAndAmenities1762155607890 implements MigrationInterface {
    name = 'AddFurnishingsCountsAndAmenities1762155607890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add furnishingsCounts jsonb column if not exists
        await queryRunner.query(`ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "furnishingsCounts" jsonb`);

        // Add amenities text (simple-array) column if not exists
        await queryRunner.query(`ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "amenities" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "amenities"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "furnishingsCounts"`);
    }
}


