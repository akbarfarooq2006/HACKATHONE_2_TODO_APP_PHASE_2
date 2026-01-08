# Data Model: Authentication System

**Feature**: Authentication System and Database Connectivity
**Branch**: `02-auth-db`
**Date**: 2026-01-09
**Status**: Complete

## Overview

This document defines the database schema for the authentication system. The schema is **managed by Better Auth** on the frontend, which automatically creates and maintains these tables in the Neon PostgreSQL database. The backend uses **read-only SQLModel models** to access user data for token verification.

**Schema Ownership**: Better Auth (Frontend)
**Backend Access**: Read-only via SQLModel
**Database**: Neon Serverless PostgreSQL

---

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │◄─────┐
│ email (UNIQUE)  │      │
│ emailVerified   │      │
│ name            │      │
│ image           │      │
│ createdAt       │      │
│ updatedAt       │      │
└─────────────────┘      │
         ▲               │
         │               │
         │               │
    ┌────┴────┐     ┌────┴────┐
    │         │     │         │
┌───┴─────────┴───┐ │ ┌───────┴─────────┐
│    Session      │ │ │    Account      │
│─────────────────│ │ │─────────────────│
│ id (PK)         │ │ │ id (PK)         │
│ userId (FK)     │─┘ │ userId (FK)     │
│ expiresAt       │   │ provider        │
│ token           │   │ providerAcctId  │
│ ipAddress       │   │ accessToken     │
│ userAgent       │   │ refreshToken    │
│ createdAt       │   │ expiresAt       │
└─────────────────┘   │ createdAt       │
                      └─────────────────┘
         ▲
         │
         │
┌────────┴──────────┐
│   Verification    │
│───────────────────│
│ id (PK)           │
│ userId (FK)       │
│ token             │
│ type              │
│ expiresAt         │
│ createdAt         │
└───────────────────┘
```

---

## Core Entities

### 1. User

**Purpose**: Represents an authenticated user account in the system.

**Table Name**: `user`

**Schema**:

| Column         | Type      | Constraints                    | Description                                    |
|----------------|-----------|--------------------------------|------------------------------------------------|
| id             | UUID      | PRIMARY KEY                    | Unique user identifier                         |
| email          | VARCHAR   | UNIQUE, NOT NULL, INDEX        | User's email address                           |
| emailVerified  | BOOLEAN   | DEFAULT FALSE                  | Whether email has been verified                |
| name           | VARCHAR   | NULLABLE                       | User's display name                            |
| image          | VARCHAR   | NULLABLE                       | URL to user's profile image                    |
| createdAt      | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Account creation timestamp                     |
| updatedAt      | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Last update timestamp                          |

**Relationships**:
- Has many `Session` (one-to-many)
- Has many `Account` (one-to-many)
- Has many `Verification` (one-to-many)

**Lifecycle**:
1. **Created**: When user signs up via email/password or OAuth
2. **Updated**: When user profile information changes
3. **Linked**: When OAuth account is linked to existing email account
4. **Deleted**: Soft-delete or hard-delete (out of scope for this phase)

**Indexes**:
- Primary key on `id`
- Unique index on `email`

**Backend Model** (`app/models/user.py`):
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class User(SQLModel, table=True):
    """
    User model (read-only for backend).
    Schema managed by Better Auth on frontend.
    """
    __tablename__ = "user"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    emailVerified: bool = Field(default=False, alias="emailVerified")
    name: Optional[str] = None
    image: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    class Config:
        populate_by_name = True  # Allow both snake_case and camelCase
```

**Validation Rules**:
- Email must be valid email format
- Email must be unique across all users
- Password (if email/password auth) must meet complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

**Business Rules**:
- Account linking: Users with same email from different providers (email/password and Google OAuth) are merged into single user record
- Email verification: Optional for this phase (emailVerified may remain false)
- Profile updates: Name and image can be updated after account creation

---

### 2. Session

**Purpose**: Represents an active user session with JWT token information.

**Table Name**: `session`

**Schema**:

| Column      | Type      | Constraints                    | Description                                    |
|-------------|-----------|--------------------------------|------------------------------------------------|
| id          | UUID      | PRIMARY KEY                    | Unique session identifier                      |
| userId      | UUID      | FOREIGN KEY (user.id), INDEX   | Reference to user who owns this session        |
| expiresAt   | TIMESTAMP | NOT NULL                       | Session expiration time (7 days from creation) |
| token       | TEXT      | NOT NULL                       | JWT token string                               |
| ipAddress   | VARCHAR   | NULLABLE                       | IP address of session creation                 |
| userAgent   | TEXT      | NULLABLE                       | Browser/client user agent string               |
| createdAt   | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Session creation timestamp                     |

**Relationships**:
- Belongs to `User` (many-to-one)

