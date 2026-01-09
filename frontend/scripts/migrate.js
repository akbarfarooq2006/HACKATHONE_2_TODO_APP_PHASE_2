const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔄 Connecting to Neon PostgreSQL...');
    console.log('📍 Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown');

    const schemaPath = path.join(__dirname, '..', '..', 'schema-fixed.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing database schema (dropping old tables and creating new ones)...');
    await pool.query(schema);

    console.log('✅ Database tables created successfully!');
    console.log('   - user');
    console.log('   - session');
    console.log('   - account');
    console.log('   - verification');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user', 'session', 'account', 'verification')
      ORDER BY table_name;
    `);

    console.log('\n📊 Verified tables in database:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now sign up users at http://localhost:3000/sign-up');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
