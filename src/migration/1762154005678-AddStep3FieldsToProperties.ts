import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStep3FieldsToProperties1762154005678 implements MigrationInterface {
    name = 'AddStep3FieldsToProperties1762154005678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Additional rooms (simple-array => text)
        await queryRunner.query(`ALTER TABLE "properties" ADD "additionalRooms" text`);

        // Reserved parking counts
        await queryRunner.query(`ALTER TABLE "properties" ADD "reservedParkingCovered" integer`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "reservedParkingOpen" integer`);

        // Power backup enum and column
        await queryRunner.query(`CREATE TYPE "properties_power_backup_enum" AS ENUM('No Back-up', 'Available')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "powerBackup" "properties_power_backup_enum"`);

        // Furnish type enum and column
        await queryRunner.query(`CREATE TYPE "properties_furnish_type_enum" AS ENUM('Furnished', 'Semi-Furnished', 'Unfurnished')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "furnishType" "properties_furnish_type_enum"`);

        // Furnishings (simple-array => text)
        await queryRunner.query(`ALTER TABLE "properties" ADD "furnishings" text`);

        // Furnishings with counts (jsonb)
        await queryRunner.query(`ALTER TABLE "properties" ADD "furnishingsCounts" jsonb`);

        // Amenities (simple-array => text)
        await queryRunner.query(`ALTER TABLE "properties" ADD "amenities" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove amenities
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "amenities"`);

        // Remove furnishingsCounts
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "furnishingsCounts"`);
        // Remove furnishings
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "furnishings"`);

        // Remove furnish type and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "furnishType"`);
        await queryRunner.query(`DROP TYPE "properties_furnish_type_enum"`);

        // Remove power backup and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "powerBackup"`);
        await queryRunner.query(`DROP TYPE "properties_power_backup_enum"`);

        // Remove reserved parking counts
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "reservedParkingOpen"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "reservedParkingCovered"`);

        // Remove additional rooms
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "additionalRooms"`);
    }
}


