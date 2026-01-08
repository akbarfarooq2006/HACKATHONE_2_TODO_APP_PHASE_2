# Tasks: Monorepo Foundation Setup

**Input**: Design documents from `/specs/01-monorepo-init/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this feature as testing framework setup is explicitly out of scope.

**Organization**: Tasks are grouped logically by Prerequisites, Frontend, Backend, and Documentation to enable clear execution flow.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/` at repository root
- Root-level files: `.gitignore`, `README.md`

---

## Phase 1: Prerequisites & Validation

**Purpose**: Verify system prerequisites and ensure clean initialization environment

**User Story**: US1 - Developer Environment Initialization (Priority: P1)

- [x] T001 [US1] Verify Node.js version >= 18 is installed using `node --version`
- [x] T002 [US1] Verify Python version >= 3.11 is installed using `python --version`
- [x] T003 [US1] Verify npm is available using `npm --version`
- [x] T004 [US1] Verify uv package manager is available using `uv --version`
- [x] T005 [US1] Check that frontend/ directory does not exist at project root
- [x] T006 [US1] Check that backend/ directory does not exist at project root

**Checkpoint**: All prerequisites verified - initialization can proceed safely

---

## Phase 2: Frontend Initialization

**Purpose**: Initialize Next.js 16+ frontend with App Router, TypeScript, and Tailwind CSS

**User Stories**: US1 (Developer Environment Initialization) + US3 (Frontend Application Verification)

### Frontend Project Setup

