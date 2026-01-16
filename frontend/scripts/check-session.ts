import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkSession() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Checking for active session in database...\n');

    const result = await pool.query(`
      SELECT s.id, s."userId", s."expiresAt", s."ipAddress", s."createdAt", u.email, u.name
      FROM "session" s
      JOIN "user" u ON s."userId" = u.id
      WHERE u.email = 'test@example.com'
      AND s."expiresAt" > NOW()
      ORDER BY s."createdAt" DESC
      LIMIT 1;
    `);

    if (result.rows.length > 0) {
      const session = result.rows[0];
      console.log('✅ Active session found in database!\n');
      console.log('Session Details:');
      console.log(`   Session ID: ${session.id}`);
      console.log(`   User: ${session.name} (${session.email})`);
      console.log(`   User ID: ${session.userId}`);
      console.log(`   IP Address: ${session.ipAddress || 'Not recorded'}`);
      console.log(`   Created At: ${session.createdAt}`);
      console.log(`   Expires At: ${session.expiresAt}`);

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const daysRemaining = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));
      console.log(`   Days Remaining: ${daysRemaining} days`);

      console.log('\n✅ T088 PASSED: Session record exists in database\n');
    } else {
      console.log('❌ No active session found in database\n');
      console.log('This means sign-in did not create a session.');
      console.log('Check the frontend terminal for errors.\n');
    }

  } catch (error) {
    console.error('❌ Database query failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkSession();
