const { Client } = require('pg');

async function manualDropColumns() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'kma-property.c3iw480swp76.ap-south-1.rds.amazonaws.com',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'kmaproperty',
    password: process.env.POSTGRES_PASS || 'kmaproperty',
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : true,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Check if columns exist first
    console.log('Checking if columns exist...');
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      AND column_name IN ('bathrooms', 'builtUpAreaSqFt', 'carpetAreaSqFt', 'customBhk');
    `;
    
    const existingColumns = await client.query(checkQuery);
    console.log('Existing columns to remove:', existingColumns.rows.map(r => r.column_name));

    if (existingColumns.rows.length === 0) {
      console.log('✅ All columns have already been removed!');
      return;
    }

    // Drop columns one by one
    const columnsToDrop = existingColumns.rows.map(r => r.column_name);
    
    for (const column of columnsToDrop) {
      try {
        console.log(`Dropping column: ${column}`);
        await client.query(`ALTER TABLE properties DROP COLUMN "${column}" CASCADE;`);
        console.log(`✅ Successfully dropped column: ${column}`);
      } catch (error) {
        console.log(`❌ Failed to drop column ${column}:`, error.message);
      }
    }

    // Verify the columns are gone
    console.log('\nVerifying columns are removed...');
    const finalCheck = await client.query(checkQuery);
    if (finalCheck.rows.length === 0) {
      console.log('✅ All columns successfully removed!');
    } else {
      console.log('❌ Some columns still exist:', finalCheck.rows.map(r => r.column_name));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the manual drop
manualDropColumns();
