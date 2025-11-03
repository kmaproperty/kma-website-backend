import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceToProperties1762152778296 implements MigrationInterface {
    name = 'AddPriceToProperties1762152778296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add price column
        await queryRunner.query(`ALTER TABLE "properties" ADD "price" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove price column
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "price"`);
    }

}

