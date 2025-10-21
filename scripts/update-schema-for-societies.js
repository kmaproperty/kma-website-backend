require('dotenv').config();
const { Client } = require('pg');

async function updateSchema() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
  });

  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // Check if societyId already exists in master_built_up_areas
    const checkBuiltUpAreas = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'master_built_up_areas' 
      AND column_name = 'society_id';
    `);
    
    if (checkBuiltUpAreas.rows.length === 0) {
      // Add societyId column to master_built_up_areas table
      await client.query(`
        ALTER TABLE master_built_up_areas 
        ADD COLUMN "society_id" uuid;
      `);
      console.log('✓ Added society_id column to master_built_up_areas');
      
      // Add foreign key constraint
      await client.query(`
        ALTER TABLE master_built_up_areas 
        ADD CONSTRAINT fk_built_up_area_society 
        FOREIGN KEY ("society_id") 
        REFERENCES master_societies(id) 
        ON DELETE CASCADE;
      `);
      console.log('✓ Added foreign key constraint to master_societies');
    } else {
      console.log('✓ society_id column already exists in master_built_up_areas');
    }
    
    console.log('\n✅ Database schema is up to date!');
    console.log('You can now restart your application and seed the data.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateSchema();
