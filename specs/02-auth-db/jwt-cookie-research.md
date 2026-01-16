# Research: Better Auth JWT Tokens in Cookies

**Date**: 2026-01-15
**Question**: Can Better Auth store JWT tokens directly in httpOnly cookies as the PRIMARY session mechanism?

## Executive Summary

**YES**, Better Auth CAN be configured to store JWT tokens directly in httpOnly cookies as the primary session mechanism. This is achieved using the `session.cookieCache.strategy: "jwt"` configuration option.

## Current Implementation vs Specification

### Current State
- **Session Token Format**: Random string (e.g., `ZYxRoYkgU8tlrAEkc5bM5iDTfWKBVT3L...`)
- **Storage**: httpOnly cookies
- **Session Data**: Stored in database
- **JWT Plugin**: Generates JWT tokens on-demand via `/api/auth/token` endpoint
- **Cookie Cache Strategy**: Default "compact" format (5-minute cache)

### Specification Requirement
- **FR-011**: "Frontend MUST store authentication tokens securely (httpOnly cookies or secure storage)"
- **Expected Format**: JWT tokens in format `eyJ...` (standard JWT)
- **Backend Verification**: Stateless JWT verification using shared secret

### Gap Analysis
The current implementation stores **session tokens** (random strings) in cookies, not **JWT tokens**. The JWT plugin generates JWTs on-demand but does NOT replace the primary session mechanism.

## Research Findings

### 1. Can Better Auth Use JWT Tokens as PRIMARY Session Mechanism?

**Answer: YES**

Better Auth supports three cookie cache strategies:

1. **"compact"** (default): Base64url encoding with HMAC-SHA256 signature
   - Smallest size, best performance
   - NOT JWT-compliant
   - Used internally by Better Auth only

2. **"jwt"**: Standard JWT with HMAC-SHA256 signature (HS256)
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...`
   - Signed but not encrypted (readable by anyone, tamper-proof)
   - JWT spec compliant for interoperability
   - Can be verified by third-party tools

3. **"jwe"**: JSON Web Encryption with A256CBC-HS512
   - Fully encrypted (neither readable nor tamperable)
   - Most secure, largest size
   - Default for stateless mode (no database)

### 2. Configuration Required

To store JWT tokens in cookies as the primary session mechanism:

```typescript
export const auth = betterAuth({
  database: pool, // Keep database for user accounts

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days (match session expiration)
      strategy: "jwt", // KEY CHANGE: Use JWT format
      refreshCache: true, // Enable stateless refresh
    },
  },

  // Other configuration remains the same
  secret: process.env.BETTER_AUTH_SECRET!,
  // ...
});
```

### 3. How It Works

**With `strategy: "jwt"`:**

1. **Sign-in**: User authenticates → Better Auth creates session
2. **Cookie Storage**: Session data encoded as JWT token (eyJ...) stored in httpOnly cookie
3. **Subsequent Requests**: Better Auth reads JWT from cookie, verifies signature statelessly
4. **Backend Verification**: Backend can extract JWT from cookie and verify using shared secret
5. **No Database Queries**: Session validation is purely cryptographic (stateless)

**Cookie Name**: `better-auth.session_token` (or custom prefix)
**Cookie Value**: Standard JWT token (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNzM3MDAwMDAwfQ.signature`)

### 4. JWT Token Structure

When using `strategy: "jwt"`, the cookie contains a standard JWT with:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**
- Standard claims: `sub` (user ID), `exp` (expiration), `iat` (issued at)
- Session data: User information, session metadata
- Custom claims: Can be added via configuration

**Signature:**
- HMAC-SHA256 using `BETTER_AUTH_SECRET`

### 5. Backend Verification

The backend can verify these JWT tokens statelessly:

```python
# Backend (FastAPI) - Already implemented
from jose import jwt

def verify_jwt_token(token: str, secret: str) -> dict:
    payload = jwt.decode(
        token,
        secret,
        algorithms=['HS256'],
        options={
            'verify_signature': True,
            'verify_exp': True,
        }
    )
    return payload
```

