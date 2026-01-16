# Research: Authentication System and Database Connectivity

**Feature**: Authentication System and Database Connectivity
**Branch**: `02-auth-db`
**Date**: 2026-01-09
**Status**: Complete

## Overview

This document consolidates research findings for implementing a hybrid authentication architecture where the Frontend (Next.js + Better Auth) issues JWT tokens and the Backend (FastAPI) verifies them. All technical unknowns have been resolved and implementation patterns validated.

## R1: Better Auth Integration with Next.js 16 App Router

### Question
How to configure Better Auth with Next.js 16 App Router and Neon PostgreSQL?

### Research Findings

#### Installation
```bash
npm install better-auth
npm install pg  # PostgreSQL client for database connection
```

#### Configuration Pattern (`lib/auth.ts`)

**Database Connection with Neon PostgreSQL:**
```typescript
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL
    }),
    // Additional configuration below
});
```

**Google OAuth Provider Setup:**
```typescript
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
```

**Account Linking Configuration:**
```typescript
export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['google', 'email-password'],
            allowDifferentEmails: false  // Same email required for linking
        },
        encryptOAuthTokens: true,  // Encrypt OAuth tokens in database
    },
});
```

#### App Router Integration

**API Route Handler (`app/api/auth/[...all]/route.ts`):**
```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth.handler);
```

**Next.js Cookies Plugin (for Server Actions):**
```typescript
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
    // ...other config
    plugins: [nextCookies()]  // Must be last plugin in array
});
```

#### Token Storage Strategy

**Decision**: Use httpOnly cookies (Better Auth default)
- **Rationale**: Prevents XSS attacks by making tokens inaccessible to JavaScript
- **Implementation**: Better Auth automatically stores tokens in httpOnly cookies
- **Security**: Cookies are automatically sent with requests to same origin

### Implementation Pattern

**Complete `lib/auth.ts` Configuration:**
```typescript
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { Pool } from 'pg';

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['google', 'email-password'],
            allowDifferentEmails: false
        },
        encryptOAuthTokens: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,  // 7 days in seconds
        updateAge: 60 * 60 * 24,       // Update session every 24 hours
    },
    plugins: [nextCookies()]
});
```

### Decision Summary

- **Database Adapter**: Use `pg` Pool with Neon connection string
- **Token Storage**: httpOnly cookies (Better Auth default)
- **OAuth Provider**: Google configured via environment variables
- **Account Linking**: Enabled for email and Google OAuth with same email requirement
- **Session Duration**: 7 days with daily updates
- **App Router Integration**: Use `toNextJsHandler` for API routes

---

## R2: JWT Verification in FastAPI (Stateless)

### Question
How to verify Better Auth JWT tokens in FastAPI using shared secret WITHOUT database lookups?

### Research Findings

#### JWT Token Structure from Better Auth

Better Auth issues standard JWT tokens with:
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Claims**: Standard JWT claims (sub, exp, iat, email, name) plus custom claims
- **Signature**: Signed with BETTER_AUTH_SECRET
- **Sub Claim**: Contains user ID for path-based security verification

#### Python Library Selection

**Decision**: Use `python-jose[cryptography]`
- **Rationale**:
  - Well-documented FastAPI integration
  - Comprehensive JWT validation options
  - Strong exception handling
  - Supports HS256 algorithm
  - Stateless verification (no database required)
- **Alternative Considered**: PyJWT (rejected due to less FastAPI-specific documentation)

#### Installation
```bash
uv add "python-jose[cryptography]"
```

#### FastAPI Dependency Injection Pattern (Stateless)

**OAuth2 Scheme Setup:**
```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
```

**JWT Verification Function (`app/auth/jwt.py`):**
```python
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError, JWTClaimsError

def verify_jwt_token(token: str, secret: str) -> dict:
    """
    Verify JWT token statelessly and return decoded claims.

    NO DATABASE LOOKUPS - purely cryptographic verification.

    Args:
        token: JWT token string
        secret: Shared secret for verification (BETTER_AUTH_SECRET)

    Returns:
        Decoded token claims (sub, email, name, exp, iat)

    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=['HS256'],
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_iat': True,
                'require_exp': True,
                'require_iat': True,
            }
        )
        return payload
    except ExpiredSignatureError:
        raise JWTError("Token has expired")
    except JWTClaimsError as e:
        raise JWTError(f"Invalid token claims: {str(e)}")
    except JWTError as e:
        raise JWTError(f"Token verification failed: {str(e)}")
```

**Get Current User Dependency (Stateless - `app/auth/dependencies.py`):**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.auth.jwt import verify_jwt_token
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> str:
    """
    FastAPI dependency that extracts and verifies JWT token STATELESSLY.

    NO DATABASE QUERIES - returns user_id from verified token claims only.

    Returns:
        user_id (str): User ID from token sub claim

    Raises:
        HTTPException 401: If token is invalid, expired, or missing
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Verify token signature and decode claims (NO DATABASE ACCESS)
        payload = verify_jwt_token(token, settings.BETTER_AUTH_SECRET)

        # Extract user ID from token claims
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except Exception:
        raise credentials_exception

    return user_id
```

**Path-Based Security Dependency (`app/auth/dependencies.py`):**
```python
from fastapi import Depends, HTTPException, status, Path

async def verify_path_user_id(
    path_user_id: str = Path(..., alias="user_id"),
    token_user_id: str = Depends(get_current_user)
) -> str:
    """
    Verify that user_id in URL path matches user_id from JWT token.

    This enforces path-based security: users can only access their own resources.

    Args:
        path_user_id: User ID from URL path parameter
        token_user_id: User ID from verified JWT token (sub claim)

    Returns:
        user_id (str): Verified user ID

    Raises:
        HTTPException 403: If path user_id does not match token user_id
    """
    if path_user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in path does not match token user ID"
        )

    return token_user_id
```

#### Error Handling Strategy

**HTTP Status Codes:**
- **401 Unauthorized**: Invalid, expired, or missing token
- **403 Forbidden**: Valid token but user_id in path does not match token

**Exception Types:**
- `ExpiredSignatureError`: Token has expired
- `JWTClaimsError`: Invalid claims (missing sub, exp, etc.)
- `JWTError`: General JWT validation failure

### Implementation Pattern

**Complete Stateless Dependency Pattern:**
```python
# app/auth/dependencies.py
from typing import Annotated
from fastapi import Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.auth.jwt import verify_jwt_token
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> str:
    """Stateless JWT verification - returns user_id from token claims."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_jwt_token(token, settings.BETTER_AUTH_SECRET)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return user_id

async def verify_path_user_id(
    path_user_id: Annotated[str, Path(alias="user_id")],
    token_user_id: Annotated[str, Depends(get_current_user)]
) -> str:
    """Path-based security - verify path user_id matches token user_id."""
    if path_user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in path does not match token user ID"
        )
    return token_user_id
```

### Decision Summary

- **Library**: python-jose[cryptography]
- **Algorithm**: HS256 (matches Better Auth)
- **Validation**: Verify signature, expiration, and issued-at claims STATELESSLY
- **NO Database Lookups**: Token verification is purely cryptographic
- **Path-Based Security**: Verify user_id in URL path matches token sub claim
- **Error Handling**: Return 401 for invalid tokens, 403 for path mismatches
- **Zero-Trust**: Never trust client-provided user IDs; always extract from verified token and enforce path matching

---

## R3: Shared Database Connection Strategy

### Question
How to connect both Better Auth (frontend) and SQLModel (backend) to same Neon database?

### Research Findings

#### Neon PostgreSQL Connection String Format

**Standard Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Example:**
```
postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Frontend Connection (Better Auth)

**Configuration:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export const auth = betterAuth({
    database: pool,
    // ...other config
});
```

**Table Creation:**
- Better Auth automatically creates required tables on first run
- Tables: `user`, `session`, `account`, `verification`
- Schema is managed by Better Auth library
- No manual migrations needed

#### Backend Connection (SQLModel)

**Database Configuration (`app/database.py`):**
```python
from sqlmodel import create_engine, Session, SQLModel
from app.config import settings

# Create engine with Neon connection string (for future use)
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Log SQL queries (disable in production)
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Connection pool size
    max_overflow=10  # Max overflow connections
)

def get_db():
    """Dependency for database sessions (for future task CRUD operations)."""
    with Session(engine) as session:
        yield session

def init_db():
    """Initialize database (create tables if needed - for future use)."""
    SQLModel.metadata.create_all(engine)