- [x] T007 [US1] Initialize Next.js 16+ application in frontend/ directory using `npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- [x] T008 [US1] Verify Next.js version >= 16.0.0 in frontend/package.json
- [x] T009 [US1] Verify App Router structure exists (frontend/app/ directory, not pages/)
- [x] T010 [US3] Verify TypeScript strict mode is enabled in frontend/tsconfig.json

### Frontend Configuration

- [x] T011 [P] [US3] Verify Tailwind CSS is configured in frontend/tailwind.config.js
- [x] T012 [P] [US3] Verify PostCSS is configured in frontend/postcss.config.js
- [x] T013 [P] [US1] Clean up default boilerplate content in frontend/app/page.tsx (remove example content, keep minimal starter code)
- [x] T014 [P] [US1] Update frontend/app/page.tsx with Phase 2 Todo App heading and initialization message

### Frontend Environment Template

- [x] T015 [US1] Create frontend/.env.example with placeholder variables for future features (API URL, Auth domain, Auth client ID, Feature flags)

### Frontend Verification

- [x] T016 [US3] Start frontend development server using `cd frontend && npm run dev` and verify it starts without errors
- [x] T017 [US3] Verify frontend loads in browser at http://localhost:3000 (or auto-incremented port) without console errors
- [x] T018 [US3] Verify TypeScript compilation succeeds with no errors
- [x] T019 [US1] Stop frontend development server

**Checkpoint**: Frontend application initialized, configured, and verified - ready for feature development

---

## Phase 3: Backend Initialization

**Purpose**: Initialize Python FastAPI backend with uvicorn and SQLModel

**User Stories**: US1 (Developer Environment Initialization) + US2 (Backend API Verification)

### Backend Project Setup

- [x] T020 [US1] Create backend/ directory at project root
- [x] T021 [US1] Initialize uv project in backend/ using `cd backend && uv init`
- [x] T022 [US1] Configure backend/pyproject.toml with project metadata (name: "backend", version: "0.1.0", description: "Phase 2 Todo App Backend", requires-python: ">=3.11,<4.0")
- [x] T023 [US2] Add FastAPI dependency using `uv add fastapi`
- [x] T024 [US2] Add uvicorn dependency using `uv add uvicorn`
- [x] T025 [US2] Add SQLModel dependency using `uv add sqlmodel`
- [x] T026 [US2] Verify all dependencies are present in backend/pyproject.toml

### Backend Application Structure

- [x] T027 [P] [US1] Create backend/app/ directory
- [x] T028 [P] [US1] Create backend/app/__init__.py (empty package initialization file)
- [x] T029 [P] [US1] Create backend/app/api/ directory for future API routes
- [x] T030 [P] [US1] Create backend/app/api/__init__.py (empty package initialization file)

### Backend Health Endpoint Implementation

- [x] T031 [US2] Create backend/app/main.py with FastAPI application initialization (title: "Phase 2 Todo App Backend", version: "0.1.0", description: "Backend API for Phase 2 Todo Application")
- [x] T032 [US2] Implement health check endpoint at GET /api/v1/health in backend/app/main.py returning JSON with status, service, and version fields

### Backend Environment Template

- [x] T033 [US1] Create backend/.env.example with placeholder variables for future features (Database URL, JWT secret, Server config, CORS origins)

### Backend Verification

- [x] T034 [US2] Start backend development server using `cd backend && uv run uvicorn app.main:app --reload` and verify it starts without errors
- [x] T035 [US2] Verify health check endpoint responds at http://localhost:8000/api/v1/health with 200 status code
- [x] T036 [US2] Verify health check endpoint returns valid JSON payload with status="healthy", service="backend", version="0.1.0"
- [x] T037 [US1] Stop backend development server

**Checkpoint**: Backend application initialized, health endpoint functional, and verified - ready for feature development

---

## Phase 4: Documentation & Final Verification

**Purpose**: Create root-level documentation and perform final integration verification

**User Story**: US1 - Developer Environment Initialization (Priority: P1)

### Root Documentation

- [x] T038 [P] [US1] Create/update root README.md with project overview, directory structure explanation, and quickstart instructions
- [x] T039 [P] [US1] Document how to start frontend development server in root README.md (cd frontend && npm run dev)
- [x] T040 [P] [US1] Document how to start backend development server in root README.md (cd backend && uv run uvicorn app.main:app --reload)
- [x] T041 [P] [US1] Add links to frontend/README.md and backend/README.md in root README.md
- [x] T042 [P] [US1] Create/update .gitignore at project root with node_modules/, __pycache__/, .env, .next/, uv.lock, *.pyc, .DS_Store

### Final Integration Verification

- [x] T043 [US1] Start both frontend and backend development servers concurrently
- [x] T044 [US1] Verify frontend is accessible at http://localhost:3000 (or auto-incremented port)
- [x] T045 [US1] Verify backend health endpoint is accessible at http://localhost:8000/api/v1/health (or auto-incremented port)
- [x] T046 [US1] Verify both servers auto-reload on file changes
- [x] T047 [US1] Verify port auto-increment behavior works if default ports are in use
- [x] T048 [US1] Verify all success criteria from spec.md are met (servers start < 30s, health endpoint responds, frontend loads without errors, dependencies verifiable, structure matches constitution, tech stack matches constitution)

**Checkpoint**: Monorepo foundation complete and fully verified - ready for Phase 2 feature development

---

## Dependencies & Execution Order

### Phase Dependencies

- **Prerequisites (Phase 1)**: No dependencies - MUST complete first before any initialization
- **Frontend (Phase 2)**: Depends on Prerequisites completion
- **Backend (Phase 3)**: Depends on Prerequisites completion
- **Documentation (Phase 4)**: Depends on Frontend AND Backend completion

### Parallel Opportunities

**Within Prerequisites Phase**:
- Tasks T001-T004 (version checks) can run in parallel
- Tasks T005-T006 (directory checks) can run in parallel

**Between Frontend and Backend Phases**:
- Phase 2 (Frontend) and Phase 3 (Backend) can run in parallel after Phase 1 completes
- This is the major parallelization opportunity

**Within Frontend Phase**:
- T011, T012, T013, T014 (configuration tasks) can run in parallel after T010
- T015 (environment template) can run in parallel with configuration tasks

**Within Backend Phase**:
- T027, T028, T029, T030 (directory structure) can run in parallel after T026

**Within Documentation Phase**:
- T038, T039, T040, T041, T042 (documentation tasks) can all run in parallel

---

## Parallel Example: Frontend and Backend Together

```bash
# After Phase 1 (Prerequisites) completes, launch both phases in parallel:

# Terminal 1: Frontend Initialization
Task: "Initialize Next.js 16+ application in frontend/ directory"
Task: "Verify Next.js version >= 16.0.0 in frontend/package.json"
Task: "Verify App Router structure exists"
# ... continue with all frontend tasks