**Key Point**: The backend can extract the JWT from the cookie and verify it using the same `BETTER_AUTH_SECRET` that Better Auth uses for signing.

### 6. Hybrid Mode: Database + JWT Sessions

Better Auth supports a **hybrid architecture**:

- **User Accounts**: Stored in database (Neon PostgreSQL)
- **Sessions**: Stateless JWT tokens in cookies (no database queries for verification)

This matches the project's architecture:
- Frontend: Better Auth with database for user management
- Backend: Stateless JWT verification (no database access)

### 7. Trade-offs

#### Advantages of JWT Strategy
✅ Standard JWT format (eyJ...) matching specification
✅ Stateless verification (no database queries)
✅ Interoperable with external systems
✅ Backend can verify tokens independently
✅ Readable payload (can inspect claims)

#### Disadvantages
❌ Larger cookie size than "compact" format
❌ Session revocation delayed: Revoked sessions remain active until cookie expires
❌ Cannot force immediate logout on other devices
❌ Readable by anyone (not encrypted, only signed)

#### Session Revocation Limitation

**Critical Consideration**: When using `cookieCache`, revoked sessions may remain active on other devices until the cookie expires. The server cannot directly delete cookies from client browsers.

**Mitigation Strategies**:
1. Set shorter `maxAge` (e.g., 1 hour instead of 7 days)
2. Use session versioning (increment version on password change)
3. Disable `cookieCache` for sensitive operations
4. Accept delayed revocation as trade-off for stateless performance

### 8. Comparison: JWT Plugin vs Cookie Cache JWT Strategy

| Feature | JWT Plugin | Cookie Cache JWT Strategy |
|---------|-----------|---------------------------|
| **Purpose** | On-demand JWT for external services | Primary session mechanism |
| **Token Location** | Generated via `/api/auth/token` | Stored in httpOnly cookie |
| **Usage** | Authorization header for APIs | Automatic cookie-based auth |
| **Format** | JWT (eyJ...) | JWT (eyJ...) |
| **Verification** | JWKS endpoint for external services | Stateless signature verification |
| **Replaces Sessions?** | NO (supplementary) | YES (primary mechanism) |

**Conclusion**: The JWT plugin does NOT replace session tokens. To store JWT tokens in cookies as the primary mechanism, use `cookieCache.strategy: "jwt"`.

## Answer to Research Questions

### 1. Can Better Auth be configured to use JWT tokens as the PRIMARY session mechanism stored in cookies?

**YES**. Set `session.cookieCache.strategy: "jwt"` to store JWT tokens directly in httpOnly cookies as the primary authentication mechanism.

### 2. Is there a `session.strategy` or similar configuration?

**YES**. The configuration is `session.cookieCache.strategy` with three options:
- `"compact"` (default): Proprietary format, smallest size
- `"jwt"`: Standard JWT format (HS256)
- `"jwe"`: Encrypted JWT format

### 3. Are there alternative Better Auth configurations or plugins?

**YES**. Alternative approaches:
- **Stateless Mode**: Omit database configuration → automatic JWE cookies
- **Hybrid Mode**: Database for users + JWT cookies for sessions (recommended)
- **Bearer Plugin**: Session tokens in Authorization header (not cookies)
- **JWT Plugin**: On-demand JWT generation (supplementary, not primary)

### 4. What are the trade-offs?

**JWT in Cookies (strategy: "jwt")**:
- ✅ Standard format, stateless verification, interoperable
- ❌ Larger size, delayed revocation, readable payload

**Session Tokens (current)**:
- ✅ Immediate revocation, smaller cookies
- ❌ Database queries required, not JWT-compliant

**Recommendation**: Use JWT strategy if specification requires JWT format and stateless verification is priority. Accept delayed revocation as trade-off.

### 5. Does Better Auth support "JWT-based sessions"?

**YES**. Better Auth supports JWT-based sessions where the cookie itself contains the JWT token. This is achieved via `cookieCache.strategy: "jwt"` and provides:
- Standard JWT tokens in httpOnly cookies
- Stateless verification using shared secret
- No database queries for session validation
- JWT spec compliance for interoperability

## Architectural Constraints

### Why JWT Plugin Doesn't Replace Sessions

The Better Auth documentation explicitly states:

> "This plugin is not meant as a replacement for the session. It's meant to be used for services that require JWT tokens."

The JWT plugin generates tokens for **external service authentication**, not for replacing the primary session mechanism. To use JWT tokens as the primary session mechanism, configure `cookieCache.strategy: "jwt"`.

### Stateless vs Database Sessions

Better Auth supports two session models:

1. **Database Sessions** (default):
   - Session data stored in database
   - Session token (random string) in cookie
   - Database query on every request
   - Immediate revocation possible

2. **Stateless Sessions** (with cookieCache):
   - Session data encoded in cookie (JWT or JWE)
   - No database queries for validation
   - Cryptographic verification only
   - Delayed revocation (until cookie expires)

The project can use **hybrid mode**: Database for user accounts, stateless JWT sessions for authentication.

## Recommended Configuration

To match the specification requirement (JWT tokens in httpOnly cookies):

```typescript
// frontend/lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const auth = betterAuth({
  database: pool, // Keep database for user accounts

  emailAndPassword: {
    enabled: true,
    passwordValidation: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: true,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["email-password", "google"],
      requireSameEmail: true,
    },
  },

  // KEY CHANGE: Configure JWT tokens in cookies
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days (match session expiration)
      strategy: "jwt", // Store JWT tokens in cookies
      refreshCache: true, // Enable stateless refresh
    },
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  rateLimit: {
    enabled: true,
    window: 60,
    max: 5,
    storage: "memory",
  },

  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
  ],

  // JWT Plugin: Keep for on-demand token generation (optional)
  plugins: [
    jwt({
      jwt: {
        algorithm: "HS256",
        issuer: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        audience: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        expirationTime: "7d",
      }
    }),
  ],
});
```

### Changes Required

**Current Configuration**:
```typescript
cookieCache: {
  enabled: true,
  maxAge: 60 * 5, // 5 minutes
  // No strategy specified → defaults to "compact"
}
```

**New Configuration**:
```typescript
cookieCache: {
  enabled: true,
  maxAge: 60 * 60 * 24 * 7, // 7 days (match session expiration)
  strategy: "jwt", // ADD THIS LINE
  refreshCache: true, // ADD THIS LINE
}
```

## Backend Compatibility

The backend is already configured for stateless JWT verification. With `strategy: "jwt"`, the backend can:

1. Extract JWT token from `better-auth.session_token` cookie
2. Verify signature using `BETTER_AUTH_SECRET`
3. Extract user ID from `sub` claim
4. No database queries required

**No backend changes needed** - the existing JWT verification logic works with JWT tokens from cookies.

## Conclusion

**It IS possible** to configure Better Auth to store JWT tokens directly in httpOnly cookies as the primary session mechanism. This is achieved by setting `session.cookieCache.strategy: "jwt"`.

**Key Findings**:
1. ✅ JWT tokens can be the primary session mechanism (not just supplementary)
2. ✅ Configuration: `session.cookieCache.strategy: "jwt"`
3. ✅ Hybrid mode supported: Database for users + JWT sessions
4. ✅ Backend can verify JWT tokens statelessly using shared secret
5. ⚠️ Trade-off: Session revocation delayed until cookie expires

**Recommendation**: Update the configuration to use `strategy: "jwt"` to match the specification requirement for JWT tokens in httpOnly cookies. Accept delayed revocation as a trade-off for stateless performance and JWT spec compliance.

## References

- Better Auth Session Management: https://www.better-auth.com/docs/concepts/session-management
- Better Auth JWT Plugin: https://www.better-auth.com/docs/plugins/jwt
- Better Auth Bearer Plugin: https://www.better-auth.com/docs/plugins/bearer
- Context7 Better Auth Documentation: /better-auth/better-auth
