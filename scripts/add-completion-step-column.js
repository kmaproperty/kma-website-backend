const { Client } = require('pg');
require('dotenv').config();

async function addCompletionStepColumn() {
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

    // Add completion_step column
    console.log('Adding completion_step column...');
    await client.query(`
      ALTER TABLE "properties" 
      ADD COLUMN IF NOT EXISTS "completion_step" integer NOT NULL DEFAULT 0;
    `);
    console.log('✓ Added completion_step column');

    // Add comment
    console.log('Adding column comment...');
    await client.query(`
      COMMENT ON COLUMN "properties"."completion_step" IS 
      'Current completion step (0=not started, 1-4=in progress, 5=completed)';
    `).catch(err => {
      // Comment might fail in some DB setups, that's okay
      console.log('Note: Could not add comment (this is optional)');
    });

    // Mark the migration as executed
    console.log('Marking migration as executed...');
    await client.query(`
      INSERT INTO "migrations" ("timestamp", "name") 
      VALUES (1761708000000, 'AddCompletionStepToProperties1761708000000') 
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Migration marked as executed');

    console.log('\n✅ Successfully added completion_step column!');
    console.log('\nCurrent step values:');
    console.log('  0 = Not started');
    console.log('  1 = Step 1 completed (Basic details)');
    console.log('  2 = Step 2 completed (Additional details)');
    console.log('  3 = Step 3 completed (Media/Photos)');
    console.log('  4 = Step 4 completed (Review)');
    console.log('  5 = All steps completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addCompletionStepColumn();

