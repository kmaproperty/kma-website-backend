import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateReferralEnquiriesTable1775500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'referral_enquiries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'referrer_name', type: 'varchar', length: '255' },
          { name: 'referrer_phone', type: 'varchar', length: '20' },
          { name: 'client_name', type: 'varchar', length: '255' },
          { name: 'client_mobile', type: 'varchar', length: '20' },
          { name: 'property_type', type: 'varchar', length: '20' },
          { name: 'location', type: 'varchar', length: '255', isNullable: true },
          {
            name: 'channel_partner_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'status', type: 'varchar', length: '30', default: "'Pending'" },
          { name: 'coins_credited', type: 'int', default: 0 },
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
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('referral_enquiries', [
      new TableIndex({
        name: 'IDX_referral_enquiries_created_at',
        columnNames: ['created_at'],
      }),
      new TableIndex({
        name: 'IDX_referral_enquiries_status',
        columnNames: ['status'],
      }),
      new TableIndex({
        name: 'IDX_referral_enquiries_partner',
        columnNames: ['channel_partner_id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('referral_enquiries');
  }
}
