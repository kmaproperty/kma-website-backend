import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropChannelPartnerAgreements1766008000000 implements MigrationInterface {
  name = 'DropChannelPartnerAgreements1766008000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "channel_partner_agreements"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate table if migration needs to be rolled back
    await queryRunner.query(`
      CREATE TABLE "channel_partner_agreements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "userId" uuid NOT NULL,
        "envelopeId" character varying(100) NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'sent',
        "completedAt" TIMESTAMP WITH TIME ZONE,
        "returnUrl" text,
        CONSTRAINT "PK_channel_partner_agreements_id" PRIMARY KEY ("id")
      )
    `);
  }
}