```

**Configuration (`app/config.py`):**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    BETTER_AUTH_SECRET: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

#### Connection Pooling Strategy

**Frontend (Better Auth):**
- Uses `pg` Pool with default settings
- Connection pool managed by Better Auth
- Suitable for serverless/edge environments

**Backend (FastAPI):**
- SQLModel engine with connection pooling (for future use)
- `pool_size=5`: Maximum 5 concurrent connections
- `max_overflow=10`: Allow up to 10 additional connections under load
- `pool_pre_ping=True`: Verify connection health before use
- **NOTE**: Database connection NOT used for token verification (stateless)

#### Table Creation Strategy

**Decision**: Better Auth creates tables, Backend does NOT access them for token verification

**Rationale**:
1. Better Auth requires specific schema for authentication
2. Backend performs STATELESS token verification (no database access)
3. Database models will be added in future phases for task CRUD operations
4. Avoids schema conflicts and migration issues
5. Single source of truth for auth schema

**Implementation**:
- Frontend: Better Auth auto-creates tables on first run
- Backend: NO database access for token verification (stateless)
- Backend database connection reserved for future task CRUD operations

### Implementation Pattern

**Backend Does NOT Need User Model for Token Verification:**
```python
# NO USER MODEL NEEDED FOR STATELESS TOKEN VERIFICATION
# Token verification is purely cryptographic using BETTER_AUTH_SECRET
# User information extracted from verified JWT token claims only
# Database models will be added in future phases for task CRUD
```

### Decision Summary

- **Connection String**: Same DATABASE_URL for both frontend and backend
- **Table Creation**: Better Auth auto-creates, backend does NOT access for token verification
- **Connection Pooling**: Frontend uses pg Pool; backend reserves SQLModel for future use
- **Schema Management**: Better Auth owns schema, backend performs stateless verification
- **Environment Variables**: Shared DATABASE_URL in both .env files (backend for future use)
- **Token Verification**: STATELESS - no database queries, purely cryptographic

---

## R4: Password Validation and Account Linking

### Question
How to implement password complexity validation and account linking in Better Auth?

### Research Findings

#### Password Validation

Better Auth supports custom password validation through configuration hooks.

**Implementation Strategy:**
```typescript
export const auth = betterAuth({
    // ...other config
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,  // Optional for this phase
        minPasswordLength: 8,
        password: {
            validate: (password: string) => {
                // Minimum 8 characters
                if (password.length < 8) {
                    return { valid: false, message: "Password must be at least 8 characters" };
                }

                // At least one uppercase letter
                if (!/[A-Z]/.test(password)) {
                    return { valid: false, message: "Password must contain at least one uppercase letter" };
                }

                // At least one lowercase letter
                if (!/[a-z]/.test(password)) {
                    return { valid: false, message: "Password must contain at least one lowercase letter" };
                }

                // At least one number
                if (!/[0-9]/.test(password)) {
                    return { valid: false, message: "Password must contain at least one number" };
                }

                // At least one special character
                if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                    return { valid: false, message: "Password must contain at least one special character" };
                }

                return { valid: true };
            }
        }
    },
});
```

#### Account Linking

Better Auth supports automatic account linking when users sign in with different providers using the same email.

**Configuration:**
```typescript
export const auth = betterAuth({
    // ...other config
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['google', 'email-password'],
            allowDifferentEmails: false  // Require same email for linking
        }
    }
});
```

**Behavior:**
1. User signs up with email/password (user@example.com)
2. User later signs in with Google OAuth (same email)
3. Better Auth automatically links accounts into single user record
4. User can sign in with either method

#### Progressive Delay Rate Limiting

Better Auth supports rate limiting through middleware or custom hooks.

**Implementation Strategy (Custom Middleware):**
```typescript
// lib/rate-limit.ts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function getRateLimitDelay(identifier: string): number {
    const now = Date.now();
    const record = failedAttempts.get(identifier);

    if (!record) {
        return 0;
    }

    // Reset after 15 minutes of no attempts
    if (now - record.lastAttempt > 15 * 60 * 1000) {
        failedAttempts.delete(identifier);
        return 0;
    }

    // Progressive delays: 1s, 2s, 5s, 10s, 30s
    const delays = [1000, 2000, 5000, 10000, 30000];
    const delayIndex = Math.min(record.count - 1, delays.length - 1);
    return delays[delayIndex];
}

export function recordFailedAttempt(identifier: string): void {
    const now = Date.now();
    const record = failedAttempts.get(identifier);

    if (!record) {
        failedAttempts.set(identifier, { count: 1, lastAttempt: now });
    } else {
        record.count++;
        record.lastAttempt = now;
    }
}

