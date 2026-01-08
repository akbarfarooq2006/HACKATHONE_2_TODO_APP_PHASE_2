---
id: 003
title: Create Auth DB Plan
stage: plan
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: auth-db
branch: 02-auth-db
user: akbarfarooq
command: /sp.plan
labels: ["planning", "architecture", "authentication", "database", "better-auth", "fastapi", "jwt"]
links:
  spec: specs/02-auth-db/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/02-auth-db/plan.md
  - specs/02-auth-db/research.md
  - specs/02-auth-db/data-model.md
  - specs/02-auth-db/contracts/auth-api.yaml
  - specs/02-auth-db/quickstart.md
tests:
  - Constitution compliance check (all 6 principles passed)
  - Technology research validation (5 research tasks completed)
  - Design artifacts completeness (data model, contracts, quickstart)
---

## Prompt

Create the Implementation Plan (plan.md) for this specification.

Strategy: Use a "Layered Approach" to ensure testability.

Requirements for the Plan:

Phase 1: Database & Environment:

Setup .env variables (Database URL, Secrets).

Verify both Frontend and Backend can connect to Neon.

Phase 2: Frontend Auth (The Issuer):

Install Better Auth.

Create the Sign-Up/Sign-In pages.

Verification: Prove you can create a user and get a Session Token.

Phase 3: Backend Auth (The Verifier):

Implement the get_current_user dependency.

Verification: Use the token from Phase 2 to call the backend API and get a 200 OK

## Response snapshot

Successfully created comprehensive implementation plan for authentication system with hybrid architecture following user-specified layered approach:

**Phase 0: Research (Completed)**
- R1: Better Auth Integration - Researched configuration with Next.js 16 App Router, Neon PostgreSQL, Google OAuth, account linking, and httpOnly cookie storage
- R2: JWT Verification in FastAPI - Researched python-jose library for HS256 token verification, dependency injection patterns, and error handling
- R3: Shared Database Connection - Researched connection strategy for both Better Auth (pg Pool) and SQLModel (engine with pooling)
- R4: Password Validation & Account Linking - Researched custom validation hooks and account linking configuration
- R5: Environment Variable Management - Researched required variables, secret generation, validation strategies

**Phase 1: Design (Completed)**
- Created data-model.md with complete database schema (4 tables: user, session, account, verification)
- Created contracts/auth-api.yaml with OpenAPI 3.0 specification for /api/v1/me endpoint
- Created quickstart.md with step-by-step setup instructions, verification checklist, and troubleshooting guide

**Implementation Plan Structure (plan.md)**:
- Summary: Hybrid architecture with Better Auth (token issuer) and FastAPI (token verifier)
- Technical Context: TypeScript 5.x/Next.js 16.1.1 (frontend), Python 3.12.3/FastAPI 0.128.0 (backend)
- Constitution Check: All 6 principles validated (Spec-First, Security, Monorepo, Agent-Driven, Tech Stack, API-First)
- Project Structure: Documented frontend/ and backend/ directory layouts with new files
- Phase 0: Research tasks (R1-R5) with findings documented in research.md
- Phase 1: Design tasks (data model, API contracts, quickstart guide)
- Phase 2: Layered implementation strategy:
  - Layer 1: Database & Environment (ENV-001 through DB-004)
  - Layer 2: Frontend Authentication (FE-001 through FE-010)
  - Layer 3: Backend Token Verification (BE-001 through BE-009)
- Risk Mitigation: 5 risks identified with mitigation strategies
- Success Metrics: Layer-specific success criteria for verification

**Key Architectural Decisions**:
1. **Database Strategy**: Better Auth auto-creates tables, backend reads with SQLModel (read-only)
2. **JWT Library**: python-jose[cryptography] for backend token verification
3. **Token Storage**: httpOnly cookies (Better Auth default) for XSS protection
4. **Account Linking**: Enabled for email/password and Google OAuth with same email requirement
5. **Connection Pooling**: pg Pool (frontend), SQLModel engine with pool_size=5 (backend)
6. **Password Validation**: Custom validation function with regex checks (8 chars, uppercase, lowercase, number, special char)
7. **Rate Limiting**: Custom middleware with progressive delays (1s, 2s, 5s, 10s, 30s)

**Technology Stack Validated**:
- Frontend: Next.js 16.1.1, TypeScript 5.x, Better Auth, pg, Tailwind CSS 4.x
- Backend: FastAPI 0.128.0, SQLModel 0.0.31, python-jose[cryptography], uvicorn 0.40.0
- Database: Neon Serverless PostgreSQL (shared connection)

**Documentation Artifacts Created**:
1. plan.md (548 lines) - Complete implementation plan with layered approach
2. research.md (450+ lines) - Technology research findings with code patterns
3. data-model.md (400+ lines) - Database schema with ERD, constraints, and access patterns
4. contracts/auth-api.yaml (200+ lines) - OpenAPI 3.0 specification for authentication API
5. quickstart.md (500+ lines) - Step-by-step setup guide with verification checklist

**Constitution Compliance Verification**:
- ✅ Principle I (Spec-First): Complete specification exists at specs/02-auth-db/spec.md
- ✅ Principle II (Security): JWT verification enforced, zero-trust architecture, secrets in env vars
- ✅ Principle III (Monorepo): Clear separation between frontend/ and backend/
- ✅ Principle IV (Agent-Driven): All development by Claude Code following Spec-Kit Plus
- ✅ Principle V (Tech Stack): Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth
- ✅ Principle VI (API-First): Backend exposes REST API with versioning (/api/v1/)

**Layered Implementation Strategy**:
- Layer 1: Database & Environment setup with connection verification
- Layer 2: Frontend authentication with token issuance verification
- Layer 3: Backend token verification with API endpoint testing
- Each layer must be verified before proceeding to next

## Outcome

- ✅ Impact: Complete implementation plan created with layered approach, all research completed, design artifacts generated, ready for task generation
- 🧪 Tests: Constitution compliance (6/6 passed), Research validation (5/5 completed), Design completeness (3/3 artifacts)
- 📁 Files: 5 files created (plan.md, research.md, data-model.md, contracts/auth-api.yaml, quickstart.md)
- 🔁 Next prompts: `/sp.tasks` (generate implementation tasks from plan)
- 🧠 Reflection: Successfully created comprehensive planning artifacts following user-specified layered approach with testability at each phase; research resolved all technical unknowns; design provides clear implementation guidance

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning phases completed successfully
- Graders run and results (PASS/FAIL): Constitution Check PASS (6/6), Research PASS (5/5 tasks), Design PASS (3/3 artifacts)
- Prompt variant (if applicable): User-specified layered approach with three phases (Database/Environment, Frontend Auth, Backend Auth)
- Next experiment (smallest change to try): Proceed to task generation with `/sp.tasks` to break down implementation plan into actionable tasks
