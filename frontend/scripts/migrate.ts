import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔄 Connecting to Neon PostgreSQL...');

    const schemaPath = path.join(process.cwd(), '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing database schema...');
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

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
