# Implementation Plan: Todo Task Management

**Branch**: `03-todo-crud` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/03-todo-crud/spec.md`

## Summary

Implement full CRUD operations for todo tasks with zero-trust security architecture. Users can create, view, update, and delete tasks through a dashboard interface. All operations enforce strict user data isolation by filtering queries based on authenticated user ID extracted from session tokens. The system uses a RESTful API backend (FastAPI) with a Next.js frontend, storing task data in Neon PostgreSQL with foreign key relationships to the existing user table from Phase 2 authentication system.

**Technical Approach**: Extend existing Phase 2 authentication infrastructure by adding a Task model with user_id foreign key, implementing REST endpoints at `/api/v1/tasks` with session token verification, and creating dashboard UI components with inline editing and confirmation dialogs.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x (strict mode)
- Backend: Python 3.12+

**Primary Dependencies**:
- Frontend: Next.js 16.1.1 (App Router), React 19, Tailwind CSS 3.x, Better Auth client
- Backend: FastAPI 0.128.0, SQLModel 0.0.31, uvicorn 0.40.0

**Storage**: Neon PostgreSQL (serverless) - shared database from Phase 2 authentication system

**Testing**:
- Frontend: Jest, React Testing Library, Playwright (E2E)
- Backend: pytest, httpx (API testing)

**Target Platform**: Web application (responsive design for desktop and mobile browsers)

**Project Type**: Web (monorepo with frontend/ and backend/ separation)

**Performance Goals**:
- Task list load: <2 seconds for up to 100 tasks
- Individual operations (create/update/delete): <3 seconds
- Concurrent users: 100+ without degradation

**Constraints**:
- Zero-trust security: All queries filtered by authenticated user ID
- Session token verification required on every backend request
- No pagination (load all tasks at once)
- Stable ordering by creation date (newest first)
- Maximum 500 tasks per user

**Scale/Scope**:
- Expected users: 100-1000 concurrent users
- Data volume: Up to 500 tasks per user
- API endpoints: 5 REST endpoints (GET /, POST /, GET /{id}, PATCH /{id}, DELETE /{id})
- UI components: 4 main components (TaskList, TaskForm, TaskItem, DeleteConfirmation)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Spec-First Development ✅ PASS

- ✅ Feature defined in `/specs/03-todo-crud/spec.md` before implementation
- ✅ Specification follows Spec-Kit Plus template structure
- ✅ All requirements documented with acceptance criteria
- ✅ Clarifications completed via `/sp.clarify` command

### II. Security & Authentication ✅ PASS

- ✅ All API endpoints require valid session token (from Phase 2 Better Auth)
- ✅ Session tokens verified in FastAPI using `get_current_user` dependency
- ✅ User identity derived from session token, never from request body
- ✅ Strict user data isolation: all queries filter by authenticated user ID (FR-010, FR-011, FR-012)
- ✅ Unauthorized requests return 401 (FR-029, FR-030)
- ✅ No secrets hardcoded; all use environment variables

**Note**: Phase 2 uses session tokens (not JWT), but the security principle is equivalent - stateless token verification with user identity extraction.

### III. Monorepo Architecture ✅ PASS

- ✅ Frontend in `frontend/` (Next.js App Router, TypeScript, Tailwind CSS)
- ✅ Backend in `backend/` (FastAPI, SQLModel, Neon PostgreSQL)
- ✅ Frontend never accesses database directly; all data via REST APIs
- ✅ Backend exposes RESTful APIs at `/api/v1/tasks`
- ✅ Clear separation of concerns maintained

### IV. Agent-Driven Development ✅ PASS

- ✅ All development performed by Claude Code
- ✅ Following Spec-Kit Plus methodology
- ✅ Systematic implementation following established patterns from Phase 2

### V. Tech Stack Compliance ✅ PASS

- ✅ Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- ✅ Backend: Python FastAPI, SQLModel
- ✅ Database: Neon Serverless PostgreSQL
- ✅ Authentication: Better Auth (Frontend) + session token verification (Backend)
- ✅ No alternative technologies introduced

### VI. API-First Backend Design ✅ PASS

- ✅ Stateless RESTful APIs with clear contracts
- ✅ All operations scoped to authenticated user
- ✅ Idempotent operations (PUT/PATCH for updates, DELETE for deletion)
- ✅ Standard HTTP status codes (200, 201, 400, 401, 404, 500)
- ✅ URL path versioning: `/api/v1/tasks`
- ✅ Input validation via Pydantic/SQLModel models
- ✅ Output sanitization in responses

**Constitution Check Result**: ✅ ALL GATES PASS - No violations, proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/03-todo-crud/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical research)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── tasks-api.yaml   # OpenAPI specification for /api/v1/tasks
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Specification quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

backend/
├── app/
│   ├── models/
│   │   ├── user.py           # Existing from Phase 2
│   │   ├── session.py        # Existing from Phase 2
│   │   └── task.py           # NEW: Task model with user_id FK
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py   # Existing from Phase 2
│   │       │   ├── health.py # Existing from Phase 2
│   │       │   └── tasks.py  # NEW: Task CRUD endpoints
│   │       └── router.py     # UPDATE: Add tasks router
│   ├── auth/
│   │   └── dependencies.py   # Existing: get_current_user
│   ├── config.py             # Existing configuration
│   ├── database.py           # Existing database connection
│   └── schemas/
│       └── task.py           # NEW: Pydantic schemas for requests/responses
├── tests/
│   ├── unit/
│   │   └── test_task_model.py
│   ├── integration/
│   │   └── test_tasks_api.py
│   └── conftest.py           # Existing test fixtures
├── main.py                   # UPDATE: Include tasks router
├── .env                      # Existing environment variables
└── pyproject.toml            # Existing dependencies

frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # UPDATE: Add task management UI
│   ├── sign-in/              # Existing from Phase 2
│   ├── sign-up/              # Existing from Phase 2
│   ├── api/auth/             # Existing from Phase 2
│   └── layout.tsx            # Existing root layout
├── components/
│   ├── user-menu.tsx         # Existing from Phase 2
│   ├── task-list.tsx         # NEW: Task list display
│   ├── task-item.tsx         # NEW: Individual task with inline edit
│   ├── task-form.tsx         # NEW: Create task form
│   └── delete-confirmation.tsx # NEW: Delete confirmation dialog
├── lib/
│   ├── auth.ts               # Existing Better Auth config
│   ├── auth-client.ts        # Existing Better Auth client
│   └── api/
│       └── tasks.ts          # NEW: Task API client functions
├── types/
│   └── task.ts               # NEW: TypeScript task interfaces
├── .env.local                # Existing environment variables
└── package.json              # UPDATE: Add any new dependencies

# Database migration (if needed)
migrations/
└── 003_create_tasks_table.sql  # NEW: Task table creation
```

