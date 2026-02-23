import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocalityIdToMasterBuiltUpArea1762100541578 implements MigrationInterface {
    name = 'AddLocalityIdToMasterBuiltUpArea1762100541578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ADD COLUMN IF NOT EXISTS "locality_id" uuid`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" DROP CONSTRAINT IF EXISTS "FK_65eb7a4d29c8d75aa6591824e87"`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" DROP CONSTRAINT IF EXISTS "FK_master_built_up_areas_society_id"`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ALTER COLUMN "society_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ADD CONSTRAINT "FK_65eb7a4d29c8d75aa6591824e87" FOREIGN KEY ("society_id") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ADD CONSTRAINT "FK_cbc75e9fd1c29256420addc238c" FOREIGN KEY ("locality_id") REFERENCES "master_localities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" DROP CONSTRAINT IF EXISTS "FK_cbc75e9fd1c29256420addc238c"`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" DROP CONSTRAINT IF EXISTS "FK_65eb7a4d29c8d75aa6591824e87"`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ALTER COLUMN "society_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ADD CONSTRAINT "FK_65eb7a4d29c8d75aa6591824e87" FOREIGN KEY ("society_id") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" DROP COLUMN "locality_id"`);
    }

}
