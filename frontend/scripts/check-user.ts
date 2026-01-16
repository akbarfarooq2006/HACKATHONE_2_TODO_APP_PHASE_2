import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Checking for test user in database...\n');

    const result = await pool.query(`
      SELECT id, email, name, "emailVerified", "createdAt"
      FROM "user"
      WHERE email = 'test@example.com'
      ORDER BY "createdAt" DESC
      LIMIT 1;
    `);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ User found in database!\n');
      console.log('User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Created At: ${user.createdAt}`);
      console.log('\n✅ T087 PASSED: User record exists in database\n');
    } else {
      console.log('❌ User NOT found in database\n');
      console.log('This means sign-up did not complete successfully.');
      console.log('Check the frontend terminal for errors.\n');
    }

  } catch (error) {
    console.error('❌ Database query failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
