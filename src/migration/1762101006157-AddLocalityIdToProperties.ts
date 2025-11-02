import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocalityIdToProperties1762101006157 implements MigrationInterface {
    name = 'AddLocalityIdToProperties1762101006157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" ADD "localityId" uuid`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_a61920fc38d0deb87ff0b5b70b2" FOREIGN KEY ("localityId") REFERENCES "master_localities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_a61920fc38d0deb87ff0b5b70b2"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "localityId"`);
    }

}
