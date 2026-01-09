# Phase 2 Todo App - Authentication System

**Status**: Authentication System Complete ✅

This is the Phase 2 implementation of the Todo App with a complete authentication system featuring email/password and Google OAuth sign-in, session management, and backend token verification.

## 🎯 Features

- ✅ **User Authentication**: Email/password and Google OAuth sign-in
- ✅ **Session Management**: Persistent sessions (7 days) with httpOnly cookies
- ✅ **Protected Routes**: Frontend dashboard with authentication checks
- ✅ **Backend API**: Token verification and user data endpoints
- ✅ **Database**: Shared Neon PostgreSQL database for frontend and backend
- ✅ **Security**: Zero-trust architecture with backend token verification

## Project Structure

```
phase_2/
├── frontend/          # Next.js 16+ application (App Router, TypeScript, Tailwind CSS)
│   ├── app/          # Next.js App Router pages
│   │   ├── sign-up/  # User registration page
│   │   ├── sign-in/  # User sign-in page
│   │   ├── dashboard/ # Protected dashboard
│   │   └── api/auth/ # Better Auth API routes
│   ├── lib/          # Shared utilities
│   │   ├── auth.ts   # Better Auth configuration
│   │   └── auth-client.ts # Better Auth client hooks
│   └── components/   # React components
│       └── user-menu.tsx # User menu with sign-out
├── backend/          # Python FastAPI application
│   ├── app/
│   │   ├── models/   # SQLModel models (User, Session)
│   │   ├── auth/     # Authentication logic
│   │   │   ├── jwt.py # JWT verification (legacy)
│   │   │   └── dependencies.py # Session token verification
│   │   ├── api/      # API endpoints
│   │   │   └── v1/   # API v1 routes
│   │   ├── config.py # Configuration
│   │   └── database.py # Database connection
│   └── main.py       # FastAPI application
├── specs/            # Feature specifications
│   └── 02-auth-db/   # Authentication system spec
└── .specify/         # Spec-Kit Plus templates
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.x
- **Authentication**: Better Auth (latest)
- **Database Client**: pg (PostgreSQL)
- **Package Manager**: npm

### Backend
- **Framework**: FastAPI 0.128.0
- **Language**: Python 3.12+
- **ORM**: SQLModel 0.0.31
- **Authentication**: Session token verification
- **Database**: PostgreSQL (Neon)
- **Server**: uvicorn 0.40.0
- **Package Manager**: uv

### Database
- **Provider**: Neon PostgreSQL (Serverless)
- **Tables**: user, session, account, verification
- **Schema Management**: Better Auth (automatic)

## Prerequisites

Before running the applications, ensure you have:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Python**: >= 3.11
- **uv**: >= 0.1.0 (install: `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Neon PostgreSQL**: Database provisioned at [neon.tech](https://neon.tech)
- **Google OAuth**: Credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

## 🚀 Quick Start

### 1. Environment Setup

#### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
# Database Connection (from Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
```

#### Backend Environment Variables

Create `backend/.env`:

```bash
# Database Connection (MUST match frontend)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth Secret (MUST match frontend)
BETTER_AUTH_SECRET="your-secret-here-same-as-frontend"
```

#### Generate BETTER_AUTH_SECRET

```bash
openssl rand -base64 32
```

### 2. Database Setup

Run the migration script to create database tables:

```bash
cd frontend
npm install dotenv  # If not already installed
node scripts/migrate.js
```

Expected output:
```
✅ Database tables created successfully!
   - user
   - session
   - account
   - verification
```

### 3. Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
uv sync
```

### 4. Start the Servers

#### Frontend (Terminal 1)

```bash
cd frontend
npm run dev
```

Frontend available at: **http://localhost:3000**

#### Backend (Terminal 2)

```bash
cd backend
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API available at: **http://localhost:8000**
API Documentation: **http://localhost:8000/docs**

### 5. Verify Setup

1. **Frontend**: Visit http://localhost:3000
2. **Backend Health**: `curl http://localhost:8000/health`
3. **Database Health**: `curl http://localhost:8000/api/v1/health`

## 🔐 Authentication Flow

### Sign Up

1. Visit http://localhost:3000/sign-up
2. Enter name, email, and password (must meet requirements)
3. Click "Create account" or "Sign up with Google"
4. Redirected to dashboard on success

### Sign In

1. Visit http://localhost:3000/sign-in
2. Enter email and password
3. Click "Sign in" or "Sign in with Google"
4. Redirected to dashboard on success

### Protected Dashboard

1. Access http://localhost:3000/dashboard (requires authentication)
2. View user information
3. Use user menu to sign out

### Backend API

Test the protected API endpoint:

```bash
# Get session token from browser cookies (better-auth.session_token)
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" http://localhost:8000/api/v1/auth/me
```

Expected response:
```json
{
  "user_id": "...",
  "email": "user@example.com",
  "name": "User Name",
  "email_verified": false,
  "status": "authenticated"
}
```

## 📚 API Documentation

### Frontend Routes

- `/` - Landing page with sign-in/sign-up links
- `/sign-up` - User registration page
- `/sign-in` - User sign-in page
- `/dashboard` - Protected dashboard (requires authentication)
- `/api/auth/[...all]` - Better Auth API routes

### Backend Endpoints

- `GET /` - Root endpoint (API info)
- `GET /health` - Simple health check
- `GET /api/v1/health` - Health check with database connection
- `GET /api/v1/auth/me` - Get current user info (requires authentication)

Interactive API documentation: http://localhost:8000/docs

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `relation "user" does not exist`

**Solution**: Run the migration script to create database tables:
```bash
cd frontend
node scripts/migrate.js
```

#### 2. Google OAuth Redirect URI Mismatch

**Error**: `Error 400: redirect_uri_mismatch`

**Solution**: Add the correct redirect URI to Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add: `http://localhost:3000/api/auth/callback/google`
4. Save and wait 1-2 minutes for changes to propagate

#### 3. Session Token Verification Failed

**Error**: `Could not validate credentials: Not enough segments`

**Solution**: Better Auth uses session tokens (not JWT). Make sure you're using the session token from the `better-auth.session_token` cookie, not a JWT token.

#### 4. CORS Errors

**Error**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**: Verify CORS is configured in `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 5. Environment Variables Not Loaded

**Error**: `process.env.DATABASE_URL is undefined`

**Solution**:
1. Verify `.env.local` exists in `frontend/` directory
2. Verify `.env` exists in `backend/` directory
3. Restart both dev servers after changing environment variables

#### 6. Backend Server Won't Start

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**: Make sure you're running from the `backend/` directory:
```bash
cd backend
.venv/bin/python -m uvicorn main:app --reload
```

### Debug Mode

Enable debug logging:

**Frontend**: Check browser console (F12)
**Backend**: Check terminal output (uvicorn logs all requests)

## 🔒 Security

### Best Practices Implemented

- ✅ **httpOnly Cookies**: Session tokens stored in httpOnly cookies (not accessible via JavaScript)
- ✅ **CORS**: Restricted to frontend origin only
- ✅ **Password Validation**: 8+ characters, uppercase, lowercase, numbers, special characters
- ✅ **Session Expiration**: 7-day sessions with automatic expiration
- ✅ **Zero-Trust**: Backend verifies every token, never trusts client claims
- ✅ **Database Validation**: User existence verified on every request
- ✅ **SSL/TLS**: Required for Neon PostgreSQL connections

### Environment Variables

**Never commit these files:**
- `frontend/.env.local`
- `backend/.env`
- Any file containing `DATABASE_URL`, `BETTER_AUTH_SECRET`, or OAuth credentials

## 📖 Development Workflow

### Adding a New Protected Route

1. Create page in `frontend/app/your-route/page.tsx`
2. Add authentication check:
```typescript
"use client";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function YourPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return <div>Loading...</div>;
  if (!session) {
    router.push("/sign-in");
    return null;
  }

  return <div>Protected content</div>;
}
```

### Adding a New Backend Endpoint

1. Create endpoint in `backend/app/api/v1/endpoints/your_endpoint.py`
2. Add authentication dependency:
```python
from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/your-endpoint")
async def your_endpoint(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.name}"}
```

3. Register in `backend/app/api/v1/router.py`

## 📊 Database Schema

### Tables (Managed by Better Auth)

- **user**: User accounts (id, email, name, emailVerified, image, createdAt, updatedAt)
- **session**: Active sessions (id, userId, token, expiresAt, ipAddress, userAgent)
- **account**: OAuth provider accounts (id, userId, accountId, providerId, accessToken, refreshToken)
- **verification**: Email verification tokens (id, identifier, value, expiresAt)

### Querying the Database

```sql
-- View all users
SELECT id, email, name, "emailVerified", "createdAt" FROM "user";

