import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovalStatusToPropertyMedia1775000000000
  implements MigrationInterface
{
  name = 'AddApprovalStatusToPropertyMedia1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing photos: set approvalStatus = 'approved' for all existing photos
    // (grandfather existing media as approved since they were already visible)
    await queryRunner.query(`
      UPDATE properties
      SET photos = (
        SELECT jsonb_agg(
          photo || '{"approvalStatus": "approved"}'::jsonb
        )
        FROM jsonb_array_elements(photos) AS photo
      )
      WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0
    `);

    // Update existing videos: set approvalStatus = 'approved' for all existing videos
    await queryRunner.query(`
      UPDATE properties
      SET videos = (
        SELECT jsonb_agg(
          video || '{"approvalStatus": "approved"}'::jsonb
        )
        FROM jsonb_array_elements(videos) AS video
      )
      WHERE videos IS NOT NULL AND jsonb_array_length(videos) > 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove approvalStatus and rejectionReason from photos
    await queryRunner.query(`
      UPDATE properties
      SET photos = (
        SELECT jsonb_agg(
          photo - 'approvalStatus' - 'rejectionReason'
        )
        FROM jsonb_array_elements(photos) AS photo
      )
      WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0
    `);

    // Remove approvalStatus and rejectionReason from videos
    await queryRunner.query(`
      UPDATE properties
      SET videos = (
        SELECT jsonb_agg(
          video - 'approvalStatus' - 'rejectionReason'
        )
        FROM jsonb_array_elements(videos) AS video
      )
      WHERE videos IS NOT NULL AND jsonb_array_length(videos) > 0
    `);
  }
}
