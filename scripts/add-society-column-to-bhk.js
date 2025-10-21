require('dotenv').config();
const { Client } = require('pg');

async function addSocietyColumn() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Add societyId column to master_bhk_types table
    await client.query(`
      ALTER TABLE master_bhk_types 
      ADD COLUMN IF NOT EXISTS "societyId" uuid;
    `);
    console.log('✓ Added societyId column to master_bhk_types');
    
    // Add foreign key constraint
    await client.query(`
      ALTER TABLE master_bhk_types 
      DROP CONSTRAINT IF EXISTS fk_bhk_type_society;
    `);
    
    await client.query(`
      ALTER TABLE master_bhk_types 
      ADD CONSTRAINT fk_bhk_type_society 
      FOREIGN KEY ("societyId") 
      REFERENCES master_societies(id) 
      ON DELETE CASCADE;
    `);
    console.log('✓ Added foreign key constraint to master_societies');
    
    console.log('\nDatabase schema updated successfully!');
    console.log('You can now restart your application.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addSocietyColumn();
