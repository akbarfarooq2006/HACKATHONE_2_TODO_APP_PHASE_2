# Implementation Plan: Monorepo Foundation Setup

**Branch**: `01-monorepo-init` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/01-monorepo-init/spec.md`

## Summary

This feature establishes the foundational monorepo structure for Phase 2 development by initializing separate frontend and backend directories with their respective technology stacks. The implementation creates a Next.js 16+ frontend (App Router, TypeScript, Tailwind CSS) and a Python FastAPI backend (uvicorn, SQLModel) with proper dependency management, configuration templates, and a basic health check endpoint. The approach prioritizes fail-fast validation, clear error messaging, and developer experience through automated port conflict resolution and comprehensive prerequisite checking.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with Next.js 16+
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 16+, React 18+, Tailwind CSS 3.x
- Backend: FastAPI 0.100+, uvicorn 0.23+, SQLModel 0.0.14+
- Package Managers: npm (frontend), uv (backend)

**Storage**: N/A (database integration deferred to future feature)

**Testing**: Not in scope for initialization (testing framework setup deferred)

**Target Platform**:
- Frontend: Web browsers (modern evergreen browsers)
- Backend: Linux/macOS/WSL development environments

**Project Type**: Web application (monorepo with frontend + backend)

**Performance Goals**:
- Dependency installation: < 5 minutes on standard internet connection
- Development server startup: < 30 seconds for both frontend and backend
- Health check endpoint response: < 100ms

**Constraints**:
- Must use constitutional tech stack (non-negotiable)
- Must fail fast on prerequisite violations
- Must not modify existing directories
- Must support concurrent development server instances (via port auto-increment)

**Scale/Scope**:
- 2 applications (frontend, backend)
- ~10-15 configuration files
- 1 API endpoint (health check)
- 2 environment template files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I - Spec-First Development
**Status**: PASS
- Specification created and clarified before implementation
- All requirements documented in spec.md
- Clarification session completed with 5 resolved questions

### ✅ Principle II - Security & Authentication
**Status**: PASS (Not Applicable)
- No authentication required for initialization feature
- Health check endpoint is intentionally public (no JWT required)
- Environment templates include placeholders for future JWT secrets

### ✅ Principle III - Monorepo Architecture
**Status**: PASS
- Creates required `frontend/` and `backend/` directory structure
- Enforces clear separation of concerns
- Frontend will access backend only via REST APIs (foundation for future features)

### ✅ Principle IV - Agent-Driven Development
**Status**: PASS
- Implementation will be performed by Claude Code
- Following Spec-Kit Plus methodology
- All changes traceable to specification

### ✅ Principle V - Tech Stack Compliance
**Status**: PASS
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS ✓
- Backend: Python FastAPI, SQLModel ✓
- Database: Neon PostgreSQL (prepared for, not connected yet) ✓
- No alternative technologies introduced

### ✅ Principle VI - API-First Backend Design
**Status**: PASS
- Health check endpoint follows RESTful conventions
- Uses URL path versioning (`/api/v1/health`)
- Returns standard HTTP status codes
- JSON response format

**Overall Gate Status**: ✅ PASS - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/01-monorepo-init/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Data structures (minimal for this feature)
├── quickstart.md        # Phase 1: Developer quickstart guide
├── contracts/           # Phase 1: API contracts
│   └── health-api.yaml  # OpenAPI spec for health check endpoint
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Specification quality checklist (completed)
└── tasks.md             # Phase 2: Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

frontend/
├── app/                 # Next.js 16+ App Router directory
│   ├── layout.tsx       # Root layout component
│   ├── page.tsx         # Home page (cleaned boilerplate)
│   └── globals.css      # Global styles with Tailwind directives
├── public/              # Static assets
├── .env.example         # Environment variable template
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration (strict mode)
├── package.json         # npm dependencies and scripts
└── README.md            # Frontend-specific documentation

backend/
├── app/                 # FastAPI application directory
│   ├── __init__.py      # Package initialization
│   ├── main.py          # FastAPI app entry point with health endpoint
│   └── api/             # API routes directory (prepared for future)
│       └── __init__.py
├── .env.example         # Environment variable template
├── pyproject.toml       # uv project configuration with dependencies
├── uv.lock              # uv lock file (generated)
└── README.md            # Backend-specific documentation

# Root-level files
.gitignore               # Ignore node_modules, __pycache__, .env, etc.
README.md                # Root monorepo documentation
```

