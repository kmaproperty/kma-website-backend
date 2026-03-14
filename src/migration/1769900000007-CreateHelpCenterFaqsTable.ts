import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHelpCenterFaqsTable1769900000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'help_center_faqs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'question', type: 'text', isNullable: false },
          { name: 'answer', type: 'text', isNullable: false },
          { name: 'category', type: 'varchar', length: '255', isNullable: true },
          { name: 'display_order', type: 'int', isNullable: false, default: 0 },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('help_center_faqs');
  }
}
