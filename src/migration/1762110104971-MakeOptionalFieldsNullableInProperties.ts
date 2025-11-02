import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeOptionalFieldsNullableInProperties1762110104971 implements MigrationInterface {
    name = 'MakeOptionalFieldsNullableInProperties1762110104971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Helper function to find and drop foreign key constraint by column name
        const dropForeignKeyConstraint = async (tableName: string, columnName: string): Promise<void> => {
            // Find the constraint name by joining pg_constraint with pg_attribute
            const result = await queryRunner.query(`
                SELECT c.conname
                FROM pg_constraint c
                JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
                WHERE c.conrelid = '${tableName}'::regclass
                AND c.contype = 'f'
                AND a.attname = '${columnName}'
            `);
            
            if (result && result.length > 0) {
                for (const row of result) {
                    await queryRunner.query(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${row.conname}"`);
                }
            }
        };

        // Make cityId nullable
        await dropForeignKeyConstraint('properties', 'cityId');
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "cityId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_cityId" FOREIGN KEY ("cityId") REFERENCES "master_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Make societyId nullable
        await dropForeignKeyConstraint('properties', 'societyId');
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "societyId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_societyId" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Make propertyTypeId nullable
        await dropForeignKeyConstraint('properties', 'propertyTypeId');
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "propertyTypeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_propertyTypeId" FOREIGN KEY ("propertyTypeId") REFERENCES "master_property_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Make bhkTypeId nullable
        await dropForeignKeyConstraint('properties', 'bhkTypeId');
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "bhkTypeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_bhkTypeId" FOREIGN KEY ("bhkTypeId") REFERENCES "master_bhk_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Make ageOfProperty nullable
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "ageOfProperty" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert ageOfProperty to NOT NULL
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "ageOfProperty" SET NOT NULL`);

        // Revert bhkTypeId to NOT NULL
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_bhkTypeId"`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "bhkTypeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_bhkTypeId" FOREIGN KEY ("bhkTypeId") REFERENCES "master_bhk_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Revert propertyTypeId to NOT NULL
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_propertyTypeId"`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "propertyTypeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_propertyTypeId" FOREIGN KEY ("propertyTypeId") REFERENCES "master_property_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Revert societyId to NOT NULL
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_societyId"`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "societyId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_societyId" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Revert cityId to NOT NULL
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_cityId"`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "cityId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_cityId" FOREIGN KEY ("cityId") REFERENCES "master_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

