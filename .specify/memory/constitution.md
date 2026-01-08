# Phase 2 Todo App Constitution

<!--
Sync Impact Report:
- Version: NEW → 1.0.0 (Initial constitution for Phase 2)
- Ratification: 2026-01-08
- Principles defined: 6 core principles
- Sections added: Tech Stack, Security Requirements, Development Workflow, Governance
- Templates requiring updates:
  ✅ constitution.md (this file)
  ⚠ plan-template.md (pending validation)
  ⚠ spec-template.md (pending validation)
  ⚠ tasks-template.md (pending validation)
- Follow-up: Validate dependent templates align with new principles
-->

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

Every feature MUST be defined in `/specs/<feature>/` before any implementation begins.
- All specifications must follow the Spec-Kit Plus template structure
- Claude Code must reference specs using `@specs/` paths
- No code may be written without a corresponding approved specification
- Specifications are the single source of truth for requirements

**Rationale**: Prevents scope creep, ensures alignment, and maintains traceability between
requirements and implementation in an agent-driven workflow.

### II. Security & Authentication (NON-NEGOTIABLE)

Every API request MUST require a valid JWT token verified by the backend.
- JWT tokens are verified in FastAPI using a shared secret from environment variables
- User identity MUST be derived from JWT claims, never from request body
- API endpoints MUST enforce strict user data isolation (users can only access their own data)
- Any request without a valid token returns 401 Unauthorized
- No secrets or tokens may be hardcoded; all must use environment variables

**Rationale**: Ensures multi-user security, prevents unauthorized access, and protects user
data privacy in a stateless authentication architecture.

### III. Monorepo Architecture (NON-NEGOTIABLE)

The project follows a strict monorepo structure with clear separation of concerns.
- `frontend/` contains Next.js 16+ application (App Router, TypeScript, Tailwind CSS)
- `backend/` contains Python FastAPI application (SQLModel ORM, Neon PostgreSQL)
- Frontend NEVER accesses database directly; all data access via backend REST APIs
- Backend exposes RESTful APIs only; no direct frontend coupling
- Shared types/contracts may exist but must be explicitly defined

**Rationale**: Enforces separation of concerns, enables independent scaling, and maintains
clear boundaries between presentation and business logic layers.

### IV. Agent-Driven Development (NON-NEGOTIABLE)

All development must be performed by Claude Code following Spec-Kit Plus methodology.
- No manu

**Rationale**: Ensures consistency, maintains spec-driven discipline, and leverages AI
capabilities for systematic implementation following established patterns.

### V. Tech Stack Compliance (NON-NEGOTIABLE)

The technology stack is fixed and non-negotiable for Phase 2.
- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth (Frontend) + JWT verification (Backend)
- No alternative technologies may be introduced without constitutional amendment

**Rationale**: Prevents technology sprawl, ensures team expertise alignment, and maintains
architectural consistency throughout Phase 2 development.

### VI. API-First Backend Design

Backend services must expose stateless RESTful APIs with clear contracts.
- All task operations are scoped to the authenticated user
- APIs must be idempotent where appropriate (PUT, DELETE)
- Error responses must use standard HTTP status codes with descriptive messages
- API versioning strategy: URL path versioning (`/api/v1/...`)
- All endpoints must validate input and sanitize output

**Rationale**: Enables frontend flexibility, supports future mobile clients, and ensures
predictable, testable backend behavior with clear contracts.

## Tech Stack Requirements

### Fixed Technology Choices

The following technologies are mandated for Phase 2 and cannot be substituted:

**Frontend Stack**:
- Framework: Next.js 16+ with App Router architecture
- Language: TypeScript (strict mode enabled)
- Styling: Tailwind CSS
- Authentication: Better Auth library

**Backend Stack**:
- Framework: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: JWT verification with shared secret

**Development Tools**:
- Spec System: GitHub Spec-Kit Plus
- AI Agent: Claude Code (Sonnet 4.5+)
- Version Control: Git with conventional commits