-- View active sessions
SELECT id, "userId", "expiresAt", "ipAddress" FROM "session" WHERE "expiresAt" > NOW();

-- View OAuth accounts
SELECT "userId", "providerId", "accountId" FROM "account";
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign up with Google OAuth
- [ ] Sign in with Google OAuth
- [ ] Access protected dashboard
- [ ] Refresh page (session persists)
- [ ] Sign out
- [ ] Try accessing dashboard without auth (redirects to sign-in)
- [ ] Call backend API with valid token
- [ ] Call backend API without token (returns 401)

### Test Accounts

Create test accounts for development:
```bash
# Sign up at http://localhost:3000/sign-up
Email: test@example.com
Password: Test123!@#
Name: Test User
```

## 📝 Project Documentation

- **Specifications**: See `specs/02-auth-db/` for authentication system documentation
  - [spec.md](specs/02-auth-db/spec.md) - Feature specification
  - [plan.md](specs/02-auth-db/plan.md) - Implementation plan
  - [tasks.md](specs/02-auth-db/tasks.md) - Task breakdown (all 116 tasks completed)
  - [data-model.md](specs/02-auth-db/data-model.md) - Database schema
  - [quickstart.md](specs/02-auth-db/quickstart.md) - Developer quickstart guide

- **Constitution**: See `.specify/memory/constitution.md` for project principles