**Structure Decision**: Web application structure selected based on existing Phase 2 monorepo architecture. Frontend and backend are clearly separated with REST API communication. Task feature extends existing authentication infrastructure by adding new models, endpoints, and UI components while reusing authentication dependencies and database connection.

## Complexity Tracking

> **No violations detected - this section is empty**

All constitutional principles are satisfied without exceptions. The implementation follows established patterns from Phase 2 authentication system and introduces no additional complexity beyond the feature requirements.

## Phase 0: Research & Technical Decisions

### Research Topics

1. **Task Model Design**
   - Decision: SQLModel with user_id foreign key to user table
   - Rationale: Maintains referential integrity, leverages existing Phase 2 user model, supports efficient filtering by user_id
   - Alternatives considered: Separate task service with user reference by ID only (rejected: loses referential integrity)

2. **API Endpoint Structure**
   - Decision: RESTful endpoints at `/api/v1/tasks` following REST conventions
   - Rationale: Consistent with Phase 2 API structure, standard HTTP methods, clear resource-oriented design
   - Alternatives considered: GraphQL (rejected: adds complexity, not needed for simple CRUD), RPC-style (rejected: less standard)

3. **Frontend State Management**
   - Decision: React hooks (useState, useEffect) with optimistic updates
   - Rationale: Simple, no additional dependencies, sufficient for task list management
   - Alternatives considered: Redux/Zustand (rejected: overkill for single-user task list), React Query (rejected: adds dependency)

4. **Inline Editing Implementation**
   - Decision: Component state toggle between view/edit modes with save/cancel buttons
   - Rationale: Matches clarification requirement (pencil button → inline edit), standard pattern, good UX
   - Alternatives considered: Modal dialog (rejected: breaks inline editing requirement), contentEditable (rejected: harder to control)

