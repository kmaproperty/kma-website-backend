import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExtendedFieldsToJobs1775400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('jobs', [
      new TableColumn({ name: 'openings_count', type: 'int', isNullable: true }),
      new TableColumn({ name: 'country', type: 'varchar', length: '120', default: "'India'" }),
      new TableColumn({ name: 'state', type: 'varchar', length: '120', isNullable: true }),
      new TableColumn({ name: 'city', type: 'varchar', length: '120', isNullable: true }),
      new TableColumn({ name: 'work_mode', type: 'varchar', length: '40', isNullable: true }),
      new TableColumn({ name: 'salary_type', type: 'varchar', length: '40', isNullable: true }),
      new TableColumn({ name: 'salary_visibility', type: 'boolean', default: true }),
      new TableColumn({
        name: 'experience_label',
        type: 'varchar',
        length: '120',
        isNullable: true,
      }),
      new TableColumn({
        name: 'minimum_qualification',
        type: 'varchar',
        length: '150',
        isNullable: true,
      }),
      new TableColumn({ name: 'skills', type: 'text', isNullable: true }),
      new TableColumn({ name: 'responsibilities', type: 'text', isNullable: true }),
      new TableColumn({ name: 'hr_name', type: 'varchar', length: '140', isNullable: true }),
      new TableColumn({
        name: 'hr_mobile_number',
        type: 'varchar',
        length: '30',
        isNullable: true,
      }),
      new TableColumn({
        name: 'contact_email',
        type: 'varchar',
        length: '160',
        isNullable: true,
      }),
      new TableColumn({
        name: 'company_website',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({ name: 'company_logo', type: 'varchar', length: '500', isNullable: true }),
      new TableColumn({ name: 'featured', type: 'boolean', default: false }),
      new TableColumn({ name: 'urgent_hiring', type: 'boolean', default: false }),
      new TableColumn({
        name: 'approval_status',
        type: 'varchar',
        length: '30',
        default: "'PENDING'",
      }),
      new TableColumn({
        name: 'apply_type',
        type: 'varchar',
        length: '30',
        default: "'IN_APP'",
      }),
      new TableColumn({ name: 'apply_link', type: 'varchar', length: '600', isNullable: true }),
      new TableColumn({ name: 'view_count', type: 'int', default: 0 }),
      new TableColumn({ name: 'apply_count', type: 'int', default: 0 }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('jobs', [
      'openings_count',
      'country',
      'state',
      'city',
      'work_mode',
      'salary_type',
      'salary_visibility',
      'experience_label',
      'minimum_qualification',
      'skills',
      'responsibilities',
      'hr_name',
      'hr_mobile_number',
      'contact_email',
      'company_website',
      'company_logo',
      'featured',
      'urgent_hiring',
      'approval_status',
      'apply_type',
      'apply_link',
      'view_count',
      'apply_count',
    ]);
  }
}
