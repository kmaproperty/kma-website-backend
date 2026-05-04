import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateJobsTables1775300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'job_categories',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '120', isNullable: false, isUnique: true },
          { name: 'slug', type: 'varchar', length: '140', isNullable: false, isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'jobs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'title', type: 'varchar', length: '180', isNullable: false },
          { name: 'company_name', type: 'varchar', length: '180', isNullable: false },
          { name: 'location', type: 'varchar', length: '150', isNullable: false },
          { name: 'job_type', type: 'varchar', length: '80', isNullable: true },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'requirements', type: 'text', isNullable: true },
          { name: 'benefits', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', length: '30', isNullable: false, default: "'DRAFT'" },
          { name: 'min_experience_years', type: 'int', isNullable: true },
          { name: 'max_experience_years', type: 'int', isNullable: true },
          { name: 'salary_min', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'salary_max', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'application_deadline', type: 'timestamp with time zone', isNullable: true },
          { name: 'published_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'posted_by_admin_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'jobs',
      new TableForeignKey({
        columnNames: ['posted_by_admin_id'],
        referencedTableName: 'admins',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'job_category_mappings',
        columns: [
          { name: 'job_id', type: 'uuid', isPrimary: true },
          { name: 'category_id', type: 'uuid', isPrimary: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('job_category_mappings', [
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedTableName: 'job_categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'job_applications',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'job_id', type: 'uuid', isNullable: false },
          { name: 'full_name', type: 'varchar', length: '140', isNullable: false },
          { name: 'email', type: 'varchar', length: '160', isNullable: false },
          { name: 'phone_number', type: 'varchar', length: '30', isNullable: false },
          { name: 'resume_url', type: 'text', isNullable: true },
          { name: 'cover_letter', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', length: '30', isNullable: false, default: "'NEW'" },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'job_applications',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'job_applications',
      new TableIndex({ name: 'IDX_job_applications_job_id', columnNames: ['job_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('job_applications');
    await queryRunner.dropTable('job_category_mappings');
    await queryRunner.dropTable('jobs');
    await queryRunner.dropTable('job_categories');
  }
}
