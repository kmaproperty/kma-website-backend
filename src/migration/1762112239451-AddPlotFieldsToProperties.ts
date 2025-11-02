import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlotFieldsToProperties1762112239451 implements MigrationInterface {
    name = 'AddPlotFieldsToProperties1762112239451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add plotArea column
        await queryRunner.query(`ALTER TABLE "properties" ADD "plotArea" integer`);

        // Add plotAreaUnit column
        await queryRunner.query(`ALTER TABLE "properties" ADD "plotAreaUnit" varchar(50)`);

        // Add plotLength column
        await queryRunner.query(`ALTER TABLE "properties" ADD "plotLength" integer`);

        // Add plotWidth column
        await queryRunner.query(`ALTER TABLE "properties" ADD "plotWidth" integer`);

        // Add plotFacingRoadWidth column
        await queryRunner.query(`ALTER TABLE "properties" ADD "plotFacingRoadWidth" varchar(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove plotFacingRoadWidth column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plotFacingRoadWidth"`);

        // Remove plotWidth column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plotWidth"`);

        // Remove plotLength column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plotLength"`);

        // Remove plotAreaUnit column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plotAreaUnit"`);

        // Remove plotArea column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plotArea"`);
    }

}

