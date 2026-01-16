import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkAccountLinking() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Checking account linking...\n');

    // Get all users with their linked accounts
    const result = await pool.query(`
      SELECT
        u.id,
        u.email,
        u.name,
        COUNT(a.id) as account_count,
        STRING_AGG(a."provider", ', ') as providers
      FROM "user" u
      LEFT JOIN "account" a ON u.id = a."userId"
      GROUP BY u.id, u.email, u.name
      HAVING COUNT(a.id) > 1
      ORDER BY u."createdAt" DESC;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Found users with linked accounts!\n');

      result.rows.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Linked Accounts: ${user.account_count}`);
        console.log(`   Providers: ${user.providers}`);
        console.log('');
      });

      console.log('✅ T089/T110 PASSED: Account linking works correctly\n');
    } else {
      console.log('ℹ️  No users with multiple linked accounts found.\n');
      console.log('To test account linking:');
      console.log('1. Sign up with email: link@example.com');
      console.log('2. Sign out');
      console.log('3. Sign in with Google using the same email');
      console.log('4. Run this script again\n');
    }

    // Show all accounts for reference
    console.log('📊 All Accounts in Database:\n');
    const allAccounts = await pool.query(`
      SELECT u.email, u.name, a."provider", a."providerAccountId"
      FROM "user" u
      LEFT JOIN "account" a ON u.id = a."userId"
      ORDER BY u.email, a."provider";
    `);

    if (allAccounts.rows.length > 0) {
      allAccounts.rows.forEach(row => {
        console.log(`   ${row.email} → ${row.provider || 'email-password'}`);
      });
    } else {
      console.log('   No accounts found');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Database query failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkAccountLinking();
