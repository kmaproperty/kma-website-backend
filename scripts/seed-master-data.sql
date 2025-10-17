-- Master Data Seeding Script
-- Run this script against your PostgreSQL database

-- Create Property Types table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Create Property Categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  color VARCHAR(7),
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Insert Property Types options
INSERT INTO property_types (name, code, description, is_active, sort_order, color, created_at, updated_at)
VALUES 
  ('Sale', 'sale', 'Properties available for purchase', true, 1, '#28a745', NOW(), NOW()),
  ('Rent', 'rent', 'Properties available for rent', true, 2, '#007bff', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert Property Categories
INSERT INTO property_categories (name, code, description, is_active, sort_order, color, icon, created_at, updated_at)
VALUES 
  ('Residential', 'residential', 'Residential properties for living', true, 1, '#6f42c1', 'home', NOW(), NOW()),
  ('Commercial', 'commercial', 'Commercial properties for business', true, 2, '#fd7e14', 'business', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Verify the data was inserted
SELECT 'Property Types:' as info;
SELECT name, code, description, color FROM property_types WHERE is_active = true ORDER BY sort_order;

SELECT 'Property Categories:' as info;
SELECT name, code, description, color, icon FROM property_categories WHERE is_active = true ORDER BY sort_order;