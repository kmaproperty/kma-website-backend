import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMasterLocalitiesTable1762096528621 implements MigrationInterface {
    name = 'CreateMasterLocalitiesTable1762096528621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "master_localities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(200) NOT NULL, "sector" character varying(200), "cityId" uuid NOT NULL, "latitude" numeric(10,8), "longitude" numeric(11,8), CONSTRAINT "PK_404f026fac71280e7a936a464e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."properties_transactiontype_enum" AS ENUM('new_booking', 'resale')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "transactionType" "public"."properties_transactiontype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."properties_constructionstatus_enum" AS ENUM('ready_to_move', 'under_construction')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "constructionStatus" "public"."properties_constructionstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "possessionBy" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "possessionTime" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "master_localities" ADD CONSTRAINT "FK_a4aa5bca124f3209917c525ec64" FOREIGN KEY ("cityId") REFERENCES "master_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_localities" DROP CONSTRAINT "FK_a4aa5bca124f3209917c525ec64"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "possessionTime"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "possessionBy"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "constructionStatus"`);
        await queryRunner.query(`DROP TYPE "public"."properties_constructionstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "transactionType"`);
        await queryRunner.query(`DROP TYPE "public"."properties_transactiontype_enum"`);
        await queryRunner.query(`DROP TABLE "master_localities"`);
    }

}
