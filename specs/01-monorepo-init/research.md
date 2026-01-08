# Research: Monorepo Foundation Setup

**Feature**: 01-monorepo-init
**Date**: 2026-01-09
**Purpose**: Document technology decisions and research findings for monorepo initialization

## Research Questions & Findings

### 1. Next.js 16+ App Router Best Practices

**Question**: What is the recommended project structure and configuration for Next.js 16+ with App Router?

**Research Findings**:
- App Router is the recommended approach for all new Next.js projects (since Next.js 13)
- Uses `app/` directory instead of `pages/` directory
- Supports React Server Components by default
- Better performance through automatic code splitting and streaming
- TypeScript strict mode is recommended for type safety

**Decision**: Use App Router with TypeScript strict mode and Tailwind CSS

**Rationale**:
- Constitutional requirement (Principle V)
- Modern React patterns with Server Components
- Better developer experience with improved routing
- Automatic optimization and performance benefits
- Strong typing catches errors at compile time

**Alternatives Considered**:
- Pages Router: Legacy approach, not recommended for new projects
- Loose TypeScript mode: Lower code quality, not constitutional

**References**:
- Next.js App Router documentation
- Next.js 16 release notes
- React Server Components RFC

---

### 2. FastAPI Project Structure

**Question**: What is the standard project structure for FastAPI applications that scales well?

**Research Findings**:
- Common patterns: flat structure, `app/` directory, or `src/` directory
- `app/` directory is most common in FastAPI community
- Typical structure: `app/main.py` as entry point, `app/api/` for routes, `app/models/` for data models
- FastAPI official examples use `app/` directory pattern

**Decision**: Use `app/` directory with `main.py` entry point and `api/` subdirectory

**Rationale**:
- Standard FastAPI convention
- Scales well as features are added
- Clear separation of concerns (routes, models, services)
- Matches community best practices
- Easy to navigate for developers familiar with FastAPI

**Alternatives Considered**:
- Flat structure: Doesn't scale beyond simple projects
- `src/` directory: Less common in Python web frameworks
- No subdirectories: Becomes messy with multiple routes

**References**:
- FastAPI official documentation
- FastAPI project templates
- Python web application best practices

---

### 3. Python Dependency Management with uv

**Question**: How should we configure uv for FastAPI project dependency management?

**Research Findings**:
- uv is a fast Python package installer and resolver (written in Rust)
- Uses `pyproject.toml` for project configuration (PEP 621 standard)
- Generates `uv.lock` file for reproducible installs
- Commands: `uv init`, `uv add <package>`, `uv run <command>`
- Much faster than pip, better dependency resolution than pip

**Decision**: Use uv with pyproject.toml for all Python dependency management

**Rationale**:
- Constitutional requirement (Principle V)
- Faster installation than pip (10-100x in benchmarks)
- Better dependency resolution
- Modern Python tooling (PEP 621 compliant)
- Lock file ensures reproducible builds

**Alternatives Considered**:
- pip + requirements.txt: Slower, less reliable dependency resolution
- poetry: Not constitutional, adds unnecessary complexity
- pipenv: Slower than uv, less actively maintained

**References**:
- uv documentation (astral.sh)
- PEP 621 (Python project metadata)
- Python packaging best practices

---

### 4. Port Conflict Resolution Strategy

**Question**: How should development servers handle port conflicts when default ports are in use?

**Research Findings**:
- Modern dev tools (Vite, Create React App, Next.js) auto-increment to next available port
- Alternative approaches: fail with error, use random port, require manual configuration
- Auto-increment provides best developer experience
- Both Next.js and uvicorn support port auto-increment natively

**Decision**: Auto-increment to next available port with console notification

**Rationale**:
- Matches modern dev tool behavior
- Supports running multiple instances (useful for testing)
- Better developer experience than failing
- Clear console messages prevent confusion
- No additional implementation needed (native support)

**Alternatives Considered**:
- Fail with error: Poor DX, blocks development
- Random port: Unpredictable, hard to remember
- Manual config only: Inconvenient, requires extra steps

**Implementation Notes**:
- Next.js: Automatically increments from 3000 to 3001, 3002, etc.
- uvicorn: Use `--port 0` for automatic port selection, or handle in code

**References**:
- Next.js CLI behavior
- uvicorn documentation
- Modern web development tooling patterns

---

### 5. Environment Variable Template Content

**Question**: What should .env.example files contain at the initialization stage when database and auth are out of scope?

**Research Findings**:
- Common approaches: empty files, placeholder variables, working dummy values
- Best practice: Include placeholders with descriptive comments
- Serves as documentation for future developers
- Prevents confusion about what's needed now vs. later

**Decision**: Include placeholder variables with descriptive comments for future features

**Rationale**:
- Serves as living documentation
- Guides future feature development
- Prevents confusion about current vs. future requirements
- Makes it clear that database/auth are coming later
- No risk of developers using dummy values in production

**Alternatives Considered**:
- Empty files with comments: Provides no guidance on what's needed
- Working dummy values: Risk of being used in production
- Only current needs: Incomplete, doesn't guide future work

**Template Structure**:
```
# Current Configuration
# (none needed for initialization)

# Future Configuration (for upcoming features)
# DATABASE_URL=postgresql://...
# JWT_SECRET_KEY=...
```

**References**:
- Twelve-Factor App methodology
- Environment variable best practices
- Security guidelines for configuration management

