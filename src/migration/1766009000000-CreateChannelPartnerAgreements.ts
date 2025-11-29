import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChannelPartnerAgreements1766009000000 implements MigrationInterface {
  name = 'CreateChannelPartnerAgreements1766009000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
        CONSTRAINT "PK_channel_partner_agreements_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_channel_partner_agreements_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_channel_partner_agreements_userId" ON "channel_partner_agreements" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_channel_partner_agreements_envelopeId" ON "channel_partner_agreements" ("envelopeId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_channel_partner_agreements_envelopeId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_channel_partner_agreements_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "channel_partner_agreements"`);
  }
}

