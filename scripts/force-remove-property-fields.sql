-- Force migration: Remove derived fields from properties table
-- These fields are now stored in the BHK and built-up area entities
-- Date: 2024-01-XX
-- Description: Force remove bathrooms, builtUpAreaSqFt, and carpetAreaSqFt columns from properties table

-- Step 1: Drop the columns from the properties table (force drop)
ALTER TABLE properties DROP COLUMN IF EXISTS bathrooms CASCADE;
ALTER TABLE properties DROP COLUMN IF EXISTS builtUpAreaSqFt CASCADE;
ALTER TABLE properties DROP COLUMN IF EXISTS carpetAreaSqFt CASCADE;

-- Step 2: Also remove customBhk if it exists (this was also removed from entity)
ALTER TABLE properties DROP COLUMN IF EXISTS customBhk CASCADE;

-- Step 3: Verify the changes
-- You can run this query to verify the columns are removed:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'properties' 
-- AND column_name IN ('bathrooms', 'builtUpAreaSqFt', 'carpetAreaSqFt', 'customBhk');

-- Note: This migration removes the following columns:
-- - bathrooms (int) - now derived from BHK relationship
-- - builtUpAreaSqFt (decimal) - now stored in MasterBuiltUpArea entity
-- - carpetAreaSqFt (decimal) - now stored in MasterBuiltUpArea entity
-- - customBhk (varchar) - no longer needed
--
-- The data is still accessible through:
-- - property.bhkType.builtUpArea.superBuiltUpArea
-- - property.bhkType.builtUpArea.carpetArea  
-- - property.bhkType.builtUpArea.noOfBathrooms
