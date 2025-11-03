import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStep4PhotosAndVideosToProperties1762159993285 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add photos jsonb column for storing property photos with metadata
        await queryRunner.query(`ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "photos" jsonb`);
        
        // Add videos jsonb column for storing property videos with metadata
        await queryRunner.query(`ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "videos" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "videos"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "photos"`);
    }

}
