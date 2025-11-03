import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStep3WaterLiftFields1762155400456 implements MigrationInterface {
    name = 'AddStep3WaterLiftFields1762155400456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create water source enum and column
        await queryRunner.query(`CREATE TYPE "properties_water_source_enum" AS ENUM('Municipal Supply', 'BoreWell/ Underground', 'other')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "waterSource" "properties_water_source_enum"`);

        // Add lift availability boolean
        await queryRunner.query(`ALTER TABLE "properties" ADD "isLiftAvailable" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "isLiftAvailable"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "waterSource"`);
        await queryRunner.query(`DROP TYPE "properties_water_source_enum"`);
    }
}


