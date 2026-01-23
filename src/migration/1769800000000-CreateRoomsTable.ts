import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create rooms table
 *
 * This table stores room types that can be used to categorize property photos.
 * Rooms are managed by admins and can be used dynamically in property listings.
 */
export class CreateRoomsTable1769800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(100) NOT NULL,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_rooms_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_rooms_name" UNIQUE ("name")
      )
    `);

    // Create index
    await queryRunner.query(`
      CREATE INDEX "IDX_rooms_name" ON "rooms" ("name")
    `);

    // Insert initial room data
    await queryRunner.query(`
      INSERT INTO "rooms" ("name", "display_order", "is_active") VALUES
      ('Living Room', 1, true),
      ('Bedroom', 2, true),
      ('Kitchen', 3, true),
      ('Bathroom', 4, true),
      ('Balcony', 5, true),
      ('Exterior', 6, true),
      ('Parking', 7, true),
      ('Amenities', 8, true),
      ('Other', 9, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_rooms_name"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
  }
}

