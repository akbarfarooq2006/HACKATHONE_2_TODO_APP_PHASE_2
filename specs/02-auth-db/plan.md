# Implementation Plan: Authentication System and Database Connectivity

**Branch**: `02-auth-db` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/02-auth-db/spec.md`

## Summary

Implement a hybrid authentication architecture where the Frontend (Next.js + Better Auth) issues JWT tokens and the Backend (FastAPI) verifies them. Both systems connect to a shared Neon PostgreSQL database. The implementation follows a layered approach to ensure testability at each phase: (1) Database & Environment setup with connection verification, (2) Frontend authentication with token issuance verification, (3) Backend token verification with API endpoint testing.

**Key Technical Approach**:
- **Database**: Shared Neon PostgreSQL with Better Auth auto-creating tables (user, session, account, verification)
- **Frontend Token Issuer**: Better Auth library handling email/password + Google OAuth, storing tokens in httpOnly cookies
- **Backend Token Verifier**: FastAPI dependency (`get_current_user`) verifying JWT signatures using shared BETTER_AUTH_SECRET
- **Zero-Trust Model**: Backend never trusts client claims; always verifies token signatures and validates user existence in database

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with Next.js 16.1.1
- Backend: Python 3.12.3 with FastAPI 0.128.0

**Primary Dependencies**:
- Frontend: Better Auth (latest), Next.js 16+, React 19+, Tailwind CSS 4.x
- Backend: FastAPI 0.128.0, SQLModel 0.0.31, uvicorn 0.40.0, python-jose (JWT), passlib (password hashing)

**Storage**: Neon Serverless PostgreSQL (shared between frontend and backend)

**Testing**:
- Frontend: Manual verification of sign-up/sign-in flows, token issuance
- Backend: Manual verification of token verification via `/api/v1/me` endpoint
- Integration: End-to-end flow from frontend sign-in to backend API access

**Target Platform**:
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge)
- Backend: Linux server (WSL2 environment)

**Project Type**: Web application (monorepo with frontend/ and backend/)

**Performance Goals**:
- Authentication flows complete in <2 seconds (excluding user input)
- Token verification adds <50ms latency to API requests
- Database queries complete in <100ms
- Protected route redirects in <100ms

**Constraints**:
- Zero-trust architecture: Backend MUST verify every token
- Shared secret (BETTER_AUTH_SECRET) must be identical in frontend and backend
- No secrets in source code; all via environment variables
- Frontend NEVER accesses database directly
- Backend NEVER trusts client-provided user IDs

**Scale/Scope**:
- Initial deployment: Single user testing
- Target: Support for multiple concurrent users with unlimited sessions per user
- Database: 4 core tables (user, session, account, verification)
- API endpoints: 1 test endpoint (`/api/v1/me`) in this phase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-First Development ✅
- **Status**: PASS
- **Evidence**: Complete specification exists at `specs/02-auth-db/spec.md` with 29 functional requirements, 4 user stories, 8 success criteria
- **Compliance**: Implementation will not begin until this plan is approved

### Principle II: Security & Authentication ✅
- **Status**: PASS
- **Evidence**:
  - JWT token verification enforced on all protected endpoints (FR-014, FR-015, FR-016)
  - User identity derived from JWT claims, never from request body (FR-017)
  - 401 Unauthorized for missing/invalid tokens (FR-016)
  - All secrets in environment variables (FR-020 through FR-025)
  - Zero-trust architecture explicitly specified in spec
- **Compliance**: Backend `get_current_user` dependency will verify every token

### Principle III: Monorepo Architecture ✅
- **Status**: PASS
- **Evidence**:
  - Frontend in `frontend/` handles authentication UI and token issuance
  - Backend in `backend/` handles token verification and protected APIs
  - Frontend NEVER accesses database directly (Better Auth handles DB via backend connection)
  - Backend exposes REST API only (`/api/v1/me`)
- **Compliance**: Clear separation maintained; frontend issues tokens, backend verifies them

### Principle IV: Agent-Driven Development ✅
- **Status**: PASS
- **Evidence**: All development performed by Claude Code following Spec-Kit Plus methodology
- **Compliance**: This plan follows `/sp.plan` command workflow

### Principle V: Tech Stack Compliance ✅
- **Status**: PASS
- **Evidence**:
  - Frontend: Next.js 16.1.1, TypeScript, Tailwind CSS ✅
  - Backend: FastAPI 0.128.0, SQLModel 0.0.31 ✅
  - Database: Neon PostgreSQL ✅
  - Authentication: Better Auth (frontend) + JWT verification (backend) ✅
- **Compliance**: No alternative technologies introduced

### Principle VI: API-First Backend Design ✅
- **Status**: PASS
- **Evidence**:
  - Backend exposes stateless REST API (`GET /api/v1/me`)
  - API versioning via URL path (`/api/v1/`)
  - Standard HTTP status codes (200 OK, 401 Unauthorized)
  - Input validation via Pydantic models
- **Compliance**: Test endpoint demonstrates API-first approach

**Overall Gate Status**: ✅ PASS - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/02-auth-db/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology research)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   └── auth-api.yaml    # OpenAPI spec for /api/v1/me endpoint
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Specification quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app with CORS, health endpoint
│   ├── config.py                  # NEW: Environment variable configuration
│   ├── database.py                # NEW: SQLModel database connection
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py                # NEW: User model (read-only for backend)
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── dependencies.py        # NEW: get_current_user dependency
│   │   └── jwt.py                 # NEW: JWT verification logic
│   └── api/
│       ├── __init__.py
│       └── v1/
│           ├── __init__.py
│           ├── router.py          # NEW: API v1 router
│           └── endpoints/
│               ├── __init__.py
│               └── auth.py        # NEW: /api/v1/me endpoint
├── tests/                         # Future: Integration tests
├── .env.example                   # UPDATED: Add auth-related variables
├── .env                           # NEW: Local environment variables (gitignored)
└── pyproject.toml                 # UPDATED: Add python-jose, passlib

frontend/
├── app/
│   ├── page.tsx                   # UPDATED: Add link to sign-in
│   ├── sign-up/
│   │   └── page.tsx               # NEW: Sign-up page
│   ├── sign-in/
│   │   └── page.tsx               # NEW: Sign-in page
│   ├── dashboard/
│   │   └── page.tsx               # NEW: Protected dashboard
│   └── layout.tsx                 # UPDATED: Add Better Auth provider
├── lib/
│   ├── auth.ts                    # NEW: Better Auth configuration
│   └── auth-client.ts             # NEW: Better Auth client for components
├── components/
│   └── user-menu.tsx              # NEW: User menu with sign-out
├── .env.example                   # UPDATED: Add auth-related variables
├── .env.local                     # NEW: Local environment variables (gitignored)
└── package.json                   # UPDATED: Add better-auth dependency

.gitignore                         # UPDATED: Add .env, .env.local
README.md                          # UPDATED: Add authentication setup instructions
```

**Structure Decision**: Using Option 2 (Web application) with existing `frontend/` and `backend/` directories. Frontend handles authentication UI and token issuance via Better Auth. Backend handles token verification and protected API access. Both connect to shared Neon PostgreSQL database.

## Complexity Tracking

> **No constitutional violations detected. This section is empty.**

## Phase 0: Research & Technology Validation

**Objective**: Resolve all technical unknowns and validate technology choices before design phase.

### Research Tasks

#### R1: Better Auth Integration with Next.js 16 App Router
**Question**: How to configure Better Auth with Next.js 16 App Router and Neon PostgreSQL?
**Research Areas**:
- Better Auth installation and configuration
- Database adapter for Neon PostgreSQL
- App Router integration (route handlers, server components)
- Token storage strategy (httpOnly cookies vs localStorage)
- Google OAuth provider setup

**Expected Output**: Configuration pattern for `lib/auth.ts` and route handler setup

#### R2: JWT Verification in FastAPI
**Question**: How to verify Better Auth JWT tokens in FastAPI using shared secret?
**Research Areas**:
- JWT token structure from Better Auth (algorithm, claims)
- Python libraries for JWT verification (python-jose vs PyJWT)
- FastAPI dependency injection pattern for authentication
- Token extraction from Authorization header
- Error handling for invalid/expired tokens

**Expected Output**: Implementation pattern for `get_current_user` dependency

#### R3: Shared Database Connection Strategy
**Question**: How to connect both Better Auth (frontend) and SQLModel (backend) to same Neon database?
**Research Areas**:
- Better Auth database adapter configuration
- SQLModel connection string format for Neon
- Table creation strategy (Better Auth auto-creates, backend reads)
- Connection pooling and management
- Environment variable sharing strategy

