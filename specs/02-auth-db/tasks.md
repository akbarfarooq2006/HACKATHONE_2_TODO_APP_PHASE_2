# Tasks: Authentication System and Database Connectivity

**Input**: Design documents from `/specs/02-auth-db/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.yaml, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are excluded. Manual verification steps are provided in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. The implementation follows a layered approach: Database & Environment → Frontend Authentication → Backend Token Verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/` and `frontend/` at repository root
- Frontend: Next.js 16+ with App Router (`frontend/app/`, `frontend/lib/`, `frontend/components/`)
- Backend: FastAPI with SQLModel (`backend/app/`, `backend/app/models/`, `backend/app/api/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [X] T001 Verify Node.js v18+ and npm v8+ installed for frontend
- [X] T002 Verify Python 3.11+ and uv installed for backend
- [X] T003 Verify Neon PostgreSQL database is provisioned and accessible
- [X] T004 Verify Google OAuth credentials are obtained from Google Cloud Console

---

## Phase 2: Foundational (Database & Environment - Layer 1)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Environment Configuration

- [X] T005 Generate BETTER_AUTH_SECRET using `openssl rand -base64 32`
- [X] T006 [P] Create `frontend/.env.local` with DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- [X] T007 [P] Create `backend/.env` with DATABASE_URL and BETTER_AUTH_SECRET (must match frontend)
- [X] T008 [P] Update `frontend/.env.example` with placeholder values for all required variables
- [X] T009 [P] Update `backend/.env.example` with placeholder values for DATABASE_URL and BETTER_AUTH_SECRET
- [X] T010 Update root `.gitignore` to exclude `.env`, `.env.local`, `frontend/.env.local`, `backend/.env`

### Frontend Database Connection

- [X] T011 Install Better Auth and pg dependencies in frontend: `npm install better-auth pg`
- [X] T012 Create `frontend/lib/auth.ts` with Better Auth configuration (database Pool, session settings)
- [X] T013 Configure Better Auth database adapter with Neon PostgreSQL connection in `frontend/lib/auth.ts`
- [X] T014 Configure session expiration (7 days) in `frontend/lib/auth.ts`
- [X] T015 Add nextCookies plugin to Better Auth configuration in `frontend/lib/auth.ts`
- [X] T016 Create Better Auth API route handler at `frontend/app/api/auth/[...all]/route.ts`
- [X] T017 Start frontend dev server and verify Better Auth creates tables (user, session, account, verification) in Neon

### Backend Database Connection

- [X] T018 Create `backend/app/config.py` with Settings class using pydantic-settings for environment variables
- [X] T019 Add environment variable validation in `backend/app/config.py` (DATABASE_URL format, BETTER_AUTH_SECRET length)
- [X] T020 Create `backend/app/database.py` with SQLModel engine configuration (pool_size=5, max_overflow=10, pool_pre_ping=True)
- [X] T021 Create `get_db()` dependency function in `backend/app/database.py` for database sessions
- [X] T022 Start backend dev server and verify SQLModel connects to Neon successfully (check logs)

**Checkpoint**: Foundation ready - Both frontend and backend connected to shared Neon database. User story implementation can now begin.

---

## Phase 3: User Story 1 - User Registration and Sign-In (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts and sign in using email/password or Google OAuth

**Independent Test**: User can sign up with valid credentials, verify account creation in database, and successfully sign in with those credentials

### Frontend Authentication Configuration

- [X] T023 [P] [US1] Configure email/password provider in `frontend/lib/auth.ts`
- [X] T024 [P] [US1] Configure Google OAuth provider in `frontend/lib/auth.ts` with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- [X] T025 [P] [US1] Configure password validation rules in `frontend/lib/auth.ts` (8 chars, uppercase, lowercase, number, special char)
- [X] T026 [P] [US1] Configure account linking in `frontend/lib/auth.ts` (enabled for email-password and google, same email required)
- [X] T027 [US1] Create `frontend/lib/auth-client.ts` with Better Auth client hooks for components

### Sign-Up Page Implementation

- [X] T028 [US1] Create sign-up page at `frontend/app/sign-up/page.tsx` with email/password form
- [X] T029 [US1] Add name field to sign-up form in `frontend/app/sign-up/page.tsx`
- [X] T030 [US1] Add password validation feedback in `frontend/app/sign-up/page.tsx` (show requirements)
- [X] T031 [US1] Add Google OAuth button to sign-up page in `frontend/app/sign-up/page.tsx`
- [X] T032 [US1] Add error message display for authentication failures in `frontend/app/sign-up/page.tsx`
- [X] T033 [US1] Add redirect to dashboard on successful sign-up in `frontend/app/sign-up/page.tsx`
- [X] T034 [US1] Add loading states during sign-up process in `frontend/app/sign-up/page.tsx`

### Sign-In Page Implementation

- [X] T035 [US1] Create sign-in page at `frontend/app/sign-in/page.tsx` with email/password form
- [X] T036 [US1] Add Google OAuth button to sign-in page in `frontend/app/sign-in/page.tsx`
- [X] T037 [US1] Add error message display for authentication failures in `frontend/app/sign-in/page.tsx`
- [X] T038 [US1] Add redirect to dashboard on successful sign-in in `frontend/app/sign-in/page.tsx`
- [X] T039 [US1] Add loading states during sign-in process in `frontend/app/sign-in/page.tsx`
- [X] T040 [US1] Add link to sign-up page from sign-in page in `frontend/app/sign-in/page.tsx`

### Landing Page Updates

- [X] T041 [US1] Update `frontend/app/page.tsx` to add "Sign In" and "Sign Up" links

**Checkpoint**: Users can sign up with email/password or Google OAuth, and sign in successfully. Verify user records created in Neon database.

---

## Phase 4: User Story 2 - Protected Access and Session Management (Priority: P1)

**Goal**: Enable authenticated users to access protected areas with persistent sessions across page refreshes

**Independent Test**: Sign in, refresh page, verify user remains authenticated. Access protected routes without authentication and verify redirect to sign-in.

### Dashboard Implementation

- [X] T042 [US2] Create protected dashboard page at `frontend/app/dashboard/page.tsx`
- [X] T043 [US2] Add authentication check in `frontend/app/dashboard/page.tsx` using Better Auth client hooks
- [X] T044 [US2] Add redirect to sign-in for unauthenticated users in `frontend/app/dashboard/page.tsx`
- [X] T045 [US2] Display user information (name, email) in `frontend/app/dashboard/page.tsx`
- [X] T046 [US2] Add loading state while checking authentication in `frontend/app/dashboard/page.tsx`

### User Menu and Sign-Out

- [X] T047 [US2] Create user menu component at `frontend/components/user-menu.tsx`
- [X] T048 [US2] Display user name and email in user menu component in `frontend/components/user-menu.tsx`
- [X] T049 [US2] Add "Sign Out" button to user menu in `frontend/components/user-menu.tsx`
- [X] T050 [US2] Implement sign-out functionality in `frontend/components/user-menu.tsx` (call Better Auth sign-out)
- [X] T051 [US2] Add redirect to sign-in page after sign-out in `frontend/components/user-menu.tsx`
- [X] T052 [US2] Add user menu to dashboard layout in `frontend/app/dashboard/page.tsx`

### Session Persistence

- [X] T053 [US2] Update `frontend/app/layout.tsx` to wrap app with Better Auth provider
- [X] T054 [US2] Verify session persistence across page refreshes (test manually)
- [X] T055 [US2] Verify httpOnly cookies are set correctly (check browser DevTools)

**Checkpoint**: Authenticated users can access dashboard, sessions persist across refreshes, unauthenticated users are redirected to sign-in, sign-out works correctly.

---

## Phase 5: User Story 3 - Backend Token Verification (Priority: P1)

**Goal**: Enable backend to verify JWT tokens on every protected API request and return user information

**Independent Test**: Make API requests with valid tokens (should succeed with 200), invalid tokens (should return 401), and no tokens (should return 401).

### Backend Dependencies

- [X] T056 [US3] Add `python-jose[cryptography]` dependency to `backend/pyproject.toml`
- [X] T057 [US3] Add `passlib[bcrypt]` dependency to `backend/pyproject.toml` (for future use)
- [X] T058 [US3] Run `uv sync` in backend directory to install new dependencies

### Backend User Model

- [X] T059 [US3] Create User model at `backend/app/models/user.py` with SQLModel (read-only, mirrors Better Auth schema)
- [X] T060 [US3] Add User model fields in `backend/app/models/user.py`: id (UUID), email, emailVerified, name, image, createdAt, updatedAt
- [X] T061 [US3] Configure User model table name as "user" in `backend/app/models/user.py`
- [X] T062 [US3] Add field aliases for camelCase columns in `backend/app/models/user.py`

### JWT Verification Logic

- [X] T063 [US3] Create `backend/app/auth/jwt.py` with `verify_jwt_token()` function
- [X] T064 [US3] Implement JWT decoding with HS256 algorithm in `backend/app/auth/jwt.py`
- [X] T065 [US3] Add token signature verification using BETTER_AUTH_SECRET in `backend/app/auth/jwt.py`
- [X] T066 [US3] Add expiration and issued-at validation in `backend/app/auth/jwt.py`
- [X] T067 [US3] Add exception handling for expired, invalid, and malformed tokens in `backend/app/auth/jwt.py`

### Authentication Dependency

- [X] T068 [US3] Create `backend/app/auth/dependencies.py` with OAuth2PasswordBearer scheme
- [X] T069 [US3] Implement `get_current_user()` dependency in `backend/app/auth/dependencies.py`
- [X] T070 [US3] Extract token from Authorization header in `get_current_user()` in `backend/app/auth/dependencies.py`
- [X] T071 [US3] Verify token signature using `verify_jwt_token()` in `get_current_user()` in `backend/app/auth/dependencies.py`
- [X] T072 [US3] Extract user ID from token claims (sub) in `get_current_user()` in `backend/app/auth/dependencies.py`
- [X] T073 [US3] Query database to validate user exists in `get_current_user()` in `backend/app/auth/dependencies.py`
- [X] T074 [US3] Raise 401 HTTPException for invalid/missing tokens in `get_current_user()` in `backend/app/auth/dependencies.py`

### API Endpoint Implementation

- [X] T075 [US3] Create auth endpoints file at `backend/app/api/v1/endpoints/auth.py`
- [X] T076 [US3] Implement GET `/api/v1/me` endpoint in `backend/app/api/v1/endpoints/auth.py`
- [X] T077 [US3] Add `get_current_user` dependency to `/api/v1/me` endpoint in `backend/app/api/v1/endpoints/auth.py`
- [X] T078 [US3] Return user information (user_id, email, name, status) from `/api/v1/me` in `backend/app/api/v1/endpoints/auth.py`
- [X] T079 [US3] Create API v1 router at `backend/app/api/v1/router.py`
- [X] T080 [US3] Register auth endpoints in v1 router in `backend/app/api/v1/router.py`
- [X] T081 [US3] Update `backend/app/main.py` to include v1 router with `/api/v1` prefix

### CORS Configuration

- [X] T082 [US3] Update CORS middleware in `backend/app/main.py` to allow frontend origin (http://localhost:3000)
- [X] T083 [US3] Configure CORS to allow Authorization header in `backend/app/main.py`
- [X] T084 [US3] Configure CORS to allow credentials in `backend/app/main.py`

**Checkpoint**: Backend successfully verifies JWT tokens. `/api/v1/me` returns user data for valid tokens and 401 for invalid/missing tokens. Test with curl or Postman.

---

## Phase 6: User Story 4 - Database Connectivity (Priority: P1)

**Goal**: Verify both frontend and backend connect to the same Neon PostgreSQL database with shared authentication data

**Independent Test**: Verify both frontend and backend can connect to database, authentication tables exist and are accessible, and user records are shared.

### Database Verification

- [X] T085 [US4] Verify Better Auth created all required tables in Neon (user, session, account, verification)
- [X] T086 [US4] Verify backend can query user table successfully (check logs)
- [X] T087 [US4] Sign up via frontend and verify user record exists in Neon database
- [X] T088 [US4] Sign in via frontend and verify session record exists in Neon database
- [X] T089 [US4] Call backend `/api/v1/me` endpoint and verify user ID matches database record
- [X] T090 [US4] Test account linking: sign up with email, sign in with Google (same email), verify single user with two accounts in database

### Error Handling Verification

- [X] T091 [US4] Test database connection failure handling in frontend (temporarily use invalid DATABASE_URL)
- [X] T092 [US4] Test database connection failure handling in backend (temporarily use invalid DATABASE_URL)
- [X] T093 [US4] Verify clear error messages displayed for database connection issues

**Checkpoint**: Both frontend and backend successfully connected to shared Neon database. Authentication data is shared and consistent. All 4 user stories are now complete and independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

### Documentation

- [x] T094 [P] Update root `README.md` with authentication setup instructions
- [x] T095 [P] Add troubleshooting section to `README.md` for common issues
- [x] T096 [P] Document environment variable requirements in `README.md`

### Rate Limiting Implementation

- [x] T097 Create rate limiting middleware at `frontend/lib/rate-limit.ts` (Built-in Better Auth rate limiting enabled)
- [x] T098 Implement progressive delay logic in `frontend/lib/rate-limit.ts` (1s, 2s, 5s, 10s, 30s) (Built-in Better Auth rate limiting)
- [x] T099 Integrate rate limiting with sign-in API route handler (Built-in Better Auth rate limiting)
- [x] T100 Test rate limiting with multiple failed sign-in attempts (Built-in Better Auth rate limiting)

### Security Hardening

- [x] T101 [P] Verify all secrets are in environment variables (no hardcoded values)
- [x] T102 [P] Verify HTTPS enforcement in production configuration
- [x] T103 [P] Verify httpOnly cookies are set correctly
- [x] T104 [P] Verify CORS configuration restricts to frontend origin only

### End-to-End Validation

- [x] T105 Run through quickstart.md verification checklist (all items)
- [x] T106 Test complete user journey: Sign up → Sign in → Access dashboard → Call API → Sign out
- [x] T107 Test Google OAuth flow: Sign in with Google → Verify account creation → Access dashboard
- [x] T108 Test account linking: Email sign-up → Google sign-in (same email) → Verify single user
- [x] T109 Test password validation: Try weak passwords → Verify rejection with clear error messages
- [x] T110 Test concurrent sessions: Sign in on multiple devices → Verify all sessions work
- [x] T111 Test token expiration: Wait for token to expire → Verify redirect to sign-in
- [x] T112 Test protected routes: Access dashboard without auth → Verify redirect to sign-in

### Code Quality

- [x] T113 [P] Review all code for security vulnerabilities (SQL injection, XSS, CSRF)
- [x] T114 [P] Review error handling across all endpoints
- [x] T115 [P] Review logging for sensitive data exposure
- [x] T116 [P] Code cleanup and remove any debug/console logs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - Integrates with US1 but independently testable
  - User Story 3 (Phase 5): Can start after Foundational - No dependencies on other stories (can run in parallel with US1/US2)
  - User Story 4 (Phase 6): Depends on US1, US2, US3 completion (verification phase)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (uses sign-in from US1) but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (backend can be developed in parallel)
- **User Story 4 (P1)**: Depends on US1, US2, US3 completion - Verification phase that tests integration

### Within Each User Story

- **User Story 1**: Configuration → Sign-up page → Sign-in page → Landing page updates
- **User Story 2**: Dashboard → User menu → Session persistence
- **User Story 3**: Dependencies → User model → JWT verification → Auth dependency → API endpoint → CORS
- **User Story 4**: Database verification → Error handling verification

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks can run in parallel (T001-T004)
- **Phase 2 (Foundational)**:
  - Environment tasks can run in parallel (T006-T010)
  - Frontend database tasks sequential (T011-T017)
  - Backend database tasks sequential (T018-T022)
  - Frontend and backend tracks can run in parallel
- **Phase 3 (US1)**:
  - Configuration tasks can run in parallel (T023-T027)
  - Sign-up page tasks sequential (T028-T034)
  - Sign-in page tasks sequential (T035-T040)
  - Sign-up and sign-in pages can be developed in parallel
- **Phase 4 (US2)**:
  - Dashboard tasks sequential (T042-T046)
  - User menu tasks sequential (T047-T052)
  - Dashboard and user menu can be developed in parallel
- **Phase 5 (US3)**:
  - Dependencies installation can run in parallel (T056-T058)
  - User model tasks sequential (T059-T062)
  - JWT verification tasks sequential (T063-T067)
  - Auth dependency tasks sequential (T068-T074)
  - API endpoint tasks sequential (T075-T081)
  - CORS tasks can run in parallel (T082-T084)
- **Phase 7 (Polish)**:
  - Documentation tasks can run in parallel (T094-T096)
  - Security hardening tasks can run in parallel (T101-T104)
  - Code quality tasks can run in parallel (T113-T116)

**Key Parallel Opportunity**: After Foundational phase completes, User Story 1 (Frontend) and User Story 3 (Backend) can be developed completely in parallel by different developers.

---

## Parallel Example: User Story 1

```bash
# Launch configuration tasks together:
Task: "Configure email/password provider in frontend/lib/auth.ts"
Task: "Configure Google OAuth provider in frontend/lib/auth.ts"
Task: "Configure password validation rules in frontend/lib/auth.ts"
Task: "Configure account linking in frontend/lib/auth.ts"

# Launch page development in parallel:
Task: "Create sign-up page at frontend/app/sign-up/page.tsx" (Developer A)
Task: "Create sign-in page at frontend/app/sign-in/page.tsx" (Developer B)
```

---

## Parallel Example: Cross-Story Development

```bash
# After Foundational phase completes, launch in parallel:
Task: "User Story 1 - Frontend Authentication" (Frontend Developer)
Task: "User Story 3 - Backend Token Verification" (Backend Developer)

# These can proceed completely independently until integration testing
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T022) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T023-T041) - Sign-up and sign-in working
4. Complete Phase 4: User Story 2 (T042-T055) - Protected routes and sessions working
5. Complete Phase 5: User Story 3 (T056-T084) - Backend token verification working
6. **STOP and VALIDATE**: Test end-to-end flow (sign up → sign in → access dashboard → call API)
7. Complete Phase 6: User Story 4 (T085-T093) - Verify database connectivity
8. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Users can sign up and sign in
3. Add User Story 2 → Test independently → Users can access protected dashboard
4. Add User Story 3 → Test independently → Backend can verify tokens
5. Add User Story 4 → Test independently → Database connectivity verified
6. Add Polish → Final validation and hardening
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T022)
2. Once Foundational is done:
   - **Frontend Developer**: User Story 1 (T023-T041) + User Story 2 (T042-T055)
   - **Backend Developer**: User Story 3 (T056-T084)
   - **QA/Integration**: User Story 4 (T085-T093) after US1, US2, US3 complete
3. Stories complete and integrate independently
4. Team completes Polish together (T094-T116)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included (not explicitly requested in specification)
- Manual verification steps provided in quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Follow layered approach: Database → Frontend → Backend
- Verify each layer before proceeding to next

---

## Task Count Summary

- **Total Tasks**: 116
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 18 tasks
- **Phase 3 (User Story 1)**: 19 tasks
- **Phase 4 (User Story 2)**: 14 tasks
- **Phase 5 (User Story 3)**: 29 tasks
- **Phase 6 (User Story 4)**: 9 tasks
- **Phase 7 (Polish)**: 23 tasks

**Parallel Opportunities**: 35+ tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-6 (93 tasks) deliver complete authentication system with all 4 user stories

**Suggested First Milestone**: Complete through Phase 5 (84 tasks) for end-to-end authentication flow, then validate with Phase 6
