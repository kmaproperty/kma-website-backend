import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add END_USER role to users_role_enum
 * 
 * This migration adds the END_USER role to the existing enum type,
 * allowing end users to sign up and login with mobile phone and OTP.
 */
export class AddEndUserRole1766009500000 implements MigrationInterface {
  name = 'AddEndUserRole1766009500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add END_USER to the existing enum type
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'END_USER'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing enum values directly
    // This would require recreating the enum type, which is complex
    // In practice, you would need to:
    // 1. Create a new enum without END_USER
    // 2. Update all columns using the old enum to the new enum
    // 3. Drop the old enum
    // 4. Rename the new enum
    // 
    // For safety, we'll leave this as a no-op and document the manual process
    // if rollback is truly needed in the future
    
    // If rollback is absolutely necessary, you would need to:
    // 1. Migrate all END_USER records to another role or delete them
    // 2. Recreate the enum without END_USER
    // 3. Update the users table to use the new enum
    
    // No-op: PostgreSQL enum values cannot be removed directly
    // Manual intervention required if rollback is needed
  }
}

