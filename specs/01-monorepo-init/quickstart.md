# Developer Quickstart: Monorepo Foundation Setup

**Feature**: 01-monorepo-init
**Last Updated**: 2026-01-09
**Audience**: Developers setting up the Phase 2 monorepo for the first time

## Overview

This guide walks you through setting up the Phase 2 Todo App monorepo with both frontend (Next.js) and backend (FastAPI) applications. After completing this guide, you'll have both development servers running and ready for feature development.

**Time to Complete**: ~10-15 minutes (depending on internet speed)

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Minimum Version | Check Command | Installation |
|------|----------------|---------------|--------------|
| Node.js | 18.0.0 | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | 9.0.0 | `npm --version` | Included with Node.js |
| Python | 3.11.0 | `python --version` | [python.org](https://python.org) |
| uv | 0.1.0 | `uv --version` | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |

**Operating System**: Linux, macOS, or Windows with WSL

## Quick Start (TL;DR)

```bash
# 1. Verify prerequisites
node --version  # Should be >= 18
python --version  # Should be >= 3.11
npm --version
uv --version

# 2. Initialize frontend
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd frontend && npm run dev  # Starts on http://localhost:3000

# 3. Initialize backend (in new terminal)
mkdir backend && cd backend
uv init
uv add fastapi uvicorn sqlmodel
# Create app/main.py with health endpoint
uv run uvicorn app.main:app --reload  # Starts on http://localhost:8000

# 4. Verify
curl http://localhost:8000/api/v1/health  # Should return {"status":"healthy",...}
```

## Detailed Setup Instructions

### Step 1: Verify Prerequisites

Run the prerequisite checks to ensure all required tools are installed:

```bash
# Check Node.js version (must be >= 18)
node --version

# Check Python version (must be >= 3.11)
python --version

# Check npm is available
npm --version

# Check uv is available
uv --version
```

**Expected Output**:
```
v20.10.0  # or higher
Python 3.11.7  # or higher
10.2.3  # or higher
0.1.6  # or higher
```

**If any tool is missing**: Install it using the links in the Prerequisites table above.

---

### Step 2: Initialize Frontend Application

Navigate to your project root directory and initialize the Next.js frontend:

```bash
# Create Next.js application with TypeScript, Tailwind, and App Router
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

**Interactive Prompts** (if any):
- Use ESLint? → Yes
- Use Turbopack? → No (optional, can say Yes)

**What this does**:
- Creates `frontend/` directory
- Installs Next.js 16+, React 18+, TypeScript, Tailwind CSS
- Configures App Router (not Pages Router)
- Sets up TypeScript in strict mode
- Configures Tailwind CSS with PostCSS

**Time**: ~2-3 minutes (downloading dependencies)

---

### Step 3: Clean Frontend Boilerplate

Remove the default example content and create a minimal starter page:

```bash
cd frontend
```

Edit `app/page.tsx` to remove boilerplate:

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Phase 2 Todo App</h1>
      <p className="mt-4 text-lg text-gray-600">
        Frontend initialized and ready for development
      </p>
    </main>
  );
}
```

---

### Step 4: Create Frontend Environment Template

Create `.env.example` in the `frontend/` directory:

```bash
cat > .env.example << 'EOF'
# API Configuration (for future features)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (for future features)
# NEXT_PUBLIC_AUTH_DOMAIN=
# NEXT_PUBLIC_AUTH_CLIENT_ID=

# Feature Flags (for future features)
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
EOF
```

---

### Step 5: Start Frontend Development Server

```bash
# From frontend/ directory
npm run dev
```

**Expected Output**:
```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

**Port Conflicts**: If port 3000 is in use, Next.js will automatically use 3001, 3002, etc.

**Verify**: Open http://localhost:3000 in your browser. You should see "Phase 2 Todo App" heading.

**Keep this terminal running** and open a new terminal for backend setup.

---

### Step 6: Initialize Backend Application

From the project root (not inside frontend/), create and initialize the backend:

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize uv project
uv init

# Add dependencies
uv add fastapi uvicorn sqlmodel
```

**What this does**:
- Creates `backend/` directory
- Initializes `pyproject.toml` with project metadata
- Installs FastAPI, uvicorn (ASGI server), and SQLModel (ORM)
- Creates `uv.lock` file for reproducible installs

**Time**: ~1-2 minutes (downloading dependencies)

---

### Step 7: Create Backend Application Structure

Create the FastAPI application structure:

```bash
# From backend/ directory
mkdir -p app/api
touch app/__init__.py
touch app/api/__init__.py
```

Create `app/main.py` with the health check endpoint:

```python
from fastapi import FastAPI

app = FastAPI(
    title="Phase 2 Todo App Backend",
    version="0.1.0",
    description="Backend API for Phase 2 Todo Application"
)

@app.get("/api/v1/health")
async def health_check():
    """
    Health check endpoint for monitoring and verification.
    Returns the service status, name, and version.
    """
    return {
        "status": "healthy",
        "service": "backend",
        "version": "0.1.0"
    }
```

---

### Step 8: Create Backend Environment Template

Create `.env.example` in the `backend/` directory:

```bash
cat > .env.example << 'EOF'
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
EOF
```

---

### Step 9: Start Backend Development Server

```bash
# From backend/ directory
uv run uvicorn app.main:app --reload
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Port Conflicts**: If port 8000 is in use, specify a different port:
```bash
uv run uvicorn app.main:app --reload --port 8001
```

---

### Step 10: Verify Backend Health Endpoint

In a new terminal, test the health check endpoint:

```bash
curl http://localhost:8000/api/v1/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "backend",
  "version": "0.1.0"
}
```

**Alternative** (if curl not available):
- Open http://localhost:8000/api/v1/health in your browser
- Use Postman or similar API testing tool

---

## Verification Checklist

After completing all steps, verify your setup:

- [ ] Frontend dev server running on http://localhost:3000 (or 3001, 3002, etc.)
- [ ] Frontend displays "Phase 2 Todo App" heading in browser
- [ ] No console errors in browser developer tools
- [ ] Backend dev server running on http://localhost:8000 (or 8001, etc.)
- [ ] Health endpoint returns `{"status":"healthy",...}` JSON response
- [ ] Both servers auto-reload on file changes

**All checks passed?** ✅ Your monorepo is ready for feature development!

---

## Project Structure Overview

After initialization, your project structure should look like this:

```
project-root/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── public/
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── api/
│   │       └── __init__.py
│   ├── .env.example
│   ├── pyproject.toml
│   ├── uv.lock
│   └── README.md
│
├── specs/
│   └── 01-monorepo-init/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md (this file)
│       └── contracts/
│           └── health-api.yaml
│
└── README.md
```

---

## Common Issues & Troubleshooting

### Issue: "command not found: node" or "command not found: python"

**Solution**: Install the missing prerequisite using the links in the Prerequisites table.

---

### Issue: "Port 3000 is already in use"

**Solution**: Next.js will automatically use the next available port (3001, 3002, etc.). Check the terminal output for the actual port being used.

---

### Issue: "Port 8000 is already in use"

**Solution**: Start uvicorn on a different port:
```bash
uv run uvicorn app.main:app --reload --port 8001
```

---

### Issue: "Module not found" errors in frontend

**Solution**: Ensure dependencies are installed:
```bash
cd frontend
npm install
```

---

### Issue: "No module named 'fastapi'" in backend

**Solution**: Ensure dependencies are installed:
```bash
cd backend
uv sync
```

---

### Issue: Frontend shows TypeScript errors

**Solution**: Verify TypeScript is installed and tsconfig.json exists:
```bash
cd frontend
npm install typescript --save-dev
```

---

### Issue: Health endpoint returns 404

**Solution**: Verify the endpoint path is exactly `/api/v1/health` (not `/health` or `/api/health`).

---

## Next Steps

Now that your monorepo is initialized, you can:

1. **Explore the codebase**: Familiarize yourself with the directory structure
2. **Read the specification**: Review `specs/01-monorepo-init/spec.md` for requirements
3. **Review the plan**: Check `specs/01-monorepo-init/plan.md` for implementation details
4. **Start building features**: Begin implementing Phase 2 features according to specifications

---

## Development Workflow

### Starting Development Servers

**Terminal 1 (Frontend)**:
```bash
cd frontend
npm run dev
```

**Terminal 2 (Backend)**:
```bash
cd backend
uv run uvicorn app.main:app --reload
```

### Stopping Development Servers

Press `Ctrl+C` in each terminal to stop the servers.

### Installing New Dependencies

**Frontend**:
```bash
cd frontend
npm install <package-name>
```

**Backend**:
```bash
cd backend
uv add <package-name>
```

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **TypeScript Documentation**: https://www.typescriptlang.org/docs
- **uv Documentation**: https://github.com/astral-sh/uv

---

**Questions or Issues?** Refer to the specification (`spec.md`) or implementation plan (`plan.md`) for detailed information.

**Ready to build!** 🚀
