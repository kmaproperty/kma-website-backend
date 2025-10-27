const { Client } = require('pg');

async function checkSchema() {
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

    // Check the current schema of the properties table
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(query);
    
    console.log('\n📋 Current properties table schema:');
    console.log('=====================================');
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(15)} | ${row.is_nullable.padEnd(3)} | ${row.column_default || 'NULL'}`);
    });
    
    // Check specifically for the problematic columns
    const problematicColumns = result.rows.filter(row => 
      ['bathrooms', 'builtUpAreaSqFt', 'carpetAreaSqFt'].includes(row.column_name)
    );
    
    if (problematicColumns.length > 0) {
      console.log('\n❌ Found columns that should have been removed:');
      problematicColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('\n✅ All problematic columns have been successfully removed!');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the check
checkSchema();
