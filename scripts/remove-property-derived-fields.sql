-- Migration: Remove derived fields from properties table
-- These fields are now stored in the BHK and built-up area entities
-- Date: 2024-01-XX
-- Description: Remove bathrooms, builtUpAreaSqFt, and carpetAreaSqFt columns from properties table

-- Step 1: Drop the columns from the properties table
ALTER TABLE properties 
DROP COLUMN IF EXISTS bathrooms,
DROP COLUMN IF EXISTS builtUpAreaSqFt,
DROP COLUMN IF EXISTS carpetAreaSqFt;

-- Step 2: Verify the changes
-- You can run this query to verify the columns are removed:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'properties' 
-- AND column_name IN ('bathrooms', 'builtUpAreaSqFt', 'carpetAreaSqFt');

-- Note: This migration removes the following columns:
-- - bathrooms (int) - now derived from BHK relationship
-- - builtUpAreaSqFt (decimal) - now stored in MasterBuiltUpArea entity
-- - carpetAreaSqFt (decimal) - now stored in MasterBuiltUpArea entity
--
-- The data is still accessible through:
-- - property.bhkType.builtUpAreaSqFt
-- - property.bhkType.carpetAreaSqFt  
-- - property.bhkType.noOfBathrooms