**Expected Output**: Database connection patterns for both frontend and backend

#### R4: Password Validation and Account Linking
**Question**: How to implement password complexity validation and account linking in Better Auth?
**Research Areas**:
- Better Auth password validation hooks
- Custom validation rules (8 chars, uppercase, lowercase, number, special char)
- Account linking configuration (merge email and OAuth accounts)
- Progressive delay rate limiting implementation

**Expected Output**: Better Auth configuration for password rules and account linking

#### R5: Environment Variable Management
**Question**: What environment variables are required and how to manage them securely?
**Research Areas**:
- Required variables: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- Secret generation strategy (BETTER_AUTH_SECRET)
- .env file structure for frontend and backend
- Environment variable validation on startup

**Expected Output**: Complete .env.example templates for both frontend and backend

**Deliverable**: `research.md` with all findings, decisions, and code patterns

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all technical unknowns resolved

### D1: Data Model Design

**Objective**: Document database schema and entity relationships

**Entities** (Better Auth auto-creates these tables):

1. **User Table**
   - `id` (UUID, primary key)
   - `email` (string, unique, not null)
   - `emailVerified` (boolean, default false)
   - `name` (string, nullable)
   - `image` (string, nullable)
   - `createdAt` (timestamp)
   - `updatedAt` (timestamp)

2. **Session Table**
   - `id` (UUID, primary key)
   - `userId` (UUID, foreign key to User)
   - `expiresAt` (timestamp, 7 days from creation)
   - `token` (string, JWT token)
   - `ipAddress` (string, nullable)
   - `userAgent` (string, nullable)
   - `createdAt` (timestamp)

3. **Account Table** (OAuth providers)
   - `id` (UUID, primary key)
   - `userId` (UUID, foreign key to User)
   - `provider` (string, e.g., "google")
   - `providerAccountId` (string)
   - `accessToken` (string, nullable)
   - `refreshToken` (string, nullable)
   - `expiresAt` (timestamp, nullable)
   - `createdAt` (timestamp)

4. **Verification Table** (email verification, password reset)
   - `id` (UUID, primary key)
   - `userId` (UUID, foreign key to User)
   - `token` (string)
   - `type` (enum: email_verification, password_reset)
   - `expiresAt` (timestamp)
   - `createdAt` (timestamp)

**Backend Models** (SQLModel, read-only):
- Backend only needs to read from User table for token verification
- No write operations in this phase

**Deliverable**: `data-model.md` with complete schema documentation

### D2: API Contract Design

**Objective**: Define REST API contracts for authentication endpoints

**Endpoint**: `GET /api/v1/me`

**Purpose**: Test endpoint to verify JWT token verification is working

**Request**:
```
GET /api/v1/me HTTP/1.1
Host: localhost:8000
Authorization: Bearer <jwt_token>
```

**Response (Success - 200 OK)**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "status": "authenticated"
}
```

**Response (Unauthorized - 401)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Response (No Token - 401)**:
```json
{
  "detail": "Authorization header missing"
}
```

**Deliverable**: `contracts/auth-api.yaml` (OpenAPI 3.0 specification)

### D3: Quickstart Guide

**Objective**: Document setup and verification steps for developers

**Contents**:
1. Prerequisites (Node.js, Python, Neon database)
2. Environment variable setup
3. Frontend setup (npm install, Better Auth configuration)
4. Backend setup (uv sync, database connection)
5. Verification steps (sign-up, sign-in, API call)
6. Troubleshooting common issues

**Deliverable**: `quickstart.md` with step-by-step instructions

### D4: Agent Context Update

**Objective**: Update Claude Code context with new technologies

**Action**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude` (or bash equivalent if available)

**Manual Fallback**: If script unavailable, manually update `CLAUDE.md` with:
- Better Auth library usage patterns
- JWT verification patterns in FastAPI
- Neon PostgreSQL connection patterns

## Phase 2: Layered Implementation Plan

**Note**: Detailed tasks will be generated by `/sp.tasks` command. This section provides the high-level implementation strategy.

### Layer 1: Database & Environment Setup

**Objective**: Establish database connectivity and environment configuration for both frontend and backend

