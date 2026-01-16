import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function createJwksTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔄 Connecting to Neon PostgreSQL...');

    // Create JWKS table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "jwks" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        "publicKey" TEXT NOT NULL,
        "privateKey" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "expiresAt" TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_jwks_createdAt ON "jwks"("createdAt");
    `;

    console.log('📝 Creating jwks table...');
    await pool.query(createTableSQL);

    console.log('✅ JWKS table created successfully!');

    // Verify table exists
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'jwks';
    `);

    if (result.rows.length > 0) {
      console.log('✓ Verified: jwks table exists in database');
    } else {
      console.error('❌ Error: jwks table was not created');
    }

  } catch (error) {
    console.error('❌ Failed to create jwks table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createJwksTable();
