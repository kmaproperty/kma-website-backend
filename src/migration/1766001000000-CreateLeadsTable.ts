import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeadsTable1766001000000 implements MigrationInterface {
  name = 'CreateLeadsTable1766001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "leads_type_enum" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');
    `);

    await queryRunner.query(`
      CREATE TABLE "leads" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "userId" uuid NOT NULL,
        "propertyId" uuid,
        "type" "leads_type_enum" NOT NULL,
        CONSTRAINT "PK_leads_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "leads"`);
    await queryRunner.query(`DROP TYPE "leads_type_enum"`);
  }
}