**Tasks**:
1. **ENV-001**: Create `.env` files for frontend and backend with all required variables
2. **ENV-002**: Generate BETTER_AUTH_SECRET and add to both .env files
3. **ENV-003**: Add Neon DATABASE_URL to both .env files
4. **ENV-004**: Configure Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
5. **DB-001**: Configure Better Auth database adapter in frontend
6. **DB-002**: Configure SQLModel database connection in backend
7. **DB-003**: Create backend config.py for environment variable loading
8. **DB-004**: Create backend database.py for SQLModel engine setup

**Verification**:
- Frontend: Run Next.js dev server, verify Better Auth creates tables in Neon
- Backend: Run FastAPI server, verify SQLModel connects to Neon successfully
- Database: Query Neon console to confirm tables exist (user, session, account, verification)

**Success Criteria**:
- Both frontend and backend start without database connection errors
- Better Auth tables visible in Neon console
- Backend can query user table (even if empty)

### Layer 2: Frontend Authentication (Token Issuer)

**Objective**: Implement user sign-up, sign-in, and token issuance using Better Auth

**Tasks**:
1. **FE-001**: Install Better Auth dependency (`npm install better-auth`)
2. **FE-002**: Create `lib/auth.ts` with Better Auth configuration
   - Database adapter (Neon PostgreSQL)
   - Email/password provider
   - Google OAuth provider
   - Password validation rules (FR-026)
   - Account linking enabled (FR-027)
   - Progressive delay rate limiting (FR-029)
3. **FE-003**: Create `lib/auth-client.ts` for client-side auth hooks
4. **FE-004**: Create Better Auth API route handler at `app/api/auth/[...all]/route.ts`
5. **FE-005**: Create sign-up page at `app/sign-up/page.tsx`
   - name, email, password form with validation
   - Google OAuth button
   - Error message display
   - Redirect to dashboard on success
6. **FE-006**: Create sign-in page at `app/sign-in/page.tsx`
   - Email/password form
   - Google OAuth button
   - Error message display
   - Redirect to dashboard on success
7. **FE-007**: Create protected dashboard at `app/dashboard/page.tsx`
   - Check authentication status
   - Redirect to sign-in if not authenticated
   - Display user information
8. **FE-008**: Create user menu component at `components/user-menu.tsx`
   - Display user name/email
   - Sign-out button
9. **FE-009**: Update `app/layout.tsx` to wrap app with Better Auth provider
10. **FE-010**: Update `app/page.tsx` to add link to sign-in

**Verification**:
- Sign up with name/email/password → User created in database, redirected to dashboard
- Sign in with name/email/password → Session created, JWT token issued, redirected to dashboard
- Sign in with Google OAuth → OAuth flow completes, user created/linked, redirected to dashboard
- Access dashboard while authenticated → User information displayed
- Access dashboard while unauthenticated → Redirected to sign-in
- Sign out → Session terminated, redirected to sign-in
- Refresh page while authenticated → User remains authenticated
- Test password validation → Weak passwords rejected
- Test account linking → Email and Google accounts with same email merge

**Success Criteria**:
- Users can sign up and sign in successfully
- JWT tokens are issued and stored in httpOnly cookies
- Protected routes redirect unauthenticated users
- Sessions persist across page refreshes
- Password validation enforces complexity requirements
- Account linking works for email and Google OAuth

### Layer 3: Backend Token Verification (Token Verifier)

**Objective**: Implement JWT token verification and protected API endpoint

**Tasks**:
1. **BE-001**: Add dependencies to `pyproject.toml`
   - `python-jose[cryptography]` for JWT verification
   - `passlib[bcrypt]` for password hashing (future use)
2. **BE-002**: Run `uv sync` to install new dependencies
3. **BE-003**: Create `app/models/user.py` with SQLModel User model (read-only)
4. **BE-004**: Create `app/auth/jwt.py` with JWT verification logic
   - Function to decode and verify JWT token
   - Extract user ID from token claims
   - Handle expired/invalid tokens
5. **BE-005**: Create `app/auth/dependencies.py` with `get_current_user` dependency
   - Extract token from Authorization header
   - Verify token signature using BETTER_AUTH_SECRET
   - Query database to validate user exists
   - Return user object or raise 401 HTTPException
6. **BE-006**: Create `app/api/v1/endpoints/auth.py` with `/me` endpoint
   - Use `get_current_user` dependency
   - Return authenticated user information
