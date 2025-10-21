require('dotenv').config();
const { Client } = require('pg');

async function clearBhkTypes() {
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
    
    // Delete built-up areas first (they depend on BHK types)
    const buaResult = await client.query('DELETE FROM master_built_up_areas;');
    console.log(`✓ Deleted ${buaResult.rowCount} built-up area records`);
    
    // Then delete BHK types
    const bhkResult = await client.query('DELETE FROM master_bhk_types;');
    console.log(`✓ Deleted ${bhkResult.rowCount} BHK type records`);
    
    console.log('\nDatabase cleared successfully. BHK types will now be society-specific.');
    console.log('You can now restart your application.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearBhkTypes();