export function resetFailedAttempts(identifier: string): void {
    failedAttempts.delete(identifier);
}
```

**Integration with Better Auth:**
- Apply rate limiting in sign-in API route handler
- Use email as identifier for rate limiting
- Reset counter on successful authentication

### Decision Summary

- **Password Validation**: Custom validation function with regex checks
- **Account Linking**: Enabled for email-password and Google OAuth with same email requirement
- **Rate Limiting**: Custom middleware with progressive delays (1s, 2s, 5s, 10s, 30s)
- **Reset Strategy**: Clear failed attempts after successful login or 15-minute timeout

---

## R5: Environment Variable Management

### Question
What environment variables are required and how to manage them securely?

### Research Findings

#### Required Environment Variables

**Frontend (.env.local):**
```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"  # Must match backend
BETTER_AUTH_URL="http://localhost:3000"    # Frontend URL for callbacks

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Backend (.env):**
```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth (for JWT verification)
BETTER_AUTH_SECRET="your-secret-key-here"  # Must match frontend
```

#### Secret Generation Strategy

**BETTER_AUTH_SECRET Generation:**
```bash
# Generate secure random secret (32 bytes, base64 encoded)
openssl rand -base64 32
```

**Requirements:**
- Minimum 32 characters
- Cryptographically secure random generation
- Same value in both frontend and backend .env files

#### Environment Variable Validation

**Frontend Validation (lib/auth.ts):**
```typescript
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
}
if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required");
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are required");
}
```

**Backend Validation (app/config.py):**
```python
from pydantic_settings import BaseSettings
from pydantic import validator

class Settings(BaseSettings):
    DATABASE_URL: str
    BETTER_AUTH_SECRET: str

    @validator('DATABASE_URL')
    def validate_database_url(cls, v):
        if not v.startswith('postgresql://'):
            raise ValueError('DATABASE_URL must be a PostgreSQL connection string')
        return v

    @validator('BETTER_AUTH_SECRET')
    def validate_secret(cls, v):
        if len(v) < 32:
            raise ValueError('BETTER_AUTH_SECRET must be at least 32 characters')
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

#### .env.example Templates

**Frontend (.env.example):**
```bash
# Database Connection
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Backend (.env.example):**
```bash
# Database Connection (must match frontend)
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# Better Auth Secret (must match frontend)
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
```

#### Security Best Practices

1. **Never commit .env files**: Add to .gitignore
2. **Use .env.example**: Provide templates without real values
3. **Validate on startup**: Fail fast if required variables missing
4. **Rotate secrets**: Change BETTER_AUTH_SECRET periodically
5. **Use strong secrets**: Minimum 32 characters, cryptographically random

### Decision Summary

- **Required Variables**: DATABASE_URL, BETTER_AUTH_SECRET (both), BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (frontend only)
- **Secret Generation**: Use `openssl rand -base64 32` for BETTER_AUTH_SECRET
- **Validation**: Validate all required variables on application startup
- **Templates**: Provide .env.example files with placeholder values
- **Security**: Never commit .env files, use strong random secrets

---

## Technology Stack Summary

### Frontend
- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5.x
- **Authentication**: Better Auth (latest)
- **Database Client**: pg (PostgreSQL client)
- **Styling**: Tailwind CSS 4.x

### Backend
- **Framework**: FastAPI 0.128.0
- **Language**: Python 3.12.3
- **ORM**: SQLModel 0.0.31
- **JWT Library**: python-jose[cryptography]
- **Server**: uvicorn 0.40.0

### Database
- **Provider**: Neon Serverless PostgreSQL
- **Connection**: Shared DATABASE_URL for both frontend and backend
- **Schema Management**: Better Auth auto-creates tables

---

## Implementation Readiness

All research tasks (R1-R5) are complete with validated implementation patterns:

✅ **R1**: Better Auth configuration with Next.js App Router and Neon PostgreSQL
✅ **R2**: JWT verification in FastAPI using python-jose
✅ **R3**: Shared database connection strategy for frontend and backend
✅ **R4**: Password validation and account linking implementation
✅ **R5**: Environment variable management and security practices

**Status**: Ready to proceed to Phase 1 (Design)

**Next Steps**:
1. Create data-model.md with database schema
2. Create contracts/auth-api.yaml with API specification
3. Create quickstart.md with setup instructions