7. **BE-007**: Create `app/api/v1/router.py` to register auth endpoints
8. **BE-008**: Update `app/main.py` to include v1 router
9. **BE-009**: Update CORS configuration to allow frontend origin

**Verification**:
- Sign in via frontend → Copy JWT token from browser cookies/network tab
- Call `GET /api/v1/me` with valid token → 200 OK with user information
- Call `GET /api/v1/me` with invalid token → 401 Unauthorized
- Call `GET /api/v1/me` with expired token → 401 Unauthorized
- Call `GET /api/v1/me` without token → 401 Unauthorized
- Verify user ID from token matches database record

**Success Criteria**:
- Backend successfully verifies JWT tokens from Better Auth
- `/api/v1/me` endpoint returns user information for valid tokens
- Invalid/missing tokens return 401 Unauthorized
- User identity from token matches database record
- Zero-trust architecture enforced (backend never trusts client claims)

## Implementation Sequence

**Phase 0**: Research (Complete before implementation)
1. Complete all research tasks (R1-R5)
2. Document findings in `research.md`
3. Validate all technical approaches

**Phase 1**: Design (Complete before coding)
1. Create `data-model.md` with database schema
2. Create `contracts/auth-api.yaml` with API specification
3. Create `quickstart.md` with setup instructions
4. Update agent context (if applicable)

**Phase 2**: Implementation (Execute in order)
1. **Layer 1**: Database & Environment (ENV-001 through DB-004)
   - Verify: Both systems connect to database
2. **Layer 2**: Frontend Authentication (FE-001 through FE-010)
   - Verify: Users can sign up, sign in, and receive tokens
3. **Layer 3**: Backend Verification (BE-001 through BE-009)
   - Verify: Backend verifies tokens and returns user data

**Phase 3**: Integration Testing
1. End-to-end flow: Sign up → Sign in → Call API → Verify response
2. Error scenarios: Invalid tokens, expired tokens, missing tokens
3. Edge cases: Account linking, concurrent sessions, password validation

## Risk Mitigation

### Risk 1: Token Secret Mismatch
**Mitigation**:
- Use same BETTER_AUTH_SECRET in both .env files
- Add startup validation to verify secret is set
- Document secret sharing requirement in quickstart.md

### Risk 2: Better Auth Table Creation Failure
**Mitigation**:
- Verify DATABASE_URL format is correct for Neon
- Check Neon database permissions
- Manual table creation script as fallback (if needed)

### Risk 3: JWT Algorithm Mismatch
**Mitigation**:
- Research Better Auth default JWT algorithm (likely HS256)
- Configure python-jose to use same algorithm
- Add algorithm validation in backend JWT verification

### Risk 4: CORS Configuration Issues
**Mitigation**:
- Configure CORS to allow frontend origin explicitly
- Test CORS with browser network tab
- Document CORS setup in quickstart.md

### Risk 5: Google OAuth Configuration Errors
**Mitigation**:
- Provide detailed Google OAuth setup instructions
- Validate OAuth credentials on startup
- Allow fallback to email/password if OAuth fails

## Success Metrics

**Layer 1 Success**:
- ✅ Frontend connects to Neon database
- ✅ Backend connects to Neon database
- ✅ Better Auth creates required tables

**Layer 2 Success**:
- ✅ Users can sign up with name/email/password
- ✅ Users can sign in with email/password
- ✅ Users can sign in with Google OAuth
- ✅ JWT tokens are issued and stored securely
- ✅ Protected routes redirect unauthenticated users
- ✅ Sessions persist across page refreshes

**Layer 3 Success**:
- ✅ Backend verifies JWT tokens successfully
- ✅ `/api/v1/me` returns user data for valid tokens
- ✅ Invalid tokens return 401 Unauthorized
- ✅ User identity from token matches database

**Overall Success**:
- ✅ All 29 functional requirements satisfied
- ✅ All 8 success criteria met
- ✅ Zero-trust architecture enforced
- ✅ Hybrid authentication model working end-to-end

## Next Steps

After this plan is approved:
1. Execute Phase 0 (Research) → Create `research.md`
2. Execute Phase 1 (Design) → Create `data-model.md`, `contracts/`, `quickstart.md`
3. Run `/sp.tasks` to generate detailed implementation tasks
4. Execute Phase 2 (Implementation) following layered approach
5. Verify each layer before proceeding to next
6. Create PHR documenting implementation outcomes
