import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStep2FieldsToProperties1761734549223 implements MigrationInterface {
    name = 'AddStep2FieldsToProperties1761734549223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_bhk_types" DROP CONSTRAINT IF EXISTS "fk_bhk_type_society"`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" DROP CONSTRAINT IF EXISTS "FK_d4cfa6e919b9e8d9ca71523fb55"`);
        await queryRunner.query(`ALTER TABLE "master_societies" DROP COLUMN IF EXISTS "locality_name"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "floorNumber" integer`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "totalFloors" integer`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "flatNumber" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "towerBlock" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "propertyAreaAcre" integer`);
        await queryRunner.query(`CREATE TYPE "public"."properties_tenanttype_enum" AS ENUM('family', 'bachelors', 'company')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "tenantType" "public"."properties_tenanttype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."properties_companyoccupancy_enum" AS ENUM('open_for_both', 'men_only', 'women_only')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "companyOccupancy" "public"."properties_companyoccupancy_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."properties_rentavailability_enum" AS ENUM('immediately', 'later')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "rentAvailability" "public"."properties_rentavailability_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "availableFromDate" date`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "monthlyRent" integer`);
        await queryRunner.query(`CREATE TYPE "public"."properties_maintenancetype_enum" AS ENUM('include_in_rent', 'separate')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "maintenanceType" "public"."properties_maintenancetype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "maintenanceChargeAmount" integer`);
        await queryRunner.query(`CREATE TYPE "public"."properties_securitydeposittype_enum" AS ENUM('none', '1_month', '2_month', '6_month', 'custom')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "securityDepositType" "public"."properties_securitydeposittype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "securityDepositAmount" integer`);
        await queryRunner.query(`CREATE TYPE "public"."properties_lockintype_enum" AS ENUM('none', '1_month', '2_month', '6_month', 'custom')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "lockInType" "public"."properties_lockintype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "lockInMonths" integer`);
        await queryRunner.query(`CREATE TYPE "public"."properties_brokeragetype_enum" AS ENUM('none', '15_days', '30_days', 'custom')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "brokerageType" "public"."properties_brokeragetype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "brokerageAmount" integer`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "isBrokerageNegotiable" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ALTER COLUMN "societyId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD CONSTRAINT "FK_d4cfa6e919b9e8d9ca71523fb55" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_bhk_types" DROP CONSTRAINT "FK_d4cfa6e919b9e8d9ca71523fb55"`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ALTER COLUMN "societyId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "isBrokerageNegotiable"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "brokerageAmount"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "brokerageType"`);
        await queryRunner.query(`DROP TYPE "public"."properties_brokeragetype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "lockInMonths"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "lockInType"`);
        await queryRunner.query(`DROP TYPE "public"."properties_lockintype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "securityDepositAmount"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "securityDepositType"`);
        await queryRunner.query(`DROP TYPE "public"."properties_securitydeposittype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "maintenanceChargeAmount"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "maintenanceType"`);
        await queryRunner.query(`DROP TYPE "public"."properties_maintenancetype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "monthlyRent"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "availableFromDate"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "rentAvailability"`);
        await queryRunner.query(`DROP TYPE "public"."properties_rentavailability_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "companyOccupancy"`);
        await queryRunner.query(`DROP TYPE "public"."properties_companyoccupancy_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "tenantType"`);
        await queryRunner.query(`DROP TYPE "public"."properties_tenanttype_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "propertyAreaAcre"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "towerBlock"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "flatNumber"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "totalFloors"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "floorNumber"`);
        await queryRunner.query(`ALTER TABLE "master_societies" ADD COLUMN IF NOT EXISTS "locality_name" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD CONSTRAINT "fk_bhk_type_society" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
