const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSeeder() {
  console.log('🌱 Starting master data seeding...');
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'postgres', // Use default postgres database
  });

  try {
    await client.connect();
    console.log('📡 Database connected successfully');

    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'seed-master-data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executing SQL script...');
    const result = await client.query(sql);
    
    console.log('✅ Master data seeded successfully!');
    console.log('🎉 Seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding master data:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeeder();