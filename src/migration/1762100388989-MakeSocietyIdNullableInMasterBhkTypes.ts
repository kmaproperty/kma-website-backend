import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeSocietyIdNullableInMasterBhkTypes1762100388989 implements MigrationInterface {
    name = 'MakeSocietyIdNullableInMasterBhkTypes1762100388989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD "localityId" uuid`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" DROP CONSTRAINT "FK_d4cfa6e919b9e8d9ca71523fb55"`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ALTER COLUMN "societyId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD CONSTRAINT "FK_d4cfa6e919b9e8d9ca71523fb55" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD CONSTRAINT "FK_f7018f1200e9e584710022cfcfc" FOREIGN KEY ("localityId") REFERENCES "master_localities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_bhk_types" DROP CONSTRAINT "FK_f7018f1200e9e584710022cfcfc"`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" DROP CONSTRAINT "FK_d4cfa6e919b9e8d9ca71523fb55"`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ALTER COLUMN "societyId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD CONSTRAINT "FK_d4cfa6e919b9e8d9ca71523fb55" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" DROP COLUMN "localityId"`);
    }

}
