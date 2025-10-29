const { Client } = require('pg');
require('dotenv').config();

async function addColumns() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add no_of_bedrooms column
    console.log('Adding no_of_bedrooms column...');
    await client.query(`
      ALTER TABLE "master_built_up_areas" 
      ADD COLUMN IF NOT EXISTS "no_of_bedrooms" integer;
    `);
    console.log('✓ Added no_of_bedrooms column');

    // Add balconies column
    console.log('Adding balconies column...');
    await client.query(`
      ALTER TABLE "master_built_up_areas" 
      ADD COLUMN IF NOT EXISTS "balconies" integer;
    `);
    console.log('✓ Added balconies column');

    // Mark the new migration as executed
    console.log('Marking migration as executed...');
    await client.query(`
      INSERT INTO "migrations" ("timestamp", "name") 
      VALUES (1761707646000, 'AddNoOfBedroomsAndBalconiesToBuiltUpAreas1761707646000') 
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Migration marked as executed');

    // Also mark the initial migration if not already there
    const migrationCheck = await client.query(`
      SELECT COUNT(*) FROM "migrations" WHERE "timestamp" = 1761547361260;
    `);
    
    if (parseInt(migrationCheck.rows[0].count) === 0) {
      console.log('Marking initial migration as executed...');
      await client.query(`
        INSERT INTO "migrations" ("timestamp", "name") 
        VALUES (1761547361260, 'InitialSchema1761547361260') 
        ON CONFLICT DO NOTHING;
      `);
      console.log('✓ Initial migration marked as executed');
    } else {
      console.log('Initial migration already marked as executed');
    }

    console.log('\n✅ Successfully added columns and updated migration records!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addColumns();