**Structure Decision**: Selected Option 2 (Web application) from template. This structure enforces constitutional Principle III (Monorepo Architecture) by creating separate `frontend/` and `backend/` directories at the project root. Each directory is independently runnable with its own package manager, dependencies, and development server. This separation enables:
- Independent scaling and deployment (future)
- Clear API boundaries between presentation and business logic
- Technology-specific tooling and configuration
- Parallel development workflows

## Complexity Tracking

> **No violations to justify** - All constitutional principles are satisfied without exceptions.

## Phase 0: Research & Technology Decisions

### Research Areas

1. **Next.js 16+ App Router Best Practices**
   - Decision: Use App Router (not Pages Router) with TypeScript strict mode
   - Rationale: App Router is the recommended approach for new Next.js projects, provides better performance with React Server Components, and aligns with modern React patterns
   - Alternatives considered: Pages Router (legacy, not recommended for new projects)

2. **FastAPI Project Structure**
   - Decision: Use `app/` directory with `main.py` entry point and `api/` subdirectory for routes
   - Rationale: Standard FastAPI convention, scales well as features are added, clear separation of concerns
   - Alternatives considered: Flat structure (doesn't scale), `src/` directory (less common in Python)

3. **Python Dependency Management with uv**
   - Decision: Use uv with pyproject.toml for dependency management
   - Rationale: Constitutional requirement, faster than pip, better dependency resolution, modern Python tooling
   - Alternatives considered: pip + requirements.txt (slower, less reliable), poetry (not constitutional)

4. **Port Conflict Resolution Strategy**
   - Decision: Auto-increment to next available port with console notification
   - Rationale: Matches modern dev tool behavior (Vite, CRA), supports multiple instances, better DX than failing
   - Alternatives considered: Fail with error (poor DX), random port (unpredictable), manual config only (inconvenient)

5. **Environment Variable Template Content**
   - Decision: Include placeholder variables with descriptive comments for future features
   - Rationale: Serves as documentation, prevents confusion about what's needed now vs. later, guides future development
   - Alternatives considered: Empty files (no guidance), working dummy values (misleading), only current needs (incomplete)

6. **Prerequisite Validation Approach**
   - Decision: Check all prerequisites upfront before any initialization, fail with detailed error listing all missing tools
   - Rationale: Prevents partial initialization, clear actionable errors, better developer experience
   - Alternatives considered: Check as needed (partial failures), auto-install (security/permission issues), skip checks (poor DX)

7. **TypeScript Configuration**
   - Decision: Enable strict mode in tsconfig.json
   - Rationale: Constitutional requirement (FR-009), catches more errors at compile time, enforces better code quality
   - Alternatives considered: Loose mode (not constitutional, lower quality)

8. **Tailwind CSS Integration**
   - Decision: Use Tailwind CSS with Next.js built-in PostCSS support
   - Rationale: Constitutional requirement, official Next.js integration, zero additional configuration needed
   - Alternatives considered: Manual PostCSS setup (unnecessary complexity)

### Technology Versions (Pinned)

**Frontend**:
- next: ^16.0.0 (latest stable 16.x)
- react: ^18.3.0
- react-dom: ^18.3.0
- typescript: ^5.3.0
- tailwindcss: ^3.4.0
- @types/node: ^20.0.0
- @types/react: ^18.3.0
- @types/react-dom: ^18.3.0

**Backend**:
- python: >=3.11,<4.0
- fastapi: ^0.109.0
- uvicorn: ^0.27.0
- sqlmodel: ^0.0.14

**Rationale for Pinning**: Prevents breaking changes from automatic updates, ensures reproducible builds, documents tested versions per Risk 1 mitigation strategy.

## Phase 1: Design & Contracts

### Data Model

For this initialization feature, there is no persistent data model. The "entities" are file system structures and configuration files. See [data-model.md](./data-model.md) for details.

**Key Structures**:
- Directory tree (frontend/, backend/)
- Configuration files (package.json, pyproject.toml, tsconfig.json, etc.)
- Environment templates (.env.example files)

### API Contracts

**Health Check Endpoint**: `GET /api/v1/health`

See [contracts/health-api.yaml](./contracts/health-api.yaml) for full OpenAPI specification.

**Summary**:
- **Method**: GET
- **Path**: `/api/v1/health`
- **Authentication**: None (public endpoint)
- **Response**: 200 OK with JSON payload
  ```json
  {
    "status": "healthy",
    "service": "backend",
    "version": "0.1.0"
  }
  ```

### Implementation Sequence

1. **Prerequisite Validation** (FR-001)
   - Check Node.js >= 18
   - Check Python >= 3.11
   - Check npm available
   - Check uv available
   - Fail with detailed error if any missing

2. **Directory Existence Check** (FR-002)
   - Check if frontend/ exists
   - Check if backend/ exists
   - Fail with clear error if either exists

3. **Frontend Initialization** (FR-003, FR-008, FR-009, FR-010)
   - Run: `npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
   - Verify Next.js 16+ installed
   - Verify App Router structure created
   - Verify TypeScript strict mode in tsconfig.json

4. **Frontend Cleanup** (FR-011)
   - Remove example content from app/page.tsx
   - Keep minimal starter code
   - Remove unnecessary boilerplate

5. **Frontend Environment Template** (FR-014)
   - Create frontend/.env.example with placeholders:
     ```
     # API Configuration (for future features)
     # NEXT_PUBLIC_API_URL=http://localhost:8000

     # Authentication (for future features)
     # NEXT_PUBLIC_AUTH_DOMAIN=
     # NEXT_PUBLIC_AUTH_CLIENT_ID=
     ```

6. **Backend Initialization** (FR-004, FR-005)
   - Create backend/ directory
   - Run: `cd backend && uv init`
   - Configure pyproject.toml with project metadata

7. **Backend Dependencies** (FR-006)
   - Run: `uv add fastapi uvicorn sqlmodel`
   - Verify dependencies in pyproject.toml

8. **Backend Application Structure** (FR-007)
   - Create app/ directory
   - Create app/__init__.py
   - Create app/main.py with FastAPI app and health endpoint
   - Create app/api/ directory for future routes

9. **Backend Environment Template** (FR-014)
   - Create backend/.env.example with placeholders:
     ```
     # Database Configuration (for future features)
     # DATABASE_URL=postgresql://user:password@localhost:5432/dbname

     # Authentication (for future features)
     # JWT_SECRET_KEY=your-secret-key-here
     # JWT_ALGORITHM=HS256
     # JWT_EXPIRATION_MINUTES=30

     # Server Configuration
     # HOST=0.0.0.0
     # PORT=8000
     ```

10. **Root Documentation**
    - Create/update root README.md with:
      - Project overview
      - Directory structure explanation
      - How to start frontend (cd frontend && npm run dev)
      - How to start backend (cd backend && uv run uvicorn app.main:app --reload)
      - Links to frontend and backend READMEs

11. **Verification** (FR-012, FR-013)
    - Test frontend dev server startup
    - Test backend dev server startup
    - Verify port auto-increment behavior
    - Verify health endpoint responds correctly

### Developer Quickstart

See [quickstart.md](./quickstart.md) for complete developer onboarding guide.

## Phase 2: Task Breakdown

Task breakdown will be generated by the `/sp.tasks` command and documented in [tasks.md](./tasks.md).

**Expected Task Categories**:
1. Prerequisite validation implementation
2. Directory existence checking
3. Frontend initialization and configuration
4. Frontend cleanup and customization
5. Backend initialization and configuration
6. Backend health endpoint implementation
7. Environment template creation
8. Documentation creation
9. Integration testing and verification

## Risks & Mitigations (from Spec)

### Risk 1: Version Compatibility Issues
**Mitigation in Plan**: Pin specific versions in package.json and pyproject.toml (documented in Phase 0 research)

### Risk 2: Missing System Prerequisites
**Mitigation in Plan**: Implement comprehensive prerequisite checking as first step (FR-001, Phase 1 step 1)

### Risk 3: Port Conflicts
**Mitigation in Plan**: Document port auto-increment behavior; Next.js and uvicorn both support this natively (FR-013)

## Success Criteria Validation

| Success Criterion | Validation Method | Expected Result |
|-------------------|-------------------|-----------------|
| SC-001: Servers start within 30s | Time both dev server startups | Both < 30 seconds |
| SC-002: Health endpoint responds | curl http://localhost:8000/api/v1/health | 200 OK with JSON |
| SC-003: Frontend loads without errors | Open browser, check console | Zero errors/warnings |
| SC-004: Dependencies verifiable | Check package.json and pyproject.toml | All required deps present |
| SC-005: Structure matches constitution | Compare directory tree to Principle III | Exact match |
| SC-006: Tech stack matches constitution | Verify installed packages | All constitutional techs present |

## Next Steps

1. ✅ Complete this plan (current step)
2. ⏭️ Run `/sp.tasks` to generate implementation task breakdown
3. ⏭️ Run `/sp.implement` to execute tasks
4. ⏭️ Verify all success criteria
5. ⏭️ Create PR for review

---

**Plan Status**: ✅ Complete - Ready for task generation
**Last Updated**: 2026-01-09
**Next Command**: `/sp.tasks`