- **Debug Skill**: See `.specify/skills/debug_better_auth.md` for troubleshooting guide

## 🎉 Implementation Status

### Completed Features

- ✅ **Phase 1**: Setup and Prerequisites (T001-T004)
- ✅ **Phase 2**: Foundational Infrastructure (T005-T022)
- ✅ **Phase 3**: User Registration and Sign-In (T023-T041)
- ✅ **Phase 4**: Protected Access and Session Management (T042-T055)
- ✅ **Phase 5**: Backend Token Verification (T056-T084)
- ✅ **Phase 6**: Database Connectivity (T085-T093)
- ✅ **Phase 7**: Final Polish and Documentation (T094-T116)

**Total Tasks**: 116/116 (100% Complete)

### All User Stories Complete

- ✅ **US1**: Users can sign up and sign in (email/password + Google OAuth)
- ✅ **US2**: Sessions persist across page refreshes (7 days)
- ✅ **US3**: Backend verifies session tokens and returns user data
- ✅ **US4**: Frontend and backend share the same Neon database

## 🚀 Next Steps

Now that the authentication system is complete, you can:

1. **Build Task Management Features**: Implement CRUD operations for tasks
2. **Add User Profiles**: Allow users to update their profile information
3. **Implement Email Verification**: Send verification emails to new users
4. **Add Password Reset**: Implement forgot password functionality
5. **Deploy to Production**: Deploy frontend and backend to production

## 📞 Support

For questions or issues:
- Review the specification documents in `specs/02-auth-db/`
- Check the troubleshooting section above
- Review the debug skill: `.specify/skills/debug_better_auth.md`
- Check the quickstart guide: `specs/02-auth-db/quickstart.md`

---

**Authentication System**: ✅ Complete
**Ready for**: Task Management Features (Phase 3)
