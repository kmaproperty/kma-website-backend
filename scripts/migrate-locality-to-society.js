require('dotenv').config();
const { Client } = require('pg');

async function migrateLocalityToSociety() {
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
    
    // Step 1: Add localityName column to master_societies if it doesn't exist
    console.log('Step 1: Adding localityName column to master_societies...');
    const checkLocalityName = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'master_societies' 
      AND column_name = 'localityName';
    `);
    
    if (checkLocalityName.rows.length === 0) {
      await client.query(`
        ALTER TABLE master_societies 
        ADD COLUMN "localityName" varchar(200);
      `);
      console.log('✓ Added localityName column to master_societies');
    } else {
      console.log('✓ localityName column already exists in master_societies');
    }

    // Step 2: Update societies with locality names from master_localities table
    console.log('\nStep 2: Migrating locality data from master_localities to master_societies...');
    const updateResult = await client.query(`
      UPDATE master_societies ms
      SET "localityName" = ml.name
      FROM master_localities ml
      WHERE ms."localityId" = ml.id
      AND ms."localityName" IS NULL;
    `);
    console.log(`✓ Updated ${updateResult.rowCount} societies with locality names`);

    // Step 3: Remove localityId foreign key constraint if it exists
    console.log('\nStep 3: Removing localityId foreign key constraint...');
    try {
      await client.query(`
        ALTER TABLE master_societies 
        DROP CONSTRAINT IF EXISTS "FK_master_societies_locality";
      `);
      console.log('✓ Removed localityId foreign key constraint');
    } catch (error) {
      console.log('⚠ Foreign key constraint not found or already removed');
    }

    // Step 4: Drop localityId column from master_societies
    console.log('\nStep 4: Removing localityId column from master_societies...');
    const checkLocalityId = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'master_societies' 
      AND column_name = 'localityId';
    `);
    
    if (checkLocalityId.rows.length > 0) {
      await client.query(`
        ALTER TABLE master_societies 
        DROP COLUMN "localityId";
      `);
      console.log('✓ Removed localityId column from master_societies');
    } else {
      console.log('✓ localityId column does not exist in master_societies');
    }

    // Step 5: Remove localityId foreign key constraint from properties table if it exists
    console.log('\nStep 5: Removing localityId from properties table...');
    try {
      await client.query(`
        ALTER TABLE properties 
        DROP CONSTRAINT IF EXISTS "FK_properties_locality";
      `);
      console.log('✓ Removed localityId foreign key constraint from properties');
    } catch (error) {
      console.log('⚠ Foreign key constraint not found or already removed from properties');
    }

    // Step 6: Drop localityId column from properties table
    const checkPropLocalityId = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      AND column_name = 'localityId';
    `);
    
    if (checkPropLocalityId.rows.length > 0) {
      await client.query(`
        ALTER TABLE properties 
        DROP COLUMN "localityId";
      `);
      console.log('✓ Removed localityId column from properties');
    } else {
      console.log('✓ localityId column does not exist in properties');
    }

    // Step 7: Optional - Drop master_localities table
    console.log('\nStep 7: Dropping master_localities table...');
    const checkLocalityTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'master_localities';
    `);
    
    if (checkLocalityTable.rows.length > 0) {
      // Ask for confirmation - uncomment the following if you want to drop the table
      // await client.query(`DROP TABLE master_localities CASCADE;`);
      console.log('⚠ master_localities table still exists (not dropped for safety)');
      console.log('   You can manually drop it with: DROP TABLE master_localities CASCADE;');
      console.log('   Or uncomment the DROP TABLE command in the script if you are sure.');
    } else {
      console.log('✓ master_localities table does not exist');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNote: If you want to drop the master_localities table, uncomment the DROP TABLE command in the script.');
    
  } catch (error) {
    console.error('Error during migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateLocalityToSociety();
