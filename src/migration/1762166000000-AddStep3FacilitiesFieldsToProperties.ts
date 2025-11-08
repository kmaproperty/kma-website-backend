import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add facilities fields for Step 3 workflow
 *
 * Adds seating capacity, cabin/meeting room counts, conference room count,
 * and reception area availability columns to the properties table.
 */
export class AddStep3FacilitiesFieldsToProperties1762166000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure shared yes/no enum exists
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_type t
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE t.typname = 'properties_charges_enum'
                ) THEN
                    CREATE TYPE "properties_charges_enum" AS ENUM ('yes', 'no');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "minNumberOfSeats" INTEGER
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "maxNumberOfSeats" INTEGER
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "numberOfCabins" INTEGER
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "numberOfMeetingRooms" INTEGER
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "conferenceRoom" INTEGER
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            ADD COLUMN "receptionArea" "properties_charges_enum"
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."minNumberOfSeats" IS
            'Minimum number of seats available for commercial setups'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."maxNumberOfSeats" IS
            'Maximum number of seats available for commercial setups'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."numberOfCabins" IS
            'Number of cabins available in the property'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."numberOfMeetingRooms" IS
            'Number of meeting rooms available in the property'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."conferenceRoom" IS
            'Count of conference rooms available in the property'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."receptionArea" IS
            'Indicates if a reception area is available (yes/no)'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."receptionArea" IS NULL
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."conferenceRoom" IS NULL
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."numberOfMeetingRooms" IS NULL
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."numberOfCabins" IS NULL
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."maxNumberOfSeats" IS NULL
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "properties"."minNumberOfSeats" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN IF EXISTS "receptionArea"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN IF EXISTS "conferenceRoom"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN IF EXISTS "numberOfMeetingRooms"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN IF EXISTS "numberOfCabins"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN IF EXISTS "maxNumberOfSeats"
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
            DROP COLUMN IF EXISTS "minNumberOfSeats"
        `);
    }
}

