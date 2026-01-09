# Skill: Debug Better Auth

**Name:** `debug_better_auth`
**Purpose:** Diagnose and fix common Better Auth integration issues
**Created:** 2026-01-09
**Based on:** Real implementation experience with Better Auth + Neon PostgreSQL

---

## When to Use This Skill

Invoke this skill when encountering:
- Better Auth initialization errors
- Database connection failures
- OAuth redirect errors
- Schema/migration issues
- Session or authentication failures

---

## Common Issues & Solutions

### 1. Database Adapter Initialization Failure

**Error Pattern:**
```
[BetterAuthError]: Failed to initialize database adapter
```

**Diagnosis:**
- Check if database configuration is correct
- Verify Pool instance is passed directly to Better Auth

**Solution:**
```typescript
// ❌ WRONG - Don't wrap in object
database: {
  provider: "pg",
  pool,
}

// ✅ CORRECT - Pass Pool directly
database: pool,
```

**Fix Steps:**
1. Open `frontend/lib/auth.ts`
2. Change `database: { provider: "pg", pool }` to `database: pool`
3. Restart dev server

---

### 2. Missing Database Tables

**Error Pattern:**
```
ERROR: relation "user" does not exist
ERROR: relation "session" does not exist
ERROR: relation "account" does not exist
```

**Diagnosis:**
- Database tables haven't been created
- Better Auth requires manual schema creation

**Solution:**
Run the migration script to create tables.

**Fix Steps:**

1. **Create migration script** (`frontend/scripts/migrate.js`):
```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔄 Connecting to database...');
    const schemaPath = path.join(__dirname, '..', '..', 'schema-fixed.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing schema...');
    await pool.query(schema);

    console.log('✅ Tables created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
```

2. **Create schema file** (`schema-fixed.sql`):
```sql
-- Drop existing tables
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- User table
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    name TEXT,
    image TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "user"(email);

-- Session table
CREATE TABLE "session" (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP NOT NULL,
    token TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_userId ON "session"("userId");
CREATE INDEX idx_session_token ON "session"(token);

-- Account table
CREATE TABLE "account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    "scope" TEXT,
    password TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_userId ON "account"("userId");

-- Verification table
CREATE TABLE "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
);

CREATE INDEX idx_verification_identifier ON "verification"(identifier);
```

3. **Install dotenv** (if not already installed):
```bash
npm install dotenv
```

4. **Run migration**:
```bash
node frontend/scripts/migrate.js
```

5. **Verify tables created**:
Check your database dashboard or run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification');
```

---

### 3. Schema Column Mismatch

**Error Pattern:**
```
ERROR: column "accountId" of relation "account" does not exist
ERROR: column "providerId" does not exist
```

**Diagnosis:**
- Schema doesn't match Better Auth's expected column names
- Old schema used different naming conventions

**Critical Column Names:**
- ✅ `accountId` (not `providerAccountId`)
- ✅ `providerId` (not `provider`)
- ✅ `userId` (consistent across all tables)

**Solution:**
Drop and recreate tables with correct schema (see schema-fixed.sql above).

**Fix Steps:**
1. Use the `schema-fixed.sql` from Issue #2
2. Run migration script: `node frontend/scripts/migrate.js`
3. Verify column names in database

---

### 4. Google OAuth Redirect URI Mismatch

**Error Pattern:**
```
Error 400: redirect_uri_mismatch
```

**Diagnosis:**
- Redirect URI in Google Cloud Console doesn't match Better Auth's callback URL
- Better Auth uses: `{baseURL}/api/auth/callback/{provider}`

**Solution:**
Add correct redirect URI to Google Cloud Console.

**Fix Steps:**

1. **Identify the callback URL:**
   - Format: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

2. **Update Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Find your OAuth 2.0 Client ID
   - Click to edit
   - Under "Authorized redirect URIs", add:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "SAVE"
   - Wait 1-2 minutes for changes to propagate

3. **Verify in DevTools:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click "Sign in with Google"
   - Check the `redirect_uri` parameter in the OAuth request

---

### 5. Environment Variables Not Loaded

**Error Pattern:**
```
TypeError: Cannot read property 'DATABASE_URL' of undefined
process.env.GOOGLE_CLIENT_ID is undefined
```

**Diagnosis:**
- Environment variables not loaded properly
- Wrong .env file location or naming

**Solution:**
Verify environment variable configuration.

**Fix Steps:**

1. **Check file location:**
   - Frontend: `frontend/.env.local` (not `.env`)
   - Backend: `backend/.env`

2. **Verify required variables:**

**Frontend `.env.local`:**
```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Backend `.env`:**
```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
BETTER_AUTH_SECRET="your-secret-here"
```

3. **Restart dev server** after changing .env files

4. **Verify loading:**
```javascript
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? '✓ Loaded' : '✗ Missing');
```

---

### 6. Session Not Persisting

**Error Pattern:**
- User gets logged out on page refresh
- Session doesn't persist across browser restarts