# Terminal 2: Backend Initialization (running simultaneously)
Task: "Create backend/ directory at project root"
Task: "Initialize uv project in backend/"
Task: "Configure backend/pyproject.toml with project metadata"
# ... continue with all backend tasks
```

---

## Implementation Strategy

### Sequential Execution (Single Developer)

1. **Phase 1**: Complete all prerequisite checks (T001-T006)
2. **Phase 2**: Complete frontend initialization (T007-T019)
3. **Phase 3**: Complete backend initialization (T020-T037)
4. **Phase 4**: Complete documentation and verification (T038-T048)

**Estimated Time**: 45-60 minutes

### Parallel Execution (Optimal)

1. **Phase 1**: Complete all prerequisite checks (T001-T006) - ~2 minutes
2. **Phases 2 & 3 in parallel**:
   - Developer A or Terminal 1: Frontend (T007-T019) - ~15-20 minutes
   - Developer B or Terminal 2: Backend (T020-T037) - ~15-20 minutes
3. **Phase 4**: Documentation and verification (T038-T048) - ~10 minutes

**Estimated Time**: 30-35 minutes

### MVP Scope

The MVP for this feature is the complete monorepo initialization - all phases must be completed as this is the foundation for all future work. There is no partial delivery option.

**MVP = All Phases (1-4)**: Complete monorepo with both frontend and backend initialized and verified

---

## User Story Mapping

### User Story 1 - Developer Environment Initialization (P1) 🎯 PRIMARY

**Tasks**: T001-T006 (Prerequisites), T007-T015 (Frontend Setup), T020-T033 (Backend Setup), T038-T048 (Documentation & Verification)

**Independent Test**: Verify both frontend/ and backend/ directories exist, contain initialized projects with correct dependencies, and can be started successfully with their respective development servers.

**Acceptance Criteria**:
- ✅ Both frontend/ and backend/ directories exist at root level (T005, T006, T007, T020)
- ✅ Backend health endpoint at /api/v1/health responds with 200 status (T035, T036)
- ✅ Frontend loads without errors and displays clean landing page (T017, T018)

---

### User Story 2 - Backend API Verification (P2)

**Tasks**: T023-T026 (Dependencies), T031-T032 (Health Endpoint), T034-T036 (Backend Verification)

**Independent Test**: Check that FastAPI, uvicorn, and SQLModel are installed and that the health check endpoint is accessible.

**Acceptance Criteria**:
- ✅ fastapi, uvicorn, and sqlmodel present in backend environment (T026)
- ✅ GET request to /api/v1/health returns 200 OK with valid JSON payload (T035, T036)

---

### User Story 3 - Frontend Application Verification (P3)

**Tasks**: T008-T014 (Frontend Configuration), T016-T019 (Frontend Verification)

**Independent Test**: Verify Next.js configuration, TypeScript setup, and Tailwind CSS integration.

**Acceptance Criteria**:
- ✅ Next.js 16+ with App Router, TypeScript, and Tailwind CSS properly configured (T008, T009, T010, T011)
- ✅ Development server starts with no TypeScript compilation errors (T016, T018)
- ✅ Default boilerplate cleaned up, only essential starter code remains (T013, T014)

---

## Success Criteria Validation

| Success Criterion | Validation Tasks | Expected Result |
|-------------------|------------------|-----------------|
| SC-001: Servers start within 30s | T016, T034, T043 | Both frontend and backend start < 30 seconds |
| SC-002: Health endpoint responds | T035, T036, T045 | 200 OK with JSON payload |
| SC-003: Frontend loads without errors | T017, T044 | Zero console errors/warnings |
| SC-004: Dependencies verifiable | T008, T026 | All required deps in package.json and pyproject.toml |
| SC-005: Structure matches constitution | T009, T027-T030 | Exact match to Principle III |
| SC-006: Tech stack matches constitution | T008, T010, T011, T023-T025 | All constitutional techs present |

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Prerequisites are critical**: All Phase 1 tasks must pass before proceeding
- **Fail-fast approach**: If any prerequisite check fails, stop immediately with clear error message
- **Port auto-increment**: Both Next.js and uvicorn handle this natively - no additional implementation needed
- **Environment templates**: Contain placeholders only, no actual secrets or configuration values
- **Verification tasks**: Essential for ensuring initialization succeeded correctly
- **Commit strategy**: Commit after each phase completion for clear history
- **No tests**: Testing framework setup is explicitly out of scope for this initialization feature

---

## Task Summary

- **Total Tasks**: 48
- **Phase 1 (Prerequisites)**: 6 tasks
- **Phase 2 (Frontend)**: 13 tasks
- **Phase 3 (Backend)**: 18 tasks
- **Phase 4 (Documentation)**: 11 tasks
- **Parallelizable Tasks**: 15 tasks marked with [P]
- **User Story 1 Tasks**: 32 tasks (primary initialization)
- **User Story 2 Tasks**: 9 tasks (backend verification)
- **User Story 3 Tasks**: 7 tasks (frontend verification)

**Estimated Completion Time**:
- Sequential: 45-60 minutes
- Parallel (Frontend + Backend): 30-35 minutes
