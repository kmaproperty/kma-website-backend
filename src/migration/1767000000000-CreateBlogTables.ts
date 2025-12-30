import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create blog and blog_comments tables
 * 
 * This migration creates:
 * - blogs table: Stores blog posts with status, approval, and metadata
 * - blog_comments table: Stores comments and replies on blogs
 */
export class CreateBlogTables1767000000000 implements MigrationInterface {
  name = 'CreateBlogTables1767000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for blog status
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blogs_status_enum') THEN
          CREATE TYPE "blogs_status_enum" AS ENUM('draft', 'pending_approval', 'approved', 'rejected', 'published');
        END IF;
      END
      $$;
    `);

    // Create blogs table
    await queryRunner.query(`
      CREATE TABLE "blogs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "title" varchar(500) NOT NULL,
        "content" text NOT NULL,
        "excerpt" text,
        "featured_image" varchar(500),
        "author" varchar(200),
        "author_id" uuid,
        "status" "blogs_status_enum" NOT NULL DEFAULT 'draft',
        "approved_by_id" uuid,
        "approved_at" TIMESTAMP WITH TIME ZONE,
        "rejection_reason" text,
        "published_at" TIMESTAMP WITH TIME ZONE,
        "tags" text,
        "category" varchar(200),
        "meta_title" varchar(500),
        "meta_description" text,
        "view_count" integer NOT NULL DEFAULT 0,
        "allow_comments" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_blogs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_blogs_author_id" FOREIGN KEY ("author_id") REFERENCES "admins"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_blogs_approved_by_id" FOREIGN KEY ("approved_by_id") REFERENCES "admins"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for blogs table
    await queryRunner.query(`
      CREATE INDEX "IDX_blogs_author_id" ON "blogs" ("author_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_blogs_status" ON "blogs" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_blogs_category" ON "blogs" ("category")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_blogs_published_at" ON "blogs" ("published_at")
    `);

    // Create blog_comments table
    await queryRunner.query(`
      CREATE TABLE "blog_comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "blog_id" uuid NOT NULL,
        "user_id" uuid,
        "guest_name" varchar(200),
        "guest_email" varchar(255),
        "content" text NOT NULL,
        "parent_comment_id" uuid,
        "is_approved" boolean NOT NULL DEFAULT false,
        "approved_by_id" uuid,
        "approved_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_blog_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_blog_comments_blog_id" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_blog_comments_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_blog_comments_parent_comment_id" FOREIGN KEY ("parent_comment_id") REFERENCES "blog_comments"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for blog_comments table
    await queryRunner.query(`
      CREATE INDEX "IDX_blog_comments_blog_id" ON "blog_comments" ("blog_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_blog_comments_user_id" ON "blog_comments" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_blog_comments_parent_comment_id" ON "blog_comments" ("parent_comment_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_blog_comments_is_approved" ON "blog_comments" ("is_approved")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes for blog_comments
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blog_comments_is_approved"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blog_comments_parent_comment_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blog_comments_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blog_comments_blog_id"`);

    // Drop blog_comments table
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_comments"`);

    // Drop indexes for blogs
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blogs_published_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blogs_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blogs_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blogs_author_id"`);

    // Drop blogs table
    await queryRunner.query(`DROP TABLE IF EXISTS "blogs"`);

    // Drop enum type
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blogs_status_enum') THEN
          DROP TYPE "blogs_status_enum";
        END IF;
      END
      $$;
    `);
  }
}

