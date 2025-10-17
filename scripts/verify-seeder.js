const { Client } = require('pg');

async function verifySeeder() {
  console.log('🔍 Verifying master data...');
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'postgres',
  });

  try {
    await client.connect();
    console.log('📡 Database connected successfully');

    // Check Property Types options
    console.log('\n📋 Property Types:');
    const propertyTypesResult = await client.query(`
      SELECT name, code, description, color, sort_order 
      FROM property_types 
      WHERE is_active = true 
      ORDER BY sort_order
    `);
    
    propertyTypesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.name} (${row.code}) - ${row.description} - Color: ${row.color}`);
    });

    // Check Property Categories
    console.log('\n📋 Property Categories:');
    const categoriesResult = await client.query(`
      SELECT name, code, description, color, icon, sort_order 
      FROM property_categories 
      WHERE is_active = true 
      ORDER BY sort_order
    `);
    
    categoriesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.name} (${row.code}) - ${row.description} - Color: ${row.color} - Icon: ${row.icon}`);
    });

    console.log('\n🎉 Master data verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying master data:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySeeder();