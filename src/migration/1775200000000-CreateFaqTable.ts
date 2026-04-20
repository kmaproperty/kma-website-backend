import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFaqTable1775200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'faqs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'question',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'answer',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'sort_order',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
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

    // Seed initial FAQ data
    await queryRunner.query(`
      INSERT INTO faqs (id, category, question, answer, sort_order, is_active) VALUES
      -- Getting Started
      (uuid_generate_v4(), 'Getting Started', 'Who can post a property on KMA?', 'Property Owners and verified Channel Partners (builders, brokers, agents) can list properties and projects.', 1, true),
      (uuid_generate_v4(), 'Getting Started', 'How do I join as a Channel Partner?', 'Register on KMA, complete KYC verification, and sign the Channel Partner agreement to get verified.', 2, true),

      -- Posting Projects & Properties
      (uuid_generate_v4(), 'Posting Projects & Properties', 'Is it free to post a project/property?', 'Yes. Owners can post up to 3 properties for free. To post unlimited, switch to a Channel Partner account.', 1, true),
      (uuid_generate_v4(), 'Posting Projects & Properties', 'What documents are required to list a project?', 'You need property photos, ownership proof, and basic details like price, area, and location.', 2, true),
      (uuid_generate_v4(), 'Posting Projects & Properties', 'Can I edit my listing after posting?', 'Yes, you can edit your listing anytime from your dashboard under My Listings.', 3, true),

      -- Property Search & User Assistance
      (uuid_generate_v4(), 'Property Search & User Assistance', 'How can I search for a property on KMA?', 'Use the home page search bar to find by location, project name, or property type. Apply filters to refine results.', 1, true),
      (uuid_generate_v4(), 'Property Search & User Assistance', 'Do I need to log in to search?', 'No, searching is free and open to all. However, to contact owners or save properties, you need to log in.', 2, true),
      (uuid_generate_v4(), 'Property Search & User Assistance', 'Are the properties verified?', 'Yes, KMA verifies property details through document checks and partner verification processes.', 3, true),

      -- General Questions
      (uuid_generate_v4(), 'General Questions', 'What types of properties can be posted?', 'KMA supports both residential (flats, villas, floors, plots) and commercial (offices, shops, commercial plots) listings.', 1, true),
      (uuid_generate_v4(), 'General Questions', 'How long does it take for my project to go live?', 'After submission, projects are reviewed within 24-48 hours before going live.', 2, true),
      (uuid_generate_v4(), 'General Questions', 'Can I share property listings?', 'Yes, each listing has a share button to share via WhatsApp, social media, or copy link.', 3, true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('faqs');
  }
}
