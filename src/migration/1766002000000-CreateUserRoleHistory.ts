import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRoleHistory1766002000000 implements MigrationInterface {
  name = 'CreateUserRoleHistory1766002000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_role_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "userId" uuid NOT NULL,
        "fromRole" "users_role_enum" NOT NULL,
        "toRole" "users_role_enum" NOT NULL,
        "channelPartnerCode" character varying(50),
        CONSTRAINT "PK_user_role_history_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_role_history"`);
  }
}


