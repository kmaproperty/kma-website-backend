import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStep2PlotFieldsToProperties1762153001234 implements MigrationInterface {
    name = 'AddStep2PlotFieldsToProperties1762153001234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add plot number column
        await queryRunner.query(`ALTER TABLE "properties" ADD "plotNumber" varchar(100)`);

        // Add house number column
        await queryRunner.query(`ALTER TABLE "properties" ADD "houseNumber" varchar(100)`);

        // Add villa number column
        await queryRunner.query(`ALTER TABLE "properties" ADD "villaNumber" varchar(100)`);

        // Create possession status enum type
        await queryRunner.query(`CREATE TYPE "properties_possession_status_enum" AS ENUM('immediate', 'future')`);
        
        // Add possession status column
        await queryRunner.query(`ALTER TABLE "properties" ADD "possessionStatus" "properties_possession_status_enum"`);

        // Add possession date column
        await queryRunner.query(`ALTER TABLE "properties" ADD "possessionDate" date`);

        // Add plot price column
        await queryRunner.query(`ALTER TABLE "properties" ADD "plotPrice" integer`);

        // Create brokerage enum type
        await queryRunner.query(`CREATE TYPE "properties_brokerage_enum" AS ENUM('yes', 'no')`);
        
        // Add brokerage column
        await queryRunner.query(`ALTER TABLE "properties" ADD "brokerage" "properties_brokerage_enum"`);

        // Create loan available enum type
        await queryRunner.query(`CREATE TYPE "properties_loan_available_enum" AS ENUM('yes', 'no')`);
        
        // Add loan available column
        await queryRunner.query(`ALTER TABLE "properties" ADD "loanAvailable" "properties_loan_available_enum"`);

        // Create boundary wall enum type
        await queryRunner.query(`CREATE TYPE "properties_boundary_wall_enum" AS ENUM('yes', 'no')`);
        
        // Add boundary wall column
        await queryRunner.query(`ALTER TABLE "properties" ADD "boundaryWall" "properties_boundary_wall_enum"`);

        // Add number of open sides column
        await queryRunner.query(`ALTER TABLE "properties" ADD "noOfOpenSides" integer`);

        // Add floors allowed for construction column
        await queryRunner.query(`ALTER TABLE "properties" ADD "floorsAllowedForConstruction" integer`);

        // Create construction done enum type
        await queryRunner.query(`CREATE TYPE "properties_construction_done_enum" AS ENUM('yes', 'no')`);
        
        // Add construction done column
        await queryRunner.query(`ALTER TABLE "properties" ADD "constructionDone" "properties_construction_done_enum"`);

        // Add construction type column
        await queryRunner.query(`ALTER TABLE "properties" ADD "constructionType" varchar(100)`);

        // Create corner property enum type
        await queryRunner.query(`CREATE TYPE "properties_corner_property_enum" AS ENUM('yes', 'no')`);
        
        // Add corner property column
        await queryRunner.query(`ALTER TABLE "properties" ADD "cornerProperty" "properties_corner_property_enum"`);

        // Add property description column
        await queryRunner.query(`ALTER TABLE "properties" ADD "propertyDescription" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove property description column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "propertyDescription"`);

        // Remove corner property column and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "cornerProperty"`);
        await queryRunner.query(`DROP TYPE "properties_corner_property_enum"`);

        // Remove construction type column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "constructionType"`);

        // Remove construction done column and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "constructionDone"`);
        await queryRunner.query(`DROP TYPE "properties_construction_done_enum"`);

        // Remove floors allowed for construction column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "floorsAllowedForConstruction"`);

        // Remove number of open sides column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "noOfOpenSides"`);

        // Remove boundary wall column and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "boundaryWall"`);
        await queryRunner.query(`DROP TYPE "properties_boundary_wall_enum"`);

        // Remove loan available column and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "loanAvailable"`);
        await queryRunner.query(`DROP TYPE "properties_loan_available_enum"`);

        // Remove brokerage column and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "brokerage"`);
        await queryRunner.query(`DROP TYPE "properties_brokerage_enum"`);

        // Remove plot price column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plotPrice"`);

        // Remove possession date column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "possessionDate"`);

        // Remove possession status column and enum
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "possessionStatus"`);
        await queryRunner.query(`DROP TYPE "properties_possession_status_enum"`);

        // Remove villa number column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "villaNumber"`);

        // Remove house number column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "houseNumber"`);

        // Remove plot number column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plotNumber"`);
    }

}

