# Phase 2 Todo App - Monorepo

**Status**: Foundation Initialized ✅

This is the Phase 2 implementation of the Todo App using a monorepo architecture with separate frontend and backend applications.

## Project Structure

```
phase_2/
├── frontend/          # Next.js 16+ application (App Router, TypeScript, Tailwind CSS)
├── backend/           # Python FastAPI application (uvicorn, SQLModel)
├── specs/             # Feature specifications and design documents
├── history/           # Prompt history records and ADRs
└── .specify/          # Spec-Kit Plus templates and configuration
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.x
- **Package Manager**: npm

### Backend
- **Framework**: FastAPI 0.128.0
- **Language**: Python 3.12+
- **ORM**: SQLModel 0.0.31
- **Server**: uvicorn 0.40.0
- **Package Manager**: uv

## Prerequisites

Before running the applications, ensure you have the following installed:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Python**: >= 3.11
- **uv**: >= 0.1.0

## Quick Start

### Starting the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at **http://localhost:3000** (or the next available port if 3000 is in use).

### Starting the Backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The backend API will be available at **http://localhost:8000** (or the next available port if 8000 is in use).

### Health Check

Verify the backend is running:

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "backend",
  "version": "0.1.0"
}
```

## Development Workflow

### Frontend Development

- **Development server**: `npm run dev`
- **Build**: `npm run build`
- **Start production**: `npm start`
- **Lint**: `npm run lint`

### Backend Development

- **Development server**: `uv run uvicorn app.main:app --reload`
- **Add dependency**: `uv add <package-name>`
- **Run Python script**: `uv run python <script.py>`

## Project Documentation

- **Specifications**: See `specs/01-monorepo-init/` for the initialization feature documentation
  - [spec.md](specs/01-monorepo-init/spec.md) - Feature specification
  - [plan.md](specs/01-monorepo-init/plan.md) - Implementation plan
  - [tasks.md](specs/01-monorepo-init/tasks.md) - Task breakdown
  - [quickstart.md](specs/01-monorepo-init/quickstart.md) - Developer quickstart guide

- **Constitution**: See `.specify/memory/constitution.md` for project principles and guidelines

## Constitutional Compliance

This project follows the Phase 2 Constitution:

- ✅ **Principle I**: Spec-First Development
- ✅ **Principle III**: Monorepo Architecture (frontend/ and backend/ separation)
- ✅ **Principle V**: Tech Stack Compliance (Next.js 16+, FastAPI, SQLModel)
- ✅ **Principle VI**: API-First Backend Design (RESTful endpoints with versioning)

## Next Steps

Now that the monorepo foundation is initialized, you can:

1. **Explore the codebase**: Familiarize yourself with the directory structure
2. **Review specifications**: Check `specs/` for feature requirements
3. **Start building features**: Begin implementing Phase 2 features according to specifications
4. **Follow the constitution**: Ensure all development adheres to constitutional principles

## Support

For questions or issues:
- Review the specification documents in `specs/01-monorepo-init/`
- Check the quickstart guide: `specs/01-monorepo-init/quickstart.md`
- Refer to the constitution: `.specify/memory/constitution.md`

---

**Monorepo Foundation**: ✅ Complete
**Ready for**: Phase 2 Feature Development
