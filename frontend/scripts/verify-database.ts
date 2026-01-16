import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function verifyDatabaseTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔄 Connecting to Neon PostgreSQL...\n');

    // Check all required tables
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user', 'session', 'account', 'verification', 'jwks')
      ORDER BY table_name;
    `);

    const requiredTables = ['account', 'jwks', 'session', 'user', 'verification'];
    const existingTables = result.rows.map(row => row.table_name);

    console.log('📊 Database Tables Status:\n');

    let allTablesExist = true;
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        allTablesExist = false;
      }
    }

    console.log('');

    if (allTablesExist) {
      console.log('✅ All required tables exist!\n');

      // Get row counts
      console.log('📈 Table Row Counts:\n');
      for (const table of requiredTables) {
        const countResult = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`   ${table}: ${countResult.rows[0].count} rows`);
      }
    } else {
      console.log('❌ Some tables are missing. Run migration script:\n');
      console.log('   cd frontend');
      console.log('   npx tsx scripts/migrate.ts\n');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check DATABASE_URL in frontend/.env.local');
    console.log('2. Verify Neon database is active at https://console.neon.tech');
    console.log('3. Ensure DATABASE_URL includes ?sslmode=require\n');
  } finally {
    await pool.end();
  }
}

verifyDatabaseTables();
