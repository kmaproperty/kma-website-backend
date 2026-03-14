import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRegionalOfficesTable1769900000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'regional_offices',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'city', type: 'varchar', length: '255', isNullable: false },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'contact_person', type: 'varchar', length: '255', isNullable: false },
          { name: 'designation', type: 'varchar', length: '255', isNullable: true },
          { name: 'phone', type: 'varchar', length: '20', isNullable: false },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
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
    await queryRunner.dropTable('regional_offices');
  }
}
