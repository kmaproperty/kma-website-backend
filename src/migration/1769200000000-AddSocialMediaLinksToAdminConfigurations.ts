import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocialMediaLinksToAdminConfigurations1769200000000 implements MigrationInterface {
  name = 'AddSocialMediaLinksToAdminConfigurations1769200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admin_configurations"
      ADD COLUMN "instagram_link" VARCHAR(500),
      ADD COLUMN "fb_link" VARCHAR(500),
      ADD COLUMN "youtube_link" VARCHAR(500),
      ADD COLUMN "twitter_link" VARCHAR(500)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admin_configurations"
      DROP COLUMN IF EXISTS "twitter_link",
      DROP COLUMN IF EXISTS "youtube_link",
      DROP COLUMN IF EXISTS "fb_link",
      DROP COLUMN IF EXISTS "instagram_link"
    `);
  }
}

