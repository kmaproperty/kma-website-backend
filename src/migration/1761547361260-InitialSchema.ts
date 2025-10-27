import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Initial Schema Migration - Creates all database tables
 * 
 * This migration creates the complete database schema from scratch including:
 * - Enum types for User roles and intents
 * - User and authentication tables (users, otps, channel_partner_codes)
 * - Master data tables (cities, societies, property listing types, categories, etc.)
 * - Property-related tables (properties, unit configurations, BHK types, etc.)
 * - Contact us table
 * 
 * IMPORTANT: This migration creates all tables. Use for fresh database setup.
 */
export class InitialSchema1761547361260 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types
        await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('OWNER', 'CHANNEL_PARTNER', 'ADMIN')`);
        await queryRunner.query(`CREATE TYPE "users_intent_enum" AS ENUM('SELL', 'RENT')`);
        await queryRunner.query(`CREATE TYPE "properties_status_enum" AS ENUM('draft', 'active', 'inactive', 'sold', 'rented')`);

        // ============================================
        // User Management Tables
        // ============================================

        // Users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(255),
                "email" varchar(255),
                "phone" varchar(20) NOT NULL,
                "intent" "users_intent_enum",
                "is_active" boolean NOT NULL DEFAULT true,
                "phone_verified" boolean NOT NULL DEFAULT false,
                "role" "users_role_enum" NOT NULL DEFAULT 'OWNER',
                "token" text,
                "refresh_token" text,
                "channel_partner_code" varchar(50),
                "firm_name" varchar(255),
                "cities" varchar(500),
                "business_since" date,
                "about_yourself" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "UQ_users_phone" UNIQUE ("phone"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // OTPs table
        await queryRunner.query(`
            CREATE TABLE "otps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "phone" varchar(20) NOT NULL,
                "otp_code" varchar(6) NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                "expires_at" TIMESTAMP NOT NULL,
                "attempts" integer NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_otps" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_otps_phone_isUsed" ON "otps" ("phone", "is_used")`);

        // Channel Partner Codes table
        await queryRunner.query(`
            CREATE TABLE "channel_partner_codes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" varchar(50) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_channel_partner_codes_code" UNIQUE ("code"),
                CONSTRAINT "PK_channel_partner_codes" PRIMARY KEY ("id")
            )
        `);

        // ============================================
        // Master Data Tables
        // ============================================

        // Property Listing Types table
        await queryRunner.query(`
            CREATE TABLE "property_listing_types" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "code" varchar(50) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_property_listing_types_code" UNIQUE ("code"),
                CONSTRAINT "PK_property_listing_types" PRIMARY KEY ("id")
            )
        `);

        // Property Categories table
        await queryRunner.query(`
            CREATE TABLE "property_categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "code" varchar(50) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_property_categories_code" UNIQUE ("code"),
                CONSTRAINT "PK_property_categories" PRIMARY KEY ("id")
            )
        `);

        // Master Cities table
        await queryRunner.query(`
            CREATE TABLE "master_cities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "code" varchar(100) NOT NULL,
                "state" varchar(100),
                "latitude" numeric(10,8),
                "longitude" numeric(11,8),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_master_cities_code" UNIQUE ("code"),
                CONSTRAINT "PK_master_cities" PRIMARY KEY ("id")
            )
        `);

        // Master Societies table
        await queryRunner.query(`
            CREATE TABLE "master_societies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(300) NOT NULL,
                "cityId" uuid NOT NULL,
                "localityName" varchar(200),
                "address" varchar(500),
                "latitude" numeric(10,8),
                "longitude" numeric(11,8),
                "pincode" varchar(20),
                "isVerified" boolean NOT NULL DEFAULT false,
                "createdByUserId" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_master_societies" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "master_societies" ADD CONSTRAINT "FK_master_societies_cityId" FOREIGN KEY ("cityId") REFERENCES "master_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Master Property Types table
        await queryRunner.query(`
            CREATE TABLE "master_property_types" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "code" varchar(50) NOT NULL,
                "categoryId" uuid NOT NULL,
                "listingTypeId" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_master_property_types_code" UNIQUE ("code"),
                CONSTRAINT "PK_master_property_types" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "master_property_types" ADD CONSTRAINT "FK_master_property_types_categoryId" FOREIGN KEY ("categoryId") REFERENCES "property_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_property_types" ADD CONSTRAINT "FK_master_property_types_listingTypeId" FOREIGN KEY ("listingTypeId") REFERENCES "property_listing_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Master BHK Types table
        await queryRunner.query(`
            CREATE TABLE "master_bhk_types" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(50) NOT NULL,
                "code" varchar(50) NOT NULL,
                "sortOrder" integer NOT NULL,
                "propertyTypeId" uuid NOT NULL,
                "societyId" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_master_bhk_types" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD CONSTRAINT "FK_master_bhk_types_propertyTypeId" FOREIGN KEY ("propertyTypeId") REFERENCES "master_property_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_bhk_types" ADD CONSTRAINT "FK_d4cfa6e919b9e8d9ca71523fb55" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Master Built Up Areas table
        await queryRunner.query(`
            CREATE TABLE "master_built_up_areas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "super_built_up_area" numeric(10,2) NOT NULL,
                "carpet_area" numeric(10,2) NOT NULL,
                "no_of_bathrooms" integer NOT NULL,
                "bhk_type_id" uuid NOT NULL,
                "society_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_master_built_up_areas" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ADD CONSTRAINT "FK_master_built_up_areas_bhk_type_id" FOREIGN KEY ("bhk_type_id") REFERENCES "master_bhk_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_built_up_areas" ADD CONSTRAINT "FK_master_built_up_areas_society_id" FOREIGN KEY ("society_id") REFERENCES "master_societies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // ============================================
        // Configuration and Property Tables
        // ============================================

        // Unit Configurations table
        await queryRunner.query(`
            CREATE TABLE "unit_configurations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "societyId" uuid NOT NULL,
                "propertyTypeId" uuid NOT NULL,
                "bhkTypeId" uuid NOT NULL,
                "bathrooms" integer NOT NULL,
                "builtUpAreaSqFt" numeric(10,2) NOT NULL,
                "carpetAreaSqFt" numeric(10,2),
                "usageCount" integer NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_unit_configurations" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "unit_configurations" ADD CONSTRAINT "FK_unit_configurations_societyId" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unit_configurations" ADD CONSTRAINT "FK_unit_configurations_propertyTypeId" FOREIGN KEY ("propertyTypeId") REFERENCES "master_property_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unit_configurations" ADD CONSTRAINT "FK_unit_configurations_bhkTypeId" FOREIGN KEY ("bhkTypeId") REFERENCES "master_bhk_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Properties table
        await queryRunner.query(`
            CREATE TABLE "properties" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "listingTypeId" uuid NOT NULL,
                "categoryId" uuid NOT NULL,
                "cityId" uuid NOT NULL,
                "societyId" uuid NOT NULL,
                "propertyTypeId" uuid NOT NULL,
                "bhkTypeId" uuid NOT NULL,
                "ageOfProperty" integer NOT NULL,
                "userId" uuid NOT NULL,
                "status" "properties_status_enum" NOT NULL DEFAULT 'draft',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_properties" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_listingTypeId" FOREIGN KEY ("listingTypeId") REFERENCES "property_listing_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_categoryId" FOREIGN KEY ("categoryId") REFERENCES "property_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_cityId" FOREIGN KEY ("cityId") REFERENCES "master_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_societyId" FOREIGN KEY ("societyId") REFERENCES "master_societies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_propertyTypeId" FOREIGN KEY ("propertyTypeId") REFERENCES "master_property_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_bhkTypeId" FOREIGN KEY ("bhkTypeId") REFERENCES "master_bhk_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // ============================================
        // Contact and Support Tables
        // ============================================

        // Contact Us table
        await queryRunner.query(`
            CREATE TABLE "contact_us" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" varchar(255) NOT NULL,
                "last_name" varchar(255) NOT NULL,
                "email" varchar(255),
                "phone_number" varchar(20) NOT NULL,
                "message" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_contact_us" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order of dependencies
        await queryRunner.query(`DROP TABLE IF EXISTS "contact_us" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "properties" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "unit_configurations" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "master_built_up_areas" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "master_bhk_types" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "master_property_types" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "master_societies" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "master_cities" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "property_categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "property_listing_types" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "channel_partner_codes" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "otps" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE IF EXISTS "properties_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "users_intent_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
    }

}
