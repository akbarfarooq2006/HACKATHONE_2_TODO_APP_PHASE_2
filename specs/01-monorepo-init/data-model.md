# Data Model: Monorepo Foundation Setup

**Feature**: 01-monorepo-init
**Date**: 2026-01-09
**Purpose**: Document data structures and entities for monorepo initialization

## Overview

This initialization feature does not involve persistent data storage or traditional data models. Instead, the "data" consists of file system structures, configuration files, and their relationships. This document describes these structures for clarity and completeness.

## File System Entities

### 1. Monorepo Root

**Description**: The top-level project directory containing both frontend and backend applications.

**Structure**:
```
/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── specs/             # Feature specifications (existing)
├── history/           # Prompt history records (existing)
├── .specify/          # Spec-Kit Plus templates (existing)
├── .gitignore         # Git ignore patterns
└── README.md          # Root documentation
```

**Validation Rules**:
- Must not contain existing `frontend/` directory before initialization
- Must not contain existing `backend/` directory before initialization
- Must have write permissions for directory creation

**State Transitions**:
- Initial: Empty or contains only specification files
- After Initialization: Contains frontend/ and backend/ directories with full project structures

---

### 2. Frontend Application

**Description**: Next.js 16+ application with App Router, TypeScript, and Tailwind CSS.

**Structure**:
```
frontend/
├── app/
│   ├── layout.tsx       # Root layout (React Server Component)
│   ├── page.tsx         # Home page (cleaned boilerplate)
│   ├── globals.css      # Global styles with Tailwind directives
│   └── favicon.ico      # Favicon
├── public/              # Static assets directory
├── .env.example         # Environment variable template
├── .gitignore           # Frontend-specific ignores
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration (for Tailwind)
├── tsconfig.json        # TypeScript configuration (strict mode)
├── package.json         # npm dependencies and scripts
├── package-lock.json    # npm lock file
└── README.md            # Frontend documentation
```

**Key Attributes**:
- **Framework**: Next.js 16+
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.x
- **Package Manager**: npm
- **Default Port**: 3000 (auto-increments if in use)

**Configuration Files**:

**package.json** (key fields):
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**tsconfig.json** (key fields):
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Validation Rules**:
- Must have Next.js 16+ installed
- Must have TypeScript strict mode enabled
- Must have Tailwind CSS configured
- Must use App Router (app/ directory, not pages/)

---

### 3. Backend Application

**Description**: Python FastAPI application with uvicorn server and SQLModel ORM.

**Structure**:
```
backend/
├── app/
│   ├── __init__.py      # Package initialization
│   ├── main.py          # FastAPI app entry point
│   └── api/             # API routes directory
│       └── __init__.py  # API package initialization
├── .env.example         # Environment variable template
├── .gitignore           # Backend-specific ignores
├── pyproject.toml       # uv project configuration
├── uv.lock              # uv lock file (generated)
└── README.md            # Backend documentation
```

**Key Attributes**:
- **Framework**: FastAPI 0.109+
- **Language**: Python 3.11+
- **ORM**: SQLModel 0.0.14+
- **Server**: uvicorn 0.27+
- **Package Manager**: uv
- **Default Port**: 8000 (configurable)

**Configuration Files**:

**pyproject.toml** (key fields):
```toml
[project]
name = "backend"
version = "0.1.0"
description = "Phase 2 Todo App Backend"
requires-python = ">=3.11,<4.0"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn>=0.27.0",
    "sqlmodel>=0.0.14",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

**app/main.py** (structure):
```python
from fastapi import FastAPI

app = FastAPI(
    title="Phase 2 Todo App Backend",
    version="0.1.0",
    description="Backend API for Phase 2 Todo Application"
)

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "backend",
        "version": "0.1.0"
    }
```

**Validation Rules**:
- Must have Python 3.11+ installed
- Must have uv package manager available
- Must have fastapi, uvicorn, and sqlmodel dependencies
- Must have health check endpoint at /api/v1/health

---

### 4. Environment Templates

**Description**: Template files documenting required environment variables for future features.

**Frontend .env.example**:
```bash
# API Configuration (for future features)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (for future features)
# NEXT_PUBLIC_AUTH_DOMAIN=
# NEXT_PUBLIC_AUTH_CLIENT_ID=

# Feature Flags (for future features)
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Backend .env.example**:
```bash
# Database Configuration (for future features)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# DATABASE_POOL_SIZE=5
# DATABASE_MAX_OVERFLOW=10

# Authentication (for future features)
# JWT_SECRET_KEY=your-secret-key-here-change-in-production
# JWT_ALGORITHM=HS256
# JWT_EXPIRATION_MINUTES=30

# Server Configuration
# HOST=0.0.0.0
# PORT=8000
# RELOAD=true

# CORS Configuration (for future features)
# CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Validation Rules**:
- Must exist in both frontend/ and backend/ directories
- Must contain descriptive comments
- Must include placeholders for future features
- Must not contain actual secrets or credentials

---

## Configuration Relationships

```
Monorepo Root
├── Frontend Application
│   ├── Uses: Node.js, npm, Next.js, TypeScript, Tailwind
│   ├── Communicates with: Backend (future, via REST API)
│   └── Configured by: package.json, tsconfig.json, next.config.js
│
└── Backend Application
    ├── Uses: Python, uv, FastAPI, uvicorn, SQLModel
    ├── Serves: REST API endpoints
    └── Configured by: pyproject.toml, .env (future)
```

## Validation Matrix

| Entity | Validation Check | Expected Result |
|--------|------------------|-----------------|
| Monorepo Root | Directory writable | Can create subdirectories |
| Monorepo Root | No existing frontend/ | Directory does not exist |
| Monorepo Root | No existing backend/ | Directory does not exist |
| Frontend | Next.js version | >= 16.0.0 |
| Frontend | TypeScript strict mode | "strict": true in tsconfig.json |
| Frontend | Tailwind configured | tailwind.config.js exists |
| Frontend | App Router structure | app/ directory exists (not pages/) |
| Backend | Python version | >= 3.11 |
| Backend | FastAPI installed | fastapi in dependencies |
| Backend | uvicorn installed | uvicorn in dependencies |
| Backend | SQLModel installed | sqlmodel in dependencies |
| Backend | Health endpoint | GET /api/v1/health returns 200 |
| Environment Templates | Frontend .env.example | File exists with placeholders |
| Environment Templates | Backend .env.example | File exists with placeholders |

## State Machine: Initialization Process

```
[Start]
   ↓
[Check Prerequisites]
   ├─ Missing → [Fail with Error]
   └─ Present → [Check Existing Directories]
                   ├─ Exist → [Fail with Error]
                   └─ Not Exist → [Initialize Frontend]
                                     ↓
                                  [Configure Frontend]
                                     ↓
                                  [Initialize Backend]
                                     ↓
                                  [Configure Backend]
                                     ↓
                                  [Create Environment Templates]
                                     ↓
                                  [Verify Installation]
                                     ├─ Fail → [Report Errors]
                                     └─ Success → [Complete]
```

## Summary

This feature creates file system structures and configuration files rather than traditional data models. The "entities" are:

1. **Monorepo Root**: Container for frontend and backend
2. **Frontend Application**: Next.js project with specific configuration
3. **Backend Application**: FastAPI project with specific configuration
4. **Environment Templates**: Documentation for future configuration needs

All structures follow constitutional requirements and industry best practices for their respective technologies.

---

**Data Model Status**: ✅ Complete
**Next**: API Contracts (contracts/health-api.yaml)