5. **Delete Confirmation Pattern**
   - Decision: Modal dialog with confirm/cancel buttons
   - Rationale: Matches clarification requirement, prevents accidental deletion, standard UX pattern
   - Alternatives considered: Undo toast (rejected: doesn't match confirmation requirement), no confirmation (rejected: risky)

6. **Task Ordering Strategy**
   - Decision: ORDER BY created_at DESC in SQL query
   - Rationale: Matches clarification (creation date, newest first), stable ordering, efficient database operation
   - Alternatives considered: Client-side sorting (rejected: less efficient), update_at ordering (rejected: doesn't match clarification)

7. **Session Token Verification**
   - Decision: Reuse existing `get_current_user` dependency from Phase 2
   - Rationale: Already implemented, tested, and working; maintains consistency
   - Alternatives considered: New verification logic (rejected: duplicates existing code)

8. **Error Handling Strategy**
   - Decision: HTTP status codes + JSON error responses with descriptive messages
   - Rationale: RESTful standard, consistent with Phase 2, easy to handle in frontend
   - Alternatives considered: Error codes (rejected: less standard), exceptions only (rejected: poor client experience)

### Technology Stack Validation

**Frontend**:
- ✅ Next.js 16.1.1 (App Router) - Existing from Phase 2
- ✅ TypeScript 5.x (strict mode) - Existing from Phase 2
- ✅ Tailwind CSS 3.x - Existing from Phase 2
- ✅ Better Auth client - Existing from Phase 2
- ✅ React 19 - Existing from Phase 2

**Backend**:
- ✅ FastAPI 0.128.0 - Existing from Phase 2
- ✅ SQLModel 0.0.31 - Existing from Phase 2
- ✅ Python 3.12+ - Existing from Phase 2
- ✅ uvicorn 0.40.0 - Existing from Phase 2

**Database**:
- ✅ Neon PostgreSQL - Existing from Phase 2
- ✅ Shared database with user and session tables

**No new dependencies required** - All necessary technologies already in place from Phase 2.

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete schema definition.

**Summary**:
- Task table with columns: id (UUID), title (VARCHAR 200), description (TEXT), completed (BOOLEAN), user_id (UUID FK), created_at (TIMESTAMP), updated_at (TIMESTAMP)
- Foreign key constraint: task.user_id → user.id (ON DELETE CASCADE)
- Index on user_id for efficient filtering
- Index on created_at for efficient ordering

### API Contracts

See [contracts/tasks-api.yaml](./contracts/tasks-api.yaml) for complete OpenAPI specification.

**Endpoints**:
1. `GET /api/v1/tasks` - List all user's tasks
2. `POST /api/v1/tasks` - Create new task
3. `GET /api/v1/tasks/{id}` - Get task by ID
4. `PATCH /api/v1/tasks/{id}` - Update task (title, description, completed)
5. `DELETE /api/v1/tasks/{id}` - Delete task

**Authentication**: All endpoints require `Authorization: Bearer <session_token>` header

**Response Codes**:
- 200: Success (GET, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (accessing another user's task)
- 404: Not Found (task doesn't exist)
- 500: Internal Server Error

### Developer Quickstart

See [quickstart.md](./quickstart.md) for complete developer guide.

**Quick Setup**:
1. Ensure Phase 2 authentication system is running
2. Run database migration to create tasks table
3. Start backend server (already running from Phase 2)
4. Start frontend dev server (already running from Phase 2)
5. Navigate to dashboard to see task management UI

## Implementation Phases

### Phase 2: Task Breakdown

**Note**: Detailed task breakdown will be generated by `/sp.tasks` command (not part of this plan).

**High-Level Task Categories**:

1. **Backend - Database & Models** (Priority: P1)
   - Create Task SQLModel with validation
   - Create database migration script
   - Add task-user relationship with foreign key
   - Create Pydantic schemas for request/response

2. **Backend - API Endpoints** (Priority: P1)
   - Implement GET /api/v1/tasks (list)
   - Implement POST /api/v1/tasks (create)
   - Implement GET /api/v1/tasks/{id} (detail)
   - Implement PATCH /api/v1/tasks/{id} (update)
   - Implement DELETE /api/v1/tasks/{id} (delete)
   - Add user ownership validation to all endpoints
   - Register tasks router in main.py

3. **Backend - Testing** (Priority: P2)
   - Unit tests for Task model
   - Integration tests for all API endpoints
   - Security tests for user isolation
   - Edge case tests (invalid IDs, unauthorized access)

4. **Frontend - API Client** (Priority: P1)
   - Create task API client functions
   - Add TypeScript interfaces for Task type
   - Implement error handling

5. **Frontend - UI Components** (Priority: P1)
   - Create TaskForm component (create new tasks)
   - Create TaskList component (display all tasks)
   - Create TaskItem component (view/edit/delete single task)
   - Create DeleteConfirmation dialog component
   - Implement inline editing with pencil button
   - Add completion toggle checkbox
   - Add visual styling for completed tasks (strikethrough + gray)

6. **Frontend - Dashboard Integration** (Priority: P1)
   - Update dashboard page with task management UI
   - Add loading states
   - Add error handling and display
   - Add empty state message

7. **Frontend - Testing** (Priority: P2)
   - Component tests for all new components
   - Integration tests for task workflows
   - E2E tests for complete user journeys

8. **Documentation & Polish** (Priority: P3)
   - Update README with task management features
   - Add API documentation
   - Add troubleshooting guide
   - Code cleanup and optimization

### Dependencies Between Phases

```text
Phase 1 (Backend Models) → Phase 2 (Backend API) → Phase 3 (Backend Tests)
                                    ↓
Phase 4 (Frontend API Client) → Phase 5 (Frontend UI) → Phase 6 (Dashboard Integration) → Phase 7 (Frontend Tests)
                                                                                                    ↓
                                                                                            Phase 8 (Documentation)
```

**Critical Path**: Backend Models → Backend API → Frontend API Client → Frontend UI → Dashboard Integration

**Parallel Opportunities**:
- Backend testing can run parallel with frontend development
- Frontend component development can be parallelized (TaskForm, TaskList, TaskItem, DeleteConfirmation)
- Documentation can be written parallel with testing

## Risk Assessment

### Technical Risks

1. **Database Migration Conflicts** (Medium Risk)
   - Risk: Migration script conflicts with existing Phase 2 schema
   - Mitigation: Test migration on development database first, use transaction-safe migrations
   - Contingency: Manual rollback script prepared

2. **Session Token Verification Issues** (Low Risk)
   - Risk: Session token format changes or verification fails
   - Mitigation: Reuse existing `get_current_user` dependency (already tested in Phase 2)
   - Contingency: Debug with token inspection, verify Better Auth configuration

3. **User Data Isolation Bugs** (High Risk - Security Critical)
   - Risk: Query filtering by user_id fails, exposing other users' tasks
   - Mitigation: Comprehensive security testing, code review of all queries, integration tests with multiple users
   - Contingency: Immediate rollback if security issue detected

4. **Performance Degradation with Large Task Lists** (Medium Risk)
   - Risk: Loading 500 tasks takes >2 seconds
   - Mitigation: Database indexing on user_id and created_at, query optimization
   - Contingency: Implement pagination if performance targets not met (requires spec amendment)

### Implementation Risks

1. **Inline Editing Complexity** (Low Risk)
   - Risk: Inline editing state management becomes complex
   - Mitigation: Use simple component state, clear separation of view/edit modes
   - Contingency: Simplify to modal-based editing if inline proves too complex

2. **Optimistic Updates Race Conditions** (Medium Risk)
   - Risk: UI updates before server confirms, then server fails
   - Mitigation: Implement proper error handling, revert optimistic updates on failure
   - Contingency: Remove optimistic updates, use loading states only

3. **CORS Configuration Issues** (Low Risk)
   - Risk: Frontend-backend communication blocked by CORS
   - Mitigation: CORS already configured in Phase 2, no changes needed
   - Contingency: Verify CORS middleware includes /api/v1/tasks routes

## Acceptance Criteria

### Functional Acceptance

- ✅ Users can view all their tasks in a scrollable list
- ✅ Users can create new tasks with title and optional description
- ✅ Users can mark tasks as complete/incomplete with visual feedback
- ✅ Users can edit task title and description via inline editing (pencil button)
- ✅ Users can delete tasks after confirming in dialog
- ✅ Tasks are ordered by creation date (newest first)
- ✅ Completed tasks show strikethrough text and gray color
- ✅ Empty state message displays when user has no tasks
- ✅ Loading states display during operations
- ✅ Error messages display when operations fail

### Security Acceptance

- ✅ All API endpoints require valid session token
- ✅ Users can only access their own tasks (100% isolation)
- ✅ Attempting to access another user's task returns 403 Forbidden
- ✅ No task data leaks between users under any circumstances
- ✅ All queries filter by authenticated user ID from session token

### Performance Acceptance

- ✅ Task list loads in <2 seconds for up to 100 tasks
- ✅ Create/update/delete operations complete in <3 seconds
- ✅ System handles 100 concurrent users without degradation
- ✅ Task list remains responsive with up to 500 tasks

### Quality Acceptance

- ✅ All backend endpoints have integration tests
- ✅ All frontend components have unit tests
- ✅ E2E tests cover complete user workflows
- ✅ Code follows TypeScript/Python style guidelines
- ✅ No console errors or warnings in browser
- ✅ API documentation complete and accurate

## Next Steps

1. **Generate detailed tasks**: Run `/sp.tasks` to create task breakdown in `tasks.md`
2. **Begin implementation**: Execute tasks following TDD principles
3. **Continuous validation**: Verify against acceptance criteria throughout implementation
4. **Create ADRs**: Document any architecturally significant decisions during implementation

---

**Plan Status**: ✅ Complete - Ready for task generation via `/sp.tasks`
