# Skill: Stateless Better Auth Backend Integration

**Name:** `stateless_better_auth`
**Purpose:** Implement stateless JWT authentication with Better Auth frontend and FastAPI backend
**Created:** 2026-01-16
**Based on:** Real implementation journey with Better Auth + FastAPI + Neon PostgreSQL

---

## When to Use This Skill

Invoke this skill when you need to:
- Implement stateless JWT authentication between Next.js frontend (Better Auth) and FastAPI backend
- Verify JWT tokens without database lookups on every request
- Understand Better Auth's two-cookie architecture
- Integrate Better Auth with a separate backend service
- Implement path-based security with JWT tokens

---

## The Complete Journey: Problems & Solutions

### Problem 1: JWT Token Not in Expected Cookie

**Initial Expectation:**
```
Cookie: better-auth.session_token = eyJ... (JWT format)
```

**Reality Discovered:**
```
Cookie: better-auth.session_token = ZYxRoYkg... (Database session ID)
Cookie: better-auth.session_data = eyJ... (JWT format)
```

**Root Cause:**
Better Auth uses a **two-cookie architecture** by design:
- `session_token`: Primary mechanism (database session ID)
- `session_data`: Performance cache (JWT token)

**Why This Happens:**
Better Auth prioritizes reliability over pure statelessness. The database session ID ensures sessions can be revoked, while the JWT cache provides performance optimization.

**Solution:**
Accept Better Auth's architecture and extract JWT from `session_data` cookie instead of `session_token`.

---

### Problem 2: Attempted Configuration Fix (Failed)

**What We Tried:**
```typescript
// ❌ WRONG - This doesn't exist in Better Auth
session: {
  strategy: "jwt"  // Attempted to make session_token a JWT
}
```

**Why It Failed:**
- Better Auth doesn't have a `session.strategy` configuration
- The `session_token` cookie format cannot be changed
- It will always contain a database session ID

**Lesson Learned:**
Don't try to fight the framework's design. Understand the architecture first before attempting configuration changes.

---

### Problem 3: Finding the Right Configuration

**Research Phase Discovery:**
Better Auth has a `cookieCache` configuration that controls the `session_data` cookie:

```typescript
// ✅ CORRECT - Configure JWT in session_data
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24,
  cookieCache: {
    enabled: true,           // ✅ Enables session_data cookie
    maxAge: 60 * 60 * 24 * 7, // ✅ 7-day JWT expiration
    strategy: "jwt",          // ✅ JWT format in session_data
    refreshCache: true,       // ✅ Stateless refresh
  },
}
```

**Key Insight:**
The `strategy: "jwt"` goes inside `cookieCache`, not at the session level.

---

### Problem 4: Backend Extracting from Wrong Cookie

**Initial Backend Code:**
```python
# ❌ WRONG - Looking for JWT in session_token
async def get_current_user(
    session_token: Optional[str] = Cookie(None, alias="better-auth.session_token")
):
    # This extracts database session ID, not JWT
    payload = verify_jwt_token(session_token)  # Fails!
```

**Why It Failed:**
- `session_token` contains database session ID (random string)
- JWT is in `session_data` cookie
- Backend was trying to decode a non-JWT string

**Solution:**
```python
# ✅ CORRECT - Extract JWT from session_data
async def get_current_user(
    session_data: Optional[str] = Cookie(None, alias="better-auth.session_data")
):
    if not session_data:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Extract user ID from Better Auth JWT
    user_id = extract_user_id_from_token(session_data)
    return user_id
```

---

### Problem 5: JWT Structure Mismatch (Critical)

**Expected JWT Structure (Standard):**
```json
{
  "sub": "user_id_here",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Actual Better Auth JWT Structure:**
```json
{
  "session": {
    "expiresAt": "2026-01-22T19:45:30.690Z",
    "token": "...",
    "userId": "T8pnDEOYre1pBbeDrYWUoOtQmdHKR2au",
    "id": "..."
  },
  "user": {
    "id": "T8pnDEOYre1pBbeDrYWUoOtQmdHKR2au",
    "email": "user@example.com",
    "name": "User Name"
  },
  "iat": 1768506330,
  "exp": 1769111130
}
```

**The Problem:**
```python
# ❌ WRONG - Looking for 'sub' claim
user_id = payload.get("sub")  # Returns None!
```

**Why It Failed:**
- Standard JWTs use `sub` claim for user ID
- Better Auth uses nested structure: `payload.user.id`
- Backend returned 401 "Could not validate credentials"

**Solution:**
```python
# ✅ CORRECT - Extract from nested structure
def extract_user_id_from_token(token: str) -> str:
    payload = verify_jwt_token(token)

    # Better Auth JWT structure: payload.user.id
    user_data = payload.get("user", {})
    user_id = user_data.get("id")

    if not user_id:
        raise JWTError("Token missing user ID (user.id claim)")

    return user_id