**Lifecycle**:
1. **Created**: When user signs in successfully
2. **Active**: Valid until `expiresAt` timestamp
3. **Expired**: Automatically invalid after 7 days
4. **Deleted**: When user signs out or session expires

**Indexes**:
- Primary key on `id`
- Foreign key index on `userId`

**Session Duration**: 7 days (604,800 seconds)

**Concurrent Sessions**: Unlimited - users can have multiple active sessions across different devices

**Backend Access**: Backend does NOT directly query session table; it verifies JWT tokens cryptographically

---

### 3. Account

**Purpose**: Links users to OAuth providers (Google, etc.) for social authentication.

**Table Name**: `account`

**Schema**:

| Column            | Type      | Constraints                    | Description                                    |
|-------------------|-----------|--------------------------------|------------------------------------------------|
| id                | UUID      | PRIMARY KEY                    | Unique account identifier                      |
| userId            | UUID      | FOREIGN KEY (user.id), INDEX   | Reference to user who owns this account        |
| provider          | VARCHAR   | NOT NULL                       | OAuth provider name (e.g., "google")           |
| providerAccountId | VARCHAR   | NOT NULL                       | User's ID in the OAuth provider's system       |
| accessToken       | TEXT      | NULLABLE, ENCRYPTED            | OAuth access token (encrypted)                 |
| refreshToken      | TEXT      | NULLABLE, ENCRYPTED            | OAuth refresh token (encrypted)                |
| expiresAt         | TIMESTAMP | NULLABLE                       | OAuth token expiration time                    |
| createdAt         | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Account link creation timestamp                |

**Relationships**:
- Belongs to `User` (many-to-one)

**Lifecycle**:
1. **Created**: When user signs in with OAuth provider for first time
2. **Linked**: When OAuth account is linked to existing email/password account
3. **Updated**: When OAuth tokens are refreshed
4. **Deleted**: When user unlinks OAuth provider (out of scope)

**Indexes**:
- Primary key on `id`
- Foreign key index on `userId`
- Composite unique index on `(provider, providerAccountId)`

**Supported Providers** (this phase):
- `google`: Google OAuth 2.0

**Security**:
- OAuth tokens are encrypted before storage (`encryptOAuthTokens: true`)
- Tokens are never exposed to client-side code

**Account Linking Rules**:
- Enabled for email/password and Google OAuth
- Requires same email address for linking
- Different emails are NOT allowed for linking

**Backend Access**: Backend does NOT access account table; OAuth is handled entirely by Better Auth

---

### 4. Verification

**Purpose**: Stores email verification tokens and password reset tokens.

**Table Name**: `verification`

**Schema**:

| Column     | Type      | Constraints                    | Description                                    |
|------------|-----------|--------------------------------|------------------------------------------------|
| id         | UUID      | PRIMARY KEY                    | Unique verification identifier                 |
| userId     | UUID      | FOREIGN KEY (user.id), INDEX   | Reference to user for this verification        |
| token      | VARCHAR   | NOT NULL, UNIQUE               | Verification token (random string)             |
| type       | VARCHAR   | NOT NULL                       | Type: "email_verification" or "password_reset" |
| expiresAt  | TIMESTAMP | NOT NULL                       | Token expiration time                          |
| createdAt  | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Token creation timestamp                       |

**Relationships**:
- Belongs to `User` (many-to-one)

**Lifecycle**:
1. **Created**: When email verification or password reset is requested
2. **Active**: Valid until `expiresAt` timestamp
3. **Used**: Deleted after successful verification or password reset
4. **Expired**: Deleted after expiration time

**Indexes**:
- Primary key on `id`
- Foreign key index on `userId`
- Unique index on `token`

**Verification Types**:
- `email_verification`: Email verification tokens (out of scope for this phase)
- `password_reset`: Password reset tokens (out of scope for this phase)

**Token Expiration**:
- Email verification: Typically 24 hours
- Password reset: Typically 1 hour

**Backend Access**: Backend does NOT access verification table; verification is handled by Better Auth

---

## Database Constraints

### Foreign Key Constraints

```sql
-- Session references User
ALTER TABLE session
ADD CONSTRAINT fk_session_user
FOREIGN KEY (userId) REFERENCES user(id)
ON DELETE CASCADE;

-- Account references User
ALTER TABLE account
ADD CONSTRAINT fk_account_user
FOREIGN KEY (userId) REFERENCES user(id)
ON DELETE CASCADE;

-- Verification references User
ALTER TABLE verification
ADD CONSTRAINT fk_verification_user
FOREIGN KEY (userId) REFERENCES user(id)
ON DELETE CASCADE;
```

**Cascade Behavior**:
- When a user is deleted, all associated sessions, accounts, and verifications are automatically deleted