### Environment Configuration

All deployments must use environment variables for configuration:
- Database connection strings
- JWT signing secrets
- API keys and service credentials
- Feature flags (if applicable)

No configuration may be hardcoded in source files.

## Security Requirements

### Authentication Flow

1. **Frontend**: Better Auth handles user signup/signin, issues JWT tokens
2. **Backend**: FastAPI middleware verifies JWT on every protected endpoint
3. **User Context**: JWT claims provide user identity; never trust client-provided user IDs
4. **Token Storage**: Frontend stores tokens securely (httpOnly cookies preferred)

### Data Isolation

- Every database query MUST filter by authenticated user ID
- Users can only CREATE, READ, UPDATE, DELETE their own tasks
- No cross-user data access is permitted under any circumstances
- Admin/superuser roles are out of scope for Phase 2

### Input Validation

- All API inputs must be validated using Pydantic models
- SQL injection prevention via SQLModel parameterized queries
- XSS prevention via proper output encoding in frontend
- CSRF protection via Better Auth built-in mechanisms

## Development Workflow

### Spec-Kit Plus Process

1. **Specification Phase**: Define feature in `/specs/<feature>/spec.md`
2. **Planning Phase**: Create architectural plan in `/specs/<feature>/plan.md`
3. **Task Breakdown**: Generate tasks in `/specs/<feature>/tasks.md`
4. **Implementation**: Agent executes tasks following TDD principles
5. **Validation**: Verify against acceptance criteria in specification

### Prompt History Records (PHR)

After every significant interaction, a PHR must be created:
- **Location**: `history/prompts/<category>/`
- **Categories**: constitution, feature-specific, general
- **Content**: Full user input (verbatim), agent response, context, outcomes
- **Purpose**: Traceability, learning, debugging, audit trail

### Architectural Decision Records (ADR)

When architecturally significant decisions are made:
- Agent MUST suggest creating an ADR with: "📋 Architectural decision detected: [brief] —
  Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto-create ADRs
- ADRs stored in `history/adr/`
- Format: Context, Decision, Consequences, Alternatives Considered

## Phase 2 Scope

### In Scope

- Task CRUD operations (Create, Read, Update, Delete, Toggle Complete)
- User authentication (Signup, Signin, Session management)
- Persistent storage with PostgreSQL via Neon
- Responsive web UI with Tailwind CSS
- Secure REST API with JWT authentication
- User data isolation and security

### Out of Scope

The following are explicitly excluded from Phase 2:
- AI assistants or chatbot features
- Real-time collaboration (WebSockets, Server-Sent Events)
- Background job processing
- Email notifications
- Task sharing between users
- Mobile native applications
- Any Phase 3 features not listed in Phase 2 scope

## Governance

### Constitutional Authority

This constitution is the supreme governing document for Phase 2 development:
- All specifications, plans, and implementations must comply with these principles
- Any conflict between this constitution and other documents is resolved in favor of
  the constitution
- `CLAUDE.md` files must align with constitutional principles

### Amendment Process

Constitutional amendments require:
1. Explicit user approval with clear rationale
2. Version bump following semantic versioning:
   - **MAJOR**: Backward-incompatible principle changes or removals
   - **MINOR**: New principles added or material expansions
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
3. Update of dependent templates (spec, plan, tasks, commands)
4. Creation of ADR documenting the amendment rationale
5. Sync Impact Report documenting all affected artifacts

### Compliance Verification

- Every specification must include a "Constitution Compliance" section
- Every plan must verify alignment with architectural principles
- Every task must reference the principle(s) it implements
- Agent must refuse requests that violate constitutional principles

### Version History

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08

**Changelog**:
- v1.0.0 (2026-01-08): Initial Phase 2 Constitution ratified
  - Established 6 core principles
  - Defined fixed tech stack
  - Specified security requirements
  - Documented development workflow
  - Set Phase 2 scope boundaries