---

### 6. Prerequisite Validation Approach

**Question**: When and how should we validate system prerequisites (Node.js, Python, npm, uv)?

**Research Findings**:
- Options: check upfront, check as needed, skip checks, auto-install
- Upfront checking prevents partial initialization failures
- Clear error messages with version requirements improve DX
- Auto-installation has security and permission concerns

**Decision**: Check all prerequisites upfront before any initialization, fail with detailed error

**Rationale**:
- Prevents partial initialization (cleaner failure mode)
- Clear, actionable error messages
- Better developer experience (know what's wrong immediately)
- No security concerns from auto-installation
- Aligns with fail-fast principle

**Alternatives Considered**:
- Check as needed: Can result in partial initialization
- Auto-install: Security risks, permission issues, version conflicts
- Skip checks: Poor DX, cryptic errors later

**Implementation Approach**:
1. Check Node.js version: `node --version` (require >= 18)
2. Check Python version: `python --version` (require >= 3.11)
3. Check npm availability: `npm --version`
4. Check uv availability: `uv --version`
5. If any fail, display detailed error with all missing tools and required versions

**References**:
- Fail-fast principle
- Developer experience best practices
- System requirement validation patterns

---

### 7. TypeScript Configuration

**Question**: What TypeScript configuration should be used for Next.js 16+ with strict mode?

**Research Findings**:
- Next.js provides default tsconfig.json with recommended settings
- Strict mode enables all strict type-checking options
- Constitutional requirement: TypeScript in strict mode (FR-009)
- Strict mode includes: strictNullChecks, strictFunctionTypes, strictBindCallApply, etc.

**Decision**: Enable strict mode in tsconfig.json (Next.js default includes this)

**Rationale**:
- Constitutional requirement
- Catches more errors at compile time
- Enforces better code quality
- Prevents common TypeScript pitfalls
- Industry best practice for new projects

**Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    // ... other Next.js defaults
  }
}
```

**Alternatives Considered**:
- Loose mode: Not constitutional, lower quality, more runtime errors

**References**:
- TypeScript strict mode documentation
- Next.js TypeScript configuration
- Constitutional Principle V

---

### 8. Tailwind CSS Integration

**Question**: How should Tailwind CSS be integrated with Next.js 16+?

**Research Findings**:
- Next.js has built-in PostCSS support
- Tailwind CSS integrates seamlessly with Next.js
- `create-next-app` includes Tailwind option
- Configuration requires: tailwind.config.js, globals.css with directives

**Decision**: Use Tailwind CSS with Next.js built-in PostCSS support

**Rationale**:
- Constitutional requirement (Principle V)
- Official Next.js integration
- Zero additional configuration needed
- Automatic optimization and purging
- Industry standard for utility-first CSS

**Configuration**:
- tailwind.config.js: Configure content paths for purging
- globals.css: Include @tailwind directives
- No additional PostCSS configuration needed

**Alternatives Considered**:
- Manual PostCSS setup: Unnecessary complexity
- Other CSS frameworks: Not constitutional

**References**:
- Tailwind CSS documentation
- Next.js Tailwind integration guide
- Constitutional Principle V

---

## Technology Version Matrix

### Frontend Stack

| Package | Version | Rationale |
|---------|---------|-----------|
| next | ^16.0.0 | Constitutional requirement, latest stable 16.x |
| react | ^18.3.0 | Required by Next.js 16, stable release |
| react-dom | ^18.3.0 | Matches React version |
| typescript | ^5.3.0 | Latest stable, strict mode support |
| tailwindcss | ^3.4.0 | Constitutional requirement, latest stable |
| @types/node | ^20.0.0 | Node.js 18+ type definitions |
| @types/react | ^18.3.0 | React 18 type definitions |
| @types/react-dom | ^18.3.0 | React DOM 18 type definitions |

### Backend Stack

| Package | Version | Rationale |
|---------|---------|-----------|
| python | >=3.11,<4.0 | Constitutional requirement, modern Python |
| fastapi | ^0.109.0 | Constitutional requirement, latest stable |
| uvicorn | ^0.27.0 | Constitutional requirement, ASGI server |
| sqlmodel | ^0.0.14 | Constitutional requirement, ORM for future DB |

### Rationale for Version Pinning

- **Prevents breaking changes**: Caret (^) allows patch and minor updates, blocks major updates
- **Reproducible builds**: Lock files (package-lock.json, uv.lock) ensure exact versions
- **Risk mitigation**: Addresses Risk 1 (Version Compatibility Issues) from specification
- **Documentation**: Clearly documents tested versions for troubleshooting

---

## Summary of Key Decisions

1. **Next.js App Router**: Modern routing with Server Components
2. **FastAPI app/ structure**: Scalable, community standard
3. **uv for Python**: Fast, reliable, constitutional
4. **Port auto-increment**: Best DX, native support
5. **Environment templates**: Placeholder variables with comments
6. **Upfront prerequisite checking**: Fail-fast, clear errors
7. **TypeScript strict mode**: Constitutional, better quality
8. **Tailwind with Next.js**: Built-in integration, zero config

All decisions align with constitutional principles and prioritize developer experience, code quality, and future maintainability.

---

**Research Status**: ✅ Complete
**All NEEDS CLARIFICATION items**: Resolved
**Next Phase**: Phase 1 (Design & Contracts)
