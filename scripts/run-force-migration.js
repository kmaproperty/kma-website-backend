const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runForceMigration() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'kma',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASS || 'password',
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read the force migration SQL file
    const migrationPath = path.join(__dirname, 'force-remove-property-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running FORCE migration: Remove derived fields from properties table');
    console.log('This will FORCE remove: bathrooms, builtUpAreaSqFt, carpetAreaSqFt, customBhk columns');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Force migration completed successfully!');
    console.log('The following columns have been FORCE removed from the properties table:');
    console.log('- bathrooms');
    console.log('- builtUpAreaSqFt');
    console.log('- carpetAreaSqFt');
    console.log('- customBhk');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify the columns are removed');
    console.log('2. Test the API to ensure it works');

  } catch (error) {
    console.error('❌ Force migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the force migration
runForceMigration();
