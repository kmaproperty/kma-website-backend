const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
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

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'remove-property-derived-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: Remove derived fields from properties table');
    console.log('This will remove: bathrooms, builtUpAreaSqFt, carpetAreaSqFt columns');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('The following columns have been removed from the properties table:');
    console.log('- bathrooms');
    console.log('- builtUpAreaSqFt');
    console.log('- carpetAreaSqFt');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update the Property entity to remove these fields');
    console.log('2. Update the service to not pass these fields');
    console.log('3. Access BHK data through relationships instead');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the migration
runMigration();
