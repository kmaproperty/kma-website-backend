import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailToAdminConfigurations1769300000000
  implements MigrationInterface
{
  name = 'AddEmailToAdminConfigurations1769300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "admin_configurations"
            ADD COLUMN "email" VARCHAR(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "admin_configurations"
            DROP COLUMN "email"
        `);
  }
}

