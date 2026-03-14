import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTeamMembersTable1769900000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'team_members',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'role', type: 'varchar', length: '255', isNullable: false },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'profile_image', type: 'varchar', length: '500', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'display_order', type: 'int', isNullable: false, default: 0 },
          { name: 'is_founder', type: 'boolean', isNullable: false, default: false },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('team_members');
  }
}
