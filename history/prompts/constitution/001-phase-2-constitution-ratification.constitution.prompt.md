---
id: 001
title: Phase 2 Constitution Ratification
stage: constitution
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "phase-2", "governance", "security", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

```text

This constitution will govern all future specifications, planning, and code generation.
It is a non-negotiable source of truth.

PROJECT CONTEXT
- Phase 1 is completed: In-memory Python CLI Todo App
- Phase 2 goal: Transform the project into a secure, multi-user, full-stack web application
- All development must be agent-driven using Spec-Kit Plus and Claude Code
- No manual coding is allowed at any stage

TECH STACK (FIXED & NON-NEGOTIABLE)
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (Frontend) + JWT verification (Backend)
- Architecture: Monorepo with frontend/ and backend/ folders
- Spec System: GitHub Spec-Kit Plus

DEVELOPMENT RULES
- Spec-first development only
- Every feature must be defined in /specs before implementation
- Claude Code must reference specs using @specs/ paths
- CLAUDE.md files define implementation behavior and must be followed strictly
- Agent is allowed to create, modify, refactor, and delete files as needed

SECURITY & AUTH CONSTITUTION
- Every API request MUST require a valid JWT token
- JWT token must be verified in FastAPI using a shared secret
- User identity must be derived from JWT, not from request body
- API must enforce strict user data isolation
- Any request without a valid token returns 401 Unauthorized

ARCHITECTURAL PRINCIPLES
- Frontend never accesses database directly
- Backend exposes RESTful APIs only
- All task operations are scoped to the authenticated user
- Stateless backend authentication using JWT
- Environment variables must be used for secrets

SCOPE OF PHASE 2
- Task CRUD (Create, Read, Update, Delete, Toggle Complete)
- User Signup & Signin
- Persistent storage with PostgreSQL
- Responsive web UI
- Secure REST API

OUT OF SCOPE
- Chatbots
- AI assistants
- WebSockets
- Background jobs
- Phase 3 features

OUTPUT REQUIREMENTS
- Write a clear, authoritative Constitution document

Begin writing the Phase 2 Constitution now.
```

## Response snapshot

Created comprehensive Phase 2 Constitution (v1.0.0) establishing 6 core non-negotiable principles:

1. **Spec-First Development**: All features must be defined in /specs/ before implementation
2. **Security & Authentication**: JWT-based authentication with strict user data isolation
3. **Monorepo Architecture**: Clear separation between frontend/ and backend/ with API-only communication
4. **Agent-Driven Development**: All code written by Claude Code following Spec-Kit Plus methodology
5. **Tech Stack Compliance**: Fixed stack (Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth)
6. **API-First Backend Design**: Stateless RESTful APIs with clear contracts

Additional sections defined:
- Tech Stack Requirements (fixed technology choices, environment configuration)
- Security Requirements (authentication flow, data isolation, input validation)
- Development Workflow (Spec-Kit Plus process, PHR creation, ADR suggestions)
- Phase 2 Scope (in-scope: Task CRUD, auth, persistence; out-of-scope: AI, WebSockets, background jobs)
- Governance (constitutional authority, amendment process, compliance verification)

Constitution written to `.specify/memory/constitution.md` with Sync Impact Report documenting version, principles, and template validation requirements.

## Outcome

- ✅ Impact: Established authoritative governance document for Phase 2 development; all future specs, plans, and implementations must comply with these principles
- 🧪 Tests: No tests required (documentation artifact)
- 📁 Files: Created/updated `.specify/memory/constitution.md` (235 lines)
- 🔁 Next prompts: Validate dependent templates (plan-template.md, spec-template.md, tasks-template.md) align with constitutional principles; begin feature specification using /sp.specify
- 🧠 Reflection: Constitution successfully captures all user requirements including security-first approach, fixed tech stack, and agent-driven workflow constraints. Clear scope boundaries prevent feature creep.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution creation completed successfully
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, no unresolved tokens, version semantics correct, principles are declarative and testable
- Prompt variant (if applicable): N/A - Initial constitution creation
- Next experiment (smallest change to try): Validate that spec/plan/tasks templates reference constitutional principles correctly; may need to add "Constitution Compliance" sections to templates
