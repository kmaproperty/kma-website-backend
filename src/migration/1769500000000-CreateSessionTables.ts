import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSessionTables1769500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sessions table
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Set when session is merged with user account after login',
          },
          {
            name: 'merged_at',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Timestamp when session was merged with user account',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create index on session_id
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_sessions_session_id',
        columnNames: ['session_id'],
        isUnique: true,
      }),
    );

    // Create index on user_id for faster lookups
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_sessions_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Create session_property_views table
    await queryRunner.createTable(
      new Table({
        name: 'session_property_views',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'session_id',
            type: 'uuid',
          },
          {
            name: 'property_id',
            type: 'uuid',
          },
          {
            name: 'view_count',
            type: 'int',
            default: 1,
            comment: 'Number of times this property was viewed in this session',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create unique index on session_id and property_id
    await queryRunner.createIndex(
      'session_property_views',
      new TableIndex({
        name: 'IDX_session_property_views_session_property',
        columnNames: ['session_id', 'property_id'],
        isUnique: true,
      }),
    );

    // Create foreign key from session_property_views to sessions
    await queryRunner.createForeignKey(
      'session_property_views',
      new TableForeignKey({
        columnNames: ['session_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sessions',
        onDelete: 'CASCADE',
        name: 'FK_session_property_views_session_id',
      }),
    );

    // Create foreign key from sessions to users (optional, for when merged)
    await queryRunner.createForeignKey(
      'sessions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        name: 'FK_sessions_user_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('sessions', 'FK_sessions_user_id');
    await queryRunner.dropForeignKey('session_property_views', 'FK_session_property_views_session_id');

    // Drop indexes
    await queryRunner.dropIndex('session_property_views', 'IDX_session_property_views_session_property');
    await queryRunner.dropIndex('sessions', 'IDX_sessions_user_id');
    await queryRunner.dropIndex('sessions', 'IDX_sessions_session_id');

    // Drop tables
    await queryRunner.dropTable('session_property_views');
    await queryRunner.dropTable('sessions');
  }
}

