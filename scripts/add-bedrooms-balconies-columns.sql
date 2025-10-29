-- Script to add no_of_bedrooms and balconies columns to master_built_up_areas table
-- Run this if the migration isn't working due to existing schema

-- Add no_of_bedrooms column
ALTER TABLE "master_built_up_areas" 
ADD COLUMN IF NOT EXISTS "no_of_bedrooms" integer;

-- Add balconies column
ALTER TABLE "master_built_up_areas" 
ADD COLUMN IF NOT EXISTS "balconies" integer;

-- Optional: Mark the initial migration as executed if needed
-- INSERT INTO "migrations" ("timestamp", "name") 
-- VALUES (1761547361260, 'InitialSchema1761547361260') 
-- ON CONFLICT DO NOTHING;

-- Mark the new migration as executed
INSERT INTO "migrations" ("timestamp", "name") 
VALUES (1761707646000, 'AddNoOfBedroomsAndBalconiesToBuiltUpAreas1761707646000') 
ON CONFLICT DO NOTHING;