```

**Critical Validation:**
```python
def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    payload = jwt.decode(
        token,
        settings.BETTER_AUTH_SECRET,
        algorithms=["HS256"],
        options={
            "verify_signature": True,
            "verify_exp": True,
            "verify_iat": True,
        }
    )

    # Validate Better Auth JWT structure
    if "user" not in payload or "id" not in payload.get("user", {}):
        raise JWTError("Token missing user information")

    return payload
```

---

## Architecture Overview

### Frontend (Next.js + Better Auth)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Signs In                                              │
│       ↓                                                     │
│  Better Auth creates session in database                    │
│       ↓                                                     │
│  TWO cookies created:                                       │
│  1. session_token: Database session ID (ZYxRoYkg...)        │
│  2. session_data: JWT cache (eyJ...)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Both cookies sent automatically
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Extracts JWT from session_data cookie                      │
│       ↓                                                     │
│  Verifies JWT signature (STATELESS)                         │
│  NO DATABASE LOOKUP                                         │
│       ↓                                                     │
│  Extracts user.id from nested structure                     │
│       ↓                                                     │
│  Returns user data                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Guide

### Step 1: Frontend Configuration

**File:** `frontend/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

export const auth = betterAuth({
  database: pool, // ✅ Pass Pool directly

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,              // ✅ Enable JWT cache
      maxAge: 60 * 60 * 24 * 7,   // ✅ 7-day expiration
      strategy: "jwt",             // ✅ JWT format
      refreshCache: true,          // ✅ Stateless refresh
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
```

**Key Points:**
- ✅ `cookieCache.enabled: true` - Generates session_data JWT
- ✅ `cookieCache.strategy: "jwt"` - JWT format (not encrypted)
- ✅ `cookieCache.maxAge` - Controls JWT expiration
- ✅ `refreshCache: true` - Enables stateless token refresh

---

### Step 2: Backend JWT Verification

**File:** `backend/app/auth/jwt.py`

```python
from datetime import datetime
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.config import settings


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token and return decoded payload.

    Better Auth JWT Structure:
    {
      "session": {...},
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name"
      },
      "iat": 1234567890,
      "exp": 1234567890
    }
    """
    try:
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
            }
        )

        # Better Auth JWT structure has user info nested under "user" key
        # Validate required claims
        if "user" not in payload or "id" not in payload.get("user", {}):
            raise JWTError("Token missing user information")

        # Validate expiration
        exp = payload.get("exp")
        if exp:
            exp_datetime = datetime.fromtimestamp(exp)
            if exp_datetime < datetime.utcnow():
                raise JWTError("Token has expired")

        return payload

    except JWTError as e:
        raise JWTError(f"Token verification failed: {str(e)}")
    except Exception as e:
        raise JWTError(f"Unexpected error during token verification: {str(e)}")


def extract_user_id_from_token(token: str) -> str:
    """
    Extract user ID from JWT token.

    Better Auth stores user ID in payload.user.id (not payload.sub).
    """
    payload = verify_jwt_token(token)

    # Better Auth JWT structure: payload.user.id
    user_data = payload.get("user", {})
    user_id = user_data.get("id")

    if not user_id:
        raise JWTError("Token missing user ID (user.id claim)")

    return user_id
```

**Critical Points:**
- ✅ Uses `HS256` algorithm (Better Auth default)
- ✅ Verifies signature with `BETTER_AUTH_SECRET`
- ✅ Validates Better Auth's nested structure
- ✅ Extracts user ID from `payload.user.id` (not `payload.sub`)
- ✅ NO database queries performed

---

### Step 3: Backend Authentication Dependencies

**File:** `backend/app/auth/dependencies.py`

```python
from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie
from jose import JWTError

from app.auth.jwt import extract_user_id_from_token


async def get_current_user(
    session_data: Optional[str] = Cookie(None, alias="better-auth.session_data")
) -> str:
    """
    Get current authenticated user ID from JWT token in session_data cookie (STATELESS).

    This dependency:
    1. Extracts the JWT token from better-auth.session_data cookie
    2. Verifies token signature using BETTER_AUTH_SECRET (NO database query)
    3. Extracts user_id from token user.id claim (Better Auth nested structure)
    4. Returns user_id string

    NO DATABASE QUERIES ARE PERFORMED - This is purely cryptographic verification.
    """
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        # Extract user ID from Better Auth JWT (handles nested user.id structure)
        user_id = extract_user_id_from_token(session_data)
        return user_id

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def verify_path_user_id(
    user_id: str,
    token_user_id: str = Depends(get_current_user)
) -> str:
    """
    Verify that user_id in URL path matches user_id from JWT token.

    This implements path-based security to prevent users from accessing
    other users' resources by manipulating the URL.
    """
    if user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in path does not match token user ID"
        )

    return user_id
```

**Key Points:**
- ✅ Extracts JWT from `better-auth.session_data` cookie
- ✅ Uses `extract_user_id_from_token()` to handle nested structure
- ✅ Returns 401 for missing/invalid tokens
- ✅ Path-based security with `verify_path_user_id()`
- ✅ Returns 403 for mismatched user IDs

---

### Step 4: Backend API Endpoint

**File:** `backend/app/api/v1/endpoints/auth.py`

```python
from fastapi import APIRouter, Depends
from app.auth.dependencies import verify_path_user_id

router = APIRouter()


@router.get("/users/{user_id}/me")
async def get_current_user_info(
    user_id: str = Depends(verify_path_user_id)
):
    """
    Get current user information from JWT token (STATELESS).

    Security:
    - Requires valid JWT in session_data cookie
    - Path user_id must match token user_id (403 if mismatch)
    - NO database queries performed
    """
    return {
        "user_id": user_id,
        "status": "authenticated",
        "message": "Token verified statelessly - no database lookup performed"
    }
```

**Key Points:**
- ✅ Uses `verify_path_user_id` dependency
- ✅ Enforces path-based security
- ✅ Returns user data from token claims only
- ✅ NO database queries

---

### Step 5: CORS Configuration

**File:** `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,                    # ✅ Required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Critical:**
- ✅ `allow_credentials=True` - Required for cookie-based auth
- ✅ Specific origin (not "*") when using credentials

---

## Testing Strategy

### Test Script Structure

```bash
#!/bin/bash
# test-hybrid-auth.sh

# Test 1: Valid JWT with matching user_id
curl -H "Cookie: better-auth.session_data=$JWT" \
  http://localhost:8000/api/v1/users/$USER_ID/me

# Expected: 200 OK with user data

# Test 2: Valid JWT with mismatched user_id
curl -H "Cookie: better-auth.session_data=$JWT" \
  http://localhost:8000/api/v1/users/wrong-user-id/me

# Expected: 403 Forbidden

# Test 3: No cookies
curl http://localhost:8000/api/v1/users/$USER_ID/me

# Expected: 401 Unauthorized
```

### Verification Checklist

- [ ] Frontend generates two cookies: `session_token` and `session_data`
- [ ] `session_data` starts with `eyJ` (JWT format)
- [ ] JWT decodes correctly on jwt.io
- [ ] JWT contains nested `user.id` field
- [ ] Backend API returns 200 OK with valid JWT + matching user_id
- [ ] Backend API returns 403 Forbidden with valid JWT + wrong user_id
- [ ] Backend API returns 401 Unauthorized with no cookies
- [ ] Backend logs show NO database queries during token verification

---

## Common Pitfalls & Solutions

### Pitfall 1: Looking for JWT in Wrong Cookie

**Symptom:**
```
JWTError: Not enough segments
```

**Cause:**
Trying to decode `session_token` (database ID) as JWT.

**Solution:**
Always extract from `better-auth.session_data` cookie.

---

### Pitfall 2: Using Standard JWT Claims

**Symptom:**
```
401 Unauthorized: Could not validate credentials
```

**Cause:**
Looking for `payload.sub` instead of `payload.user.id`.

**Solution:**
Use Better Auth's nested structure: `payload.get("user", {}).get("id")`.

---

### Pitfall 3: Missing cookieCache Configuration

**Symptom:**
Only `session_token` cookie exists, no `session_data`.

**Cause:**
`cookieCache.enabled` not set to `true`.

**Solution:**
```typescript
session: {
  cookieCache: {
    enabled: true,  // ✅ Must be true
    strategy: "jwt",
  },
}
```

---

### Pitfall 4: CORS Not Allowing Credentials

**Symptom:**
Cookies not sent to backend in cross-origin requests.

**Cause:**
`allow_credentials=True` not set in CORS middleware.

**Solution:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,  # ✅ Required
    allow_origins=["http://localhost:3000"],  # ✅ Specific origin
)
```

---

### Pitfall 5: Frontend Not Sending Cookies

**Symptom:**
Backend receives no cookies even though they exist in browser.

**Cause:**
`credentials: 'include'` not set in fetch requests.

**Solution:**
```typescript
fetch('http://localhost:8000/api/v1/users/123/me', {
  credentials: 'include'  // ✅ Required for cross-origin cookies
})
```

---

## Environment Variables

### Frontend `.env.local`

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
BETTER_AUTH_SECRET="your-secret-here-32-chars-minimum"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Backend `.env`

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
BETTER_AUTH_SECRET="your-secret-here-32-chars-minimum"
```

**Critical:**
- ✅ `BETTER_AUTH_SECRET` must be IDENTICAL in frontend and backend
- ✅ Generate with: `openssl rand -base64 32`
- ✅ Minimum 32 characters for security

---

## Success Indicators

You know the implementation is working when:

✅ **Frontend:**
- Two cookies exist: `session_token` and `session_data`
- `session_data` starts with `eyJ` (JWT format)
- JWT decodes on jwt.io showing nested `user.id`
- JWT expires in 7 days (check `exp` claim)

✅ **Backend:**
- API returns 200 OK with valid JWT + matching user_id
- API returns 403 Forbidden with valid JWT + wrong user_id
- API returns 401 Unauthorized with no cookies
- Backend logs show NO database queries during token verification
- Message confirms "Token verified statelessly"

✅ **Integration:**
- User can sign in and access protected backend endpoints
- Sessions persist across page refreshes
- Sign out invalidates frontend session (JWT cache persists until expiration)
- Path-based security prevents unauthorized access

---

## Trade-offs & Limitations

### Session Revocation Limitation

**Issue:**
JWT cache remains valid until expiration (up to 7 days), even after sign-out.

**Why:**
Backend verifies JWT statelessly without checking database. It cannot know if session was revoked.

**Mitigation Options:**
1. Accept as trade-off for stateless performance (recommended for most cases)
2. Use shorter JWT expiration for sensitive operations (e.g., 5 minutes)
3. Implement token blacklist for critical security events (adds database dependency)
4. Use refresh token rotation for long-lived sessions

**Recommendation:**
For most applications, accept the trade-off. The performance benefits of stateless verification outweigh the revocation delay risk.

---

## Architecture Decision Rationale

### Why Hybrid Approach?

**Option A: Pure Database Sessions (Rejected)**
- ❌ Database query on every request
- ❌ Poor performance at scale
- ✅ Immediate session revocation

**Option B: Pure JWT Tokens (Not Possible with Better Auth)**
- ❌ Better Auth doesn't support this architecture
- ❌ Would require custom authentication implementation

**Option C: Hybrid (Chosen)**
- ✅ Stateless backend verification (no database queries)
- ✅ Works with Better Auth's architecture
- ✅ Good performance
- ⚠️ Session revocation delayed until JWT expiration

**Decision:**
Hybrid approach provides the best balance of performance, compatibility, and security for most use cases.

---

## Quick Reference Commands

### Decode JWT in Terminal

```bash
# Extract payload from JWT
echo "eyJ..." | cut -d'.' -f2 | base64 -d | jq
```

### Test Backend Endpoint

```bash
# With cookies
curl -H "Cookie: better-auth.session_data=eyJ..." \
  http://localhost:8000/api/v1/users/USER_ID/me

# Expected: 200 OK
```

### Verify No Database Queries

```bash
# Watch backend logs during API call
# Should see NO SELECT statements
```

### Generate BETTER_AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Troubleshooting Guide

### Issue: 401 "Not authenticated"

**Check:**
1. Is `session_data` cookie present?
2. Does cookie start with `eyJ`?
3. Is cookie being sent to backend? (Check Network tab)
4. Is `credentials: 'include'` set in fetch?

### Issue: 401 "Could not validate credentials"

**Check:**
1. Is `BETTER_AUTH_SECRET` identical in frontend and backend?
2. Is JWT structure correct? (Check for nested `user.id`)
3. Is JWT expired? (Check `exp` claim)
4. Is backend using `extract_user_id_from_token()`?

### Issue: 403 "User ID in path does not match"

**Check:**
1. Is user_id in URL path correct?
2. Does it match the `user.id` in JWT?
3. Is `verify_path_user_id` dependency used?

### Issue: No `session_data` cookie

**Check:**
1. Is `cookieCache.enabled: true`?
2. Is `cookieCache.strategy: "jwt"`?
3. Did you restart frontend server after config change?
4. Did you sign in AFTER making config changes?

---

## Migration from Other Auth Systems

### From Auth0/Clerk

**Key Differences:**
- Better Auth uses two cookies (not one)
- JWT is in `session_data`, not `session_token`
- JWT structure is nested, not flat
- Backend extracts from cookies, not Authorization header

**Migration Steps:**
1. Update frontend to Better Auth configuration
2. Update backend to extract from `session_data` cookie
3. Update JWT verification to handle nested structure
4. Update CORS to allow credentials
5. Test complete authentication flow

---

## Performance Characteristics

### Backend Token Verification

**Stateless Verification:**
- ⚡ ~1-2ms per request (cryptographic verification only)
- ⚡ No database connection required
- ⚡ Scales horizontally without database bottleneck

**Database Session Verification (Alternative):**
- 🐌 ~10-50ms per request (database query + network latency)
- 🐌 Database connection pool required
- 🐌 Database becomes bottleneck at scale

**Conclusion:**
Stateless JWT verification is 5-50x faster than database session verification.

---

## Security Considerations

### JWT Secret Management

**Critical:**
- ✅ Use strong secret (minimum 32 characters)
- ✅ Generate with cryptographically secure method
- ✅ Store in environment variables (never commit to git)
- ✅ Rotate periodically (requires re-authentication)

### Path-Based Security

**Why It Matters:**
Without path-based security, users could access other users' data by changing the URL:

```
# Without path security:
GET /api/v1/users/OTHER_USER_ID/me  # ❌ Would succeed!

# With path security:
GET /api/v1/users/OTHER_USER_ID/me  # ✅ Returns 403 Forbidden
```

**Implementation:**
Always use `verify_path_user_id` dependency for user-specific endpoints.

### HTTPS in Production

**Critical:**
- ✅ Always use HTTPS in production
- ✅ Set `useSecureCookies: true` in Better Auth config
- ✅ Cookies will have `Secure` flag (only sent over HTTPS)

---

## Skill Invocation

To use this skill in future projects:

```bash
/stateless_better_auth
```

Or invoke specific sections:
```bash
/stateless_better_auth --section="implementation"
/stateless_better_auth --section="troubleshooting"
/stateless_better_auth --section="testing"
```

---

## Related Skills

- `/debug_better_auth` - Diagnose Better Auth integration issues
- `/sp.plan` - Plan authentication system architecture
- `/sp.tasks` - Generate implementation tasks

---

## Additional Resources

- **Better Auth Docs:** https://www.better-auth.com/docs
- **Better Auth Cookie Cache:** https://www.better-auth.com/docs/concepts/session#cookie-cache
- **FastAPI Security:** https://fastapi.tiangolo.com/tutorial/security/
- **JWT.io:** https://jwt.io (decode and verify JWTs)

---

**Last Updated:** 2026-01-16
**Tested With:** Better Auth (latest), Next.js 16, FastAPI, Neon PostgreSQL
**Status:** Production-ready
**Implementation Time:** ~4 hours (with this guide: ~1 hour)

---

## Lessons Learned

### 1. Understand the Framework First

Don't try to force a framework into your expected architecture. Understand how it works, then adapt your implementation.

### 2. Read the Actual JWT Structure

Don't assume standard JWT claims. Decode the actual token and inspect the structure.

### 3. Test Each Layer Independently

- Test frontend cookie generation first
- Test JWT decoding separately
- Test backend verification in isolation
- Then test integration

### 4. Use Automated Testing

Create test scripts to verify all scenarios:
- Valid token + matching user_id
- Valid token + wrong user_id
- No token
- Expired token

### 5. Document the Journey

Future developers will face the same issues. Document problems and solutions to save time.

---

**End of Skill**
