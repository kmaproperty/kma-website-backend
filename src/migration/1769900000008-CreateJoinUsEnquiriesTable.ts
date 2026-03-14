import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateJoinUsEnquiriesTable1769900000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'join_us_enquiries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'first_name', type: 'varchar', length: '255', isNullable: false },
          { name: 'last_name', type: 'varchar', length: '255', isNullable: false },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'phone_number', type: 'varchar', length: '20', isNullable: false },
          { name: 'state', type: 'varchar', length: '255', isNullable: true },
          { name: 'city', type: 'varchar', length: '255', isNullable: true },
          { name: 'message', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('join_us_enquiries');
  }
}