### Unique Constraints

```sql
-- User email must be unique
ALTER TABLE user
ADD CONSTRAINT uq_user_email
UNIQUE (email);

-- Account provider + providerAccountId must be unique
ALTER TABLE account
ADD CONSTRAINT uq_account_provider
UNIQUE (provider, providerAccountId);

-- Verification token must be unique
ALTER TABLE verification
ADD CONSTRAINT uq_verification_token
UNIQUE (token);
```

---

## Data Access Patterns

### Frontend (Better Auth)

**Write Operations**:
- Create user on sign-up
- Create session on sign-in
- Create account on OAuth sign-in
- Update user profile
- Delete session on sign-out
- Create verification tokens

**Read Operations**:
- Query user by email for authentication
- Query sessions for user
- Query accounts for user

### Backend (FastAPI)

**Read Operations ONLY**:
- Query user by ID (from JWT token) for verification
- Validate user exists in database

**No Write Operations**:
- Backend NEVER creates, updates, or deletes auth data
- All auth mutations handled by Better Auth on frontend

---

## Schema Migration Strategy

**Initial Setup**:
1. Better Auth automatically creates all tables on first run
2. No manual migrations needed
3. Schema is managed by Better Auth library

**Future Changes**:
- Better Auth handles schema migrations automatically
- Backend models must be updated to match Better Auth schema
- No backend migrations for auth tables

**Version Control**:
- Schema is defined by Better Auth version
- Document Better Auth version in package.json
- Backend models mirror Better Auth schema

---

## Security Considerations

### Data Encryption

**At Rest**:
- OAuth tokens encrypted before storage
- Passwords hashed with bcrypt/argon2 (Better Auth default)
- Database connection uses SSL/TLS (Neon requirement)

**In Transit**:
- All connections use HTTPS in production
- Database connections use SSL/TLS
- JWT tokens transmitted in httpOnly cookies

### Data Isolation

**User Data**:
- Each user can only access their own data
- Backend enforces user ID from verified JWT token
- No cross-user data access permitted

**Token Security**:
- JWT tokens stored in httpOnly cookies (XSS protection)
- Tokens signed with BETTER_AUTH_SECRET (HMAC-SHA256)
- Tokens expire after 7 days
- No token refresh in this phase (future enhancement)

### SQL Injection Prevention

**Frontend**:
- Better Auth uses parameterized queries
- pg library handles query escaping

**Backend**:
- SQLModel uses parameterized queries
- No raw SQL queries in application code

---

## Performance Considerations

### Indexes

**Critical Indexes**:
- `user.email` (unique index) - Fast user lookup by email
- `session.userId` (foreign key index) - Fast session queries
- `account.userId` (foreign key index) - Fast account queries
- `verification.token` (unique index) - Fast token lookup

**Query Performance**:
- User lookup by ID: O(1) with primary key
- User lookup by email: O(1) with unique index
- Session queries by user: O(log n) with foreign key index

### Connection Pooling

**Frontend**:
- pg Pool with default settings
- Suitable for serverless/edge environments

**Backend**:
- SQLModel engine with pool_size=5, max_overflow=10
- Connection pre-ping enabled for health checks

---

## Data Retention

**Active Data**:
- Users: Retained indefinitely
- Sessions: Automatically expired after 7 days
- Accounts: Retained while user account exists
- Verifications: Deleted after use or expiration

**Cleanup Strategy**:
- Better Auth handles session cleanup automatically
- Expired sessions removed from database
- Expired verification tokens removed from database

---

## Testing Considerations

### Test Data

**Sample User**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "emailVerified": false,
  "name": "Test User",
  "image": null,
  "createdAt": "2026-01-09T00:00:00Z",
  "updatedAt": "2026-01-09T00:00:00Z"
}
```

**Sample Session**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": "2026-01-16T00:00:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-01-09T00:00:00Z"
}
```

### Verification Queries

**Check user exists**:
```sql
SELECT * FROM "user" WHERE email = 'test@example.com';
```

**Check session exists**:
```sql
SELECT * FROM session WHERE "userId" = '550e8400-e29b-41d4-a716-446655440000';
```

**Check account linking**:
```sql
SELECT * FROM account WHERE "userId" = '550e8400-e29b-41d4-a716-446655440000';
```

---

## Summary

**Total Tables**: 4 (user, session, account, verification)
**Schema Owner**: Better Auth (Frontend)
**Backend Access**: Read-only (user table only)
**Database**: Neon Serverless PostgreSQL
**Connection**: Shared DATABASE_URL

**Key Principles**:
- Better Auth owns and manages schema
- Backend mirrors schema with read-only models
- No backend writes to auth tables
- All auth mutations via Better Auth
- Zero-trust: Backend always verifies tokens