**Diagnosis:**
- httpOnly cookies not set correctly
- Session configuration issues
- CORS or domain mismatch

**Solution:**
Verify session configuration and cookie settings.

**Fix Steps:**

1. **Check Better Auth session config:**
```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // Update every 24 hours
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5, // 5 minutes
  },
},
```

2. **Verify cookie settings:**
```typescript
advanced: {
  cookiePrefix: "better-auth",
  useSecureCookies: process.env.NODE_ENV === "production",
  crossSubDomainCookies: {
    enabled: false,
  },
},
```

3. **Check cookies in browser:**
   - Open DevTools (F12)
   - Go to Application/Storage → Cookies
   - Look for `better-auth.session_token`
   - Verify `HttpOnly` flag is set

4. **Verify baseURL matches:**
```typescript
baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
```

---

## Quick Diagnostic Checklist

Run through this checklist when debugging Better Auth issues:

### Database Connection
- [ ] Database URL is correct and accessible
- [ ] SSL configuration is correct for your database provider
- [ ] Pool instance is passed directly to Better Auth config
- [ ] All required tables exist (user, session, account, verification)
- [ ] Column names match Better Auth's expectations

### Environment Variables
- [ ] `.env.local` exists in frontend directory
- [ ] All required variables are set (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
- [ ] NEXT_PUBLIC_ prefix used for client-side variables
- [ ] Dev server restarted after .env changes

### OAuth Configuration
- [ ] Google OAuth credentials are correct
- [ ] Redirect URIs are configured in Google Cloud Console
- [ ] Callback URL format: `{baseURL}/api/auth/callback/{provider}`
- [ ] Changes in Google Console have propagated (wait 1-2 minutes)

### Better Auth Setup
- [ ] API route handler exists at `app/api/auth/[...all]/route.ts`
- [ ] Auth client created with correct baseURL
- [ ] Session configuration is correct
- [ ] Cookie settings are appropriate for environment

### Frontend Integration
- [ ] Auth client hooks imported correctly
- [ ] Sign-up/sign-in forms use correct Better Auth methods
- [ ] Protected routes check authentication status
- [ ] Redirects configured properly

---

## Prevention Tips

### 1. Use Migration Scripts
Always create and version control migration scripts for database schema changes.

### 2. Document OAuth Setup
Keep a README with OAuth provider setup instructions and callback URLs.

### 3. Environment Variable Template
Maintain `.env.example` files with all required variables (without sensitive values).

### 4. Test Authentication Flow
After setup, test complete flow:
1. Sign up with email/password
2. Sign out
3. Sign in again
4. Refresh page (verify session persists)
5. Test OAuth providers
6. Test protected routes

### 5. Monitor Better Auth Updates
Better Auth schema requirements may change between versions. Check migration guides when upgrading.

---

## Verification Commands

### Check Database Tables
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification')
ORDER BY table_name, ordinal_position;
```

### Test Database Connection
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? '❌ Connection failed' : '✅ Connected');
  pool.end();
});
```

### Verify Environment Variables
```bash
# In frontend directory
node -e "require('dotenv').config({path:'.env.local'}); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓' : '✗'); console.log('BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? '✓' : '✗');"
```

---

## Common Error Messages Reference

| Error Message | Issue | Solution |
|--------------|-------|----------|
| `Failed to initialize database adapter` | Wrong database config format | Pass Pool directly, not wrapped in object |
| `relation "user" does not exist` | Tables not created | Run migration script |
| `column "accountId" does not exist` | Schema mismatch | Use correct schema with proper column names |
| `redirect_uri_mismatch` | OAuth config issue | Add callback URL to Google Cloud Console |
| `Cannot read property 'DATABASE_URL'` | Env vars not loaded | Check .env.local location and restart server |
| `Session not found` | Session config issue | Verify session settings and cookies |

---

## Success Indicators

You know Better Auth is working correctly when:

✅ Sign-up creates user in database
✅ Sign-in redirects to dashboard
✅ Session persists across page refreshes
✅ Protected routes redirect unauthenticated users
✅ Sign-out clears session and redirects
✅ OAuth providers work without errors
✅ httpOnly cookies are set correctly
✅ No errors in browser console or server logs

---

## Additional Resources

- **Better Auth Docs:** https://www.better-auth.com/docs
- **Better Auth GitHub:** https://github.com/better-auth/better-auth
- **Neon PostgreSQL Docs:** https://neon.tech/docs
- **Google OAuth Setup:** https://console.cloud.google.com/apis/credentials

---

## Skill Invocation

To use this skill in future projects:

```bash
/debug_better_auth
```

Or invoke specific sections:
```bash
/debug_better_auth --issue="database-adapter"
/debug_better_auth --issue="oauth-redirect"
/debug_better_auth --issue="schema-mismatch"
```

---

**Last Updated:** 2026-01-09
**Tested With:** Better Auth (latest), Next.js 16, Neon PostgreSQL
**Status:** Production-ready
