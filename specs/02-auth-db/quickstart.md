# Quickstart Guide: Authentication System

**Feature**: Authentication System and Database Connectivity
**Branch**: `02-auth-db`
**Date**: 2026-01-09
**Estimated Setup Time**: 30-45 minutes

## Overview

This guide walks you through setting up the authentication system with Better Auth (frontend) and FastAPI (backend) connected to a shared Neon PostgreSQL database. Follow these steps in order to get the system running locally.

---

## Prerequisites

Before starting, ensure you have the following installed and configured:

### Required Software

- **Node.js**: v18.0.0 or higher (v24.12.0 recommended)
  ```bash
  node --version  # Should show v18+ or v24+
  ```

- **npm**: v8.0.0 or higher (v11.6.2 recommended)
  ```bash
  npm --version  # Should show v8+ or v11+
  ```

- **Python**: v3.11 or higher (v3.12.3 recommended)
  ```bash
  python --version  # Should show Python 3.11+ or 3.12+
  ```

- **uv**: v0.9.0 or higher (Python package manager)
  ```bash
  uv --version  # Should show 0.9+ or install with: pip install uv
  ```

### Required Accounts

- **Neon PostgreSQL**: Create a free account at [neon.tech](https://neon.tech)
  - Create a new project
  - Copy the connection string (starts with `postgresql://`)

- **Google Cloud Console**: Set up OAuth credentials
  - Go to [console.cloud.google.com](https://console.cloud.google.com)
  - Create a new project or select existing
  - Enable Google+ API
  - Create OAuth 2.0 credentials (Web application)
  - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
  - Copy Client ID and Client Secret

---

## Step 1: Environment Setup

### 1.1 Generate Shared Secret

Generate a secure random secret for JWT signing/verification:

```bash
openssl rand -base64 32
```

**Output example**: `dGhpc2lzYXNlY3JldGtleWZvcmp3dHRva2Vucw==`

**Important**: Copy this value - you'll need it for both frontend and backend.

### 1.2 Configure Frontend Environment

Create `.env.local` in the `frontend/` directory:

```bash
cd frontend
touch .env.local
```

Add the following variables (replace placeholders with your actual values):

```bash
# Database Connection (from Neon)
DATABASE_URL="postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_SECRET="dGhpc2lzYXNlY3JldGtleWZvcmp3dHRva2Vucw=="  # From Step 1.1
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwx"
```

**Verification**:
```bash
cat .env.local  # Should show all 5 variables
```

### 1.3 Configure Backend Environment

Create `.env` in the `backend/` directory:

```bash
cd ../backend
touch .env
```

Add the following variables (use **same values** as frontend):

```bash
# Database Connection (MUST match frontend)
DATABASE_URL="postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Better Auth Secret (MUST match frontend)
BETTER_AUTH_SECRET="dGhpc2lzYXNlY3JldGtleWZvcmp3dHRva2Vucw=="
```

**Critical**: `DATABASE_URL` and `BETTER_AUTH_SECRET` **must be identical** in both frontend and backend.

**Verification**:
```bash
cat .env  # Should show both variables
```

---

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd frontend
npm install
```

**Expected output**: Installation of ~357 packages including Next.js, React, Better Auth, etc.

### 2.2 Install Better Auth

```bash
npm install better-auth pg
```

**Packages installed**:
- `better-auth`: Authentication library
- `pg`: PostgreSQL client for database connection

### 2.3 Verify Installation

```bash
npm list better-auth pg
```

**Expected output**:
```
├── better-auth@x.x.x
└── pg@x.x.x
```

### 2.4 Start Frontend Development Server

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Ready in 2.5s
```

**Verification**:
- Open browser to `http://localhost:3000`
- Should see "Phase 2 Todo App" landing page
- No errors in terminal

**Important**: On first run, Better Auth will automatically create database tables (user, session, account, verification) in Neon. This may take 5-10 seconds.

### 2.5 Verify Database Tables Created

**Option 1: Neon Console**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Go to "Tables" tab
4. Should see 4 tables: `user`, `session`, `account`, `verification`

**Option 2: SQL Query**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected result**: 4 tables listed

---

## Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd ../backend
uv sync
```

**Expected output**: Installation of ~16 packages including FastAPI, SQLModel, uvicorn, etc.

### 3.2 Install JWT Dependencies

```bash
uv add "python-jose[cryptography]" passlib
```

**Packages installed**:
- `python-jose[cryptography]`: JWT encoding/decoding
- `passlib`: Password hashing (future use)

### 3.3 Verify Installation

```bash
uv pip list | grep -E "fastapi|sqlmodel|jose|passlib"
```

**Expected output**:
```
fastapi                 0.128.0
sqlmodel                0.0.31
python-jose             3.x.x
passlib                 1.x.x
```

### 3.4 Start Backend Development Server

```bash
uv run uvicorn app.main:app --reload --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verification**:
- Open browser to `http://localhost:8000/api/v1/health`
- Should see: `{"status": "healthy"}`
- No errors in terminal

---

## Step 4: End-to-End Verification

### 4.1 Sign Up New User

1. **Open frontend**: `http://localhost:3000`
2. **Navigate to sign-up page**: Click "Sign Up" link
3. **Fill form**:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@# (meets complexity requirements)
4. **Submit form**
5. **Expected result**: Redirected to dashboard showing "Welcome, Test User"

**Troubleshooting**:
- If password rejected: Ensure it has 8+ chars, uppercase, lowercase, number, special char
- If database error: Check DATABASE_URL is correct in frontend/.env.local
- If page doesn't redirect: Check browser console for errors

### 4.2 Verify User in Database

**Neon Console**:
```sql
SELECT id, email, name, "emailVerified", "createdAt"
FROM "user"
WHERE email = 'test@example.com';
```

**Expected result**: One row with user data

### 4.3 Sign In with Existing User

1. **Sign out**: Click user menu → "Sign Out"
2. **Navigate to sign-in page**: Click "Sign In" link
3. **Fill form**:
   - Email: test@example.com
   - Password: Test123!@#
4. **Submit form**
5. **Expected result**: Redirected to dashboard

### 4.4 Extract JWT Token

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to "Application" tab
3. Expand "Cookies" → `http://localhost:3000`
4. Find cookie named `better-auth.session_token` or similar
5. Copy the value (JWT token)

**Alternative - Network Tab**:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Sign in again
4. Find request to `/api/auth/sign-in`
5. Check "Response Headers" for `Set-Cookie`
6. Copy JWT token value

### 4.5 Test Backend Token Verification

**Using curl**:
```bash
curl -X GET http://localhost:8000/api/v1/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected response (200 OK)**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "name": "Test User",
  "status": "authenticated"
}
```

**Test invalid token**:
```bash
curl -X GET http://localhost:8000/api/v1/me \
  -H "Authorization: Bearer invalid_token"
```

**Expected response (401 Unauthorized)**:
```json
{
  "detail": "Could not validate credentials"
}
```

**Test missing token**:
```bash
curl -X GET http://localhost:8000/api/v1/me
```

**Expected response (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

### 4.6 Test Google OAuth (Optional)

1. **Navigate to sign-in page**: `http://localhost:3000/sign-in`
2. **Click "Sign in with Google"**
3. **Expected**: Redirected to Google OAuth consent screen
4. **Select Google account**
5. **Grant permissions**
6. **Expected result**: Redirected back to dashboard

**Troubleshooting**:
- If redirect fails: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in frontend/.env.local
- If "redirect_uri_mismatch" error: Add `http://localhost:3000/api/auth/callback/google` to Google Cloud Console authorized redirect URIs

### 4.7 Test Account Linking

1. **Sign up with email/password**: user@example.com
2. **Sign out**
3. **Sign in with Google OAuth**: Use same email (user@example.com)
4. **Expected result**: Accounts automatically linked, single user record in database

**Verify in database**:
```sql
SELECT u.id, u.email, a.provider
FROM "user" u
LEFT JOIN account a ON u.id = a."userId"
WHERE u.email = 'user@example.com';
```

**Expected result**: One user with two accounts (email-password and google)

---

## Step 5: Verification Checklist

Use this checklist to confirm everything is working:

### Frontend
- [ ] Frontend server running on `http://localhost:3000`
- [ ] Sign-up page accessible at `/sign-up`
- [ ] Sign-in page accessible at `/sign-in`
- [ ] Dashboard page accessible at `/dashboard` (when authenticated)
- [ ] User can sign up with email/password
- [ ] User can sign in with email/password
- [ ] User can sign in with Google OAuth
- [ ] User menu displays with sign-out option
- [ ] Sign-out redirects to sign-in page
- [ ] Session persists across page refreshes

### Backend
- [ ] Backend server running on `http://localhost:8000`
- [ ] Health endpoint returns 200 OK at `/api/v1/health`
- [ ] `/api/v1/me` returns user data with valid token
- [ ] `/api/v1/me` returns 401 with invalid token
- [ ] `/api/v1/me` returns 401 with missing token
- [ ] Backend logs show successful database connection

### Database
- [ ] Four tables exist: user, session, account, verification
- [ ] User records created on sign-up
- [ ] Session records created on sign-in
- [ ] Account records created on OAuth sign-in
- [ ] Account linking works (same email, different providers)

### Integration
- [ ] Frontend issues JWT tokens on sign-in
- [ ] Backend verifies JWT tokens successfully
- [ ] User ID from token matches database record
- [ ] End-to-end flow works: Sign up → Sign in → API call → Success

---

## Troubleshooting

### Issue: "DATABASE_URL is required" error

**Cause**: Environment variable not set or .env file not loaded

**Solution**:
1. Verify `.env.local` (frontend) and `.env` (backend) files exist
2. Check variable names are exactly `DATABASE_URL` (case-sensitive)
3. Restart development servers after adding variables

### Issue: "Could not validate credentials" on backend

**Cause**: Token secret mismatch between frontend and backend

**Solution**:
1. Verify `BETTER_AUTH_SECRET` is **identical** in both .env files
2. Check for extra spaces or quotes in secret value
3. Regenerate secret with `openssl rand -base64 32` and update both files
4. Restart both servers

### Issue: "Connection refused" to database

**Cause**: Invalid DATABASE_URL or Neon database not accessible

**Solution**:
1. Verify DATABASE_URL format: `postgresql://user:password@host/database?sslmode=require`
2. Check Neon database is active (not paused)
3. Test connection with `psql` or database client
4. Verify SSL mode is set to `require`

### Issue: Password validation fails

**Cause**: Password doesn't meet complexity requirements

**Solution**:
Password must have:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Example valid password**: `Test123!@#`

### Issue: Google OAuth "redirect_uri_mismatch"

**Cause**: Redirect URI not configured in Google Cloud Console

**Solution**:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your project → APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs": `http://localhost:3000/api/auth/callback/google`
5. Save and wait 5 minutes for changes to propagate

### Issue: Tables not created in Neon

**Cause**: Better Auth didn't run table creation on first startup

**Solution**:
1. Verify DATABASE_URL is correct in frontend/.env.local
2. Stop frontend server (Ctrl+C)
3. Delete `.next` directory: `rm -rf .next`
4. Restart frontend: `npm run dev`
5. Wait 10 seconds for table creation
6. Check Neon console for tables

### Issue: CORS errors in browser console

**Cause**: Backend CORS not configured for frontend origin

**Solution**:
1. Verify backend `app/main.py` has CORS middleware
2. Check allowed origins includes `http://localhost:3000`
3. Restart backend server

### Issue: Session doesn't persist across page refreshes

**Cause**: Cookies not being set or httpOnly cookie issue

**Solution**:
1. Check browser DevTools → Application → Cookies
2. Verify `better-auth.session_token` cookie exists
3. Check cookie has `HttpOnly` flag set
4. Clear all cookies and sign in again

---

## Next Steps

After completing this quickstart:

1. **Review Implementation Plan**: See `plan.md` for detailed architecture
2. **Generate Tasks**: Run `/sp.tasks` to create implementation tasks
3. **Start Implementation**: Follow layered approach (Database → Frontend → Backend)
4. **Run Tests**: Verify each layer before proceeding to next

---

## Quick Reference

### Start Development Servers

**Frontend**:
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Backend**:
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
# Runs on http://localhost:8000
```

### Environment Variables

**Frontend (.env.local)**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Shared JWT secret (32+ chars)
- `BETTER_AUTH_URL`: Frontend URL (http://localhost:3000)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

**Backend (.env)**:
- `DATABASE_URL`: Same as frontend
- `BETTER_AUTH_SECRET`: Same as frontend

### Key Endpoints

**Frontend**:
- Landing: `http://localhost:3000`
- Sign Up: `http://localhost:3000/sign-up`
- Sign In: `http://localhost:3000/sign-in`
- Dashboard: `http://localhost:3000/dashboard`

**Backend**:
- Health: `http://localhost:8000/api/v1/health`
- Current User: `http://localhost:8000/api/v1/me` (requires auth)

### Database Tables

- `user`: User accounts
- `session`: Active sessions with JWT tokens
- `account`: OAuth provider links
- `verification`: Email verification and password reset tokens

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review specification: `spec.md`
3. Review implementation plan: `plan.md`
4. Check research findings: `research.md`
