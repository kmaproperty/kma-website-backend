const { Client } = require('pg');
require('dotenv').config();

async function addFacingColumn() {
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

    // Add facing column
    console.log('Adding facing column...');
    await client.query(`
      ALTER TABLE "properties" 
      ADD COLUMN IF NOT EXISTS "facing" varchar(50) NULL;
    `);
    console.log('✓ Added facing column');

    // Mark the migration as executed
    console.log('Marking migration as executed...');
    await client.query(`
      INSERT INTO "migrations" ("timestamp", "name") 
      VALUES (1761710000000, 'AddFacingToProperties1761710000000') 
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Migration marked as executed');

    console.log('\n✅ Successfully added facing column!');
    console.log('\nThe facing field can store property direction (e.g., North, South, East, West, North-East, etc.)');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addFacingColumn();

