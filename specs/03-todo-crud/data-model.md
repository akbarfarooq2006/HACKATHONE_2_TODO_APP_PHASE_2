# Data Model: Todo Task Management

**Feature**: 03-todo-crud | **Date**: 2026-01-09 | **Phase**: 1 (Design)

## Overview

This document defines the database schema and entity relationships for the Todo Task Management feature. The Task entity extends the existing Phase 2 authentication system by adding a new table with a foreign key relationship to the user table.

## Entity Relationship Diagram

```text
┌─────────────────────┐
│       user          │
│ (Phase 2 existing)  │
├─────────────────────┤
│ id: UUID (PK)       │
│ email: VARCHAR      │
│ name: VARCHAR       │
│ emailVerified: BOOL │
│ createdAt: TIMESTAMP│
│ updatedAt: TIMESTAMP│
└─────────────────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────┐
│       task          │
│ (NEW)               │
├─────────────────────┤
│ id: UUID (PK)       │
│ title: VARCHAR(200) │
│ description: TEXT   │
│ completed: BOOLEAN  │
│ user_id: UUID (FK)  │◄─── Foreign Key to user.id
│ created_at: TIMESTAMP│
│ updated_at: TIMESTAMP│
└─────────────────────┘
```

**Relationship**: One user has many tasks (1:N)
**Cascade**: ON DELETE CASCADE (when user deleted, all their tasks are deleted)

## Task Entity

### Table: `task`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the task |
| `title` | VARCHAR(200) | NOT NULL | Task title (required, max 200 characters) |
| `description` | TEXT | NULL | Optional task description (max 2000 characters enforced in application) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status (false = incomplete, true = complete) |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → user.id | Owner of the task (foreign key to user table) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the task was created |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the task was last modified |

### Indexes

```sql
-- Primary key index (automatic)
CREATE INDEX idx_task_id ON task(id);

-- Foreign key index for efficient user filtering (CRITICAL for performance)
CREATE INDEX idx_task_user_id ON task(user_id);

-- Ordering index for efficient sorting by creation date
CREATE INDEX idx_task_created_at ON task(created_at DESC);

-- Composite index for the most common query pattern (optional optimization)
CREATE INDEX idx_task_user_created ON task(user_id, created_at DESC);
```

### Constraints

```sql
-- Primary key
ALTER TABLE task ADD CONSTRAINT pk_task PRIMARY KEY (id);

-- Foreign key with cascade delete
ALTER TABLE task ADD CONSTRAINT fk_task_user
  FOREIGN KEY (user_id) REFERENCES "user"(id)
  ON DELETE CASCADE;

-- Title cannot be empty
ALTER TABLE task ADD CONSTRAINT chk_task_title_not_empty
  CHECK (LENGTH(TRIM(title)) > 0);

-- Completed must be boolean
ALTER TABLE task ADD CONSTRAINT chk_task_completed_boolean
  CHECK (completed IN (TRUE, FALSE));
```

### Default Values

- `id`: Generated as UUID v4
- `completed`: FALSE (new tasks are incomplete by default)
- `created_at`: CURRENT_TIMESTAMP
- `updated_at`: CURRENT_TIMESTAMP

### Triggers

```sql
-- Auto-update updated_at timestamp on modification
CREATE OR REPLACE FUNCTION update_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_updated_at
  BEFORE UPDATE ON task
  FOR EACH ROW
  EXECUTE FUNCTION update_task_updated_at();
```

## SQLModel Definition (Backend)

```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional
import uuid

class Task(SQLModel, table=True):
    """
    Task model representing a todo item.

    Relationships:
    - Belongs to one User (many-to-one)
    """
    __tablename__ = "task"

    # Primary key
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False
    )

    # Task content
    title: str = Field(
        max_length=200,
        nullable=False,
        description="Task title (required)"
    )

    description: Optional[str] = Field(
        default=None,
        nullable=True,
        description="Optional task description"
    )

    # Status
    completed: bool = Field(
        default=False,
        nullable=False,
        description="Completion status"
    )

    # Foreign key to user
    user_id: uuid.UUID = Field(
        foreign_key="user.id",
        nullable=False,
        index=True,
        description="Owner of the task"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Creation timestamp"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp"
    )

    # Validation
    @validator('title')
    def title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

    @validator('description')
    def description_max_length(cls, v):
        if v and len(v) > 2000:
            raise ValueError('Description cannot exceed 2000 characters')
        return v
```

## TypeScript Interface (Frontend)

```typescript
/**
 * Task entity representing a todo item
 */
export interface Task {
  /** Unique identifier (UUID) */
  id: string;

  /** Task title (required, max 200 characters) */
  title: string;

  /** Optional task description (max 2000 characters) */
  description: string | null;

  /** Completion status (false = incomplete, true = complete) */
  completed: boolean;

  /** Owner user ID (UUID) */
  user_id: string;

  /** Creation timestamp (ISO 8601 format) */
  created_at: string;

  /** Last update timestamp (ISO 8601 format) */
  updated_at: string;
}

/**
 * Request payload for creating a new task
 */
export interface CreateTaskRequest {
  /** Task title (required, max 200 characters) */
  title: string;

  /** Optional task description (max 2000 characters) */
  description?: string;
}

/**
 * Request payload for updating an existing task
 */
export interface UpdateTaskRequest {
  /** Updated task title (optional, max 200 characters) */
  title?: string;

  /** Updated task description (optional, max 2000 characters) */
  description?: string;

  /** Updated completion status (optional) */
  completed?: boolean;
}

/**
 * Response for task list endpoint
 */
export interface TaskListResponse {
  /** Array of tasks ordered by creation date (newest first) */
  tasks: Task[];

  /** Total count of tasks */
  count: number;
}
```

## Database Migration Script

### Migration: `003_create_tasks_table.sql`

```sql
-- Migration: Create tasks table
-- Feature: 03-todo-crud
-- Date: 2026-01-09
-- Description: Add task table with foreign key to user table

BEGIN;

-- Create task table
CREATE TABLE IF NOT EXISTS task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint with cascade delete
    CONSTRAINT fk_task_user FOREIGN KEY (user_id)
        REFERENCES "user"(id) ON DELETE CASCADE,

    -- Title validation
    CONSTRAINT chk_task_title_not_empty
        CHECK (LENGTH(TRIM(title)) > 0)
);

-- Create indexes for performance
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_created_at ON task(created_at DESC);
CREATE INDEX idx_task_user_created ON task(user_id, created_at DESC);

-- Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_task_updated_at();

-- Grant permissions (if needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON task TO your_app_user;

COMMIT;
```

### Rollback: `003_create_tasks_table_rollback.sql`

```sql
-- Rollback: Drop tasks table
-- Feature: 03-todo-crud
-- Date: 2026-01-09

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_task_updated_at ON task;
DROP FUNCTION IF EXISTS update_task_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_task_user_created;
DROP INDEX IF EXISTS idx_task_created_at;
DROP INDEX IF EXISTS idx_task_user_id;

-- Drop table (cascade will drop foreign key constraint)
DROP TABLE IF EXISTS task CASCADE;

COMMIT;
```

## Data Validation Rules

### Backend Validation (Enforced)

1. **Title**:
   - Required (cannot be null or empty)
   - Maximum 200 characters
   - Whitespace trimmed
   - Cannot be only whitespace

2. **Description**:
   - Optional (can be null)
   - Maximum 2000 characters (enforced in application layer)
   - Whitespace preserved

3. **Completed**:
   - Required (cannot be null)
   - Boolean only (true or false)
   - Defaults to false

4. **User ID**:
   - Required (cannot be null)
   - Must reference valid user.id
   - Derived from session token (never from request body)

5. **Timestamps**:
   - Auto-generated (cannot be set by client)
   - created_at: Set on insert
   - updated_at: Set on insert and update

### Frontend Validation (User Experience)

1. **Title**:
   - Show error if empty when submitting
   - Character counter (200 max)
   - Trim whitespace before submission

2. **Description**:
   - Character counter (2000 max)
   - Optional field indicator

3. **Completed**:
   - Toggle checkbox (no validation needed)

## Query Patterns

### Common Queries

```sql
-- List all tasks for a user (most common query)
SELECT * FROM task
WHERE user_id = $1
ORDER BY created_at DESC;

-- Get specific task by ID (with ownership check)
SELECT * FROM task
WHERE id = $1 AND user_id = $2;

-- Create new task
INSERT INTO task (id, title, description, completed, user_id, created_at, updated_at)
VALUES ($1, $2, $3, FALSE, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING *;

-- Update task (partial update)
UPDATE task
SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    completed = COALESCE($3, completed),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $4 AND user_id = $5
RETURNING *;

-- Delete task (with ownership check)
DELETE FROM task
WHERE id = $1 AND user_id = $2
RETURNING id;

-- Count tasks for a user
SELECT COUNT(*) FROM task WHERE user_id = $1;

-- Count completed tasks for a user
SELECT COUNT(*) FROM task WHERE user_id = $1 AND completed = TRUE;
```

### Performance Expectations

| Query | Expected Time | Index Used |
|-------|---------------|------------|
| List tasks (100 tasks) | <50ms | idx_task_user_created |
| Get task by ID | <10ms | pk_task + idx_task_user_id |
| Create task | <20ms | N/A (insert) |
| Update task | <20ms | pk_task + idx_task_user_id |
| Delete task | <20ms | pk_task + idx_task_user_id |

## Data Lifecycle

### Task Creation
1. User submits title and optional description via frontend
2. Frontend validates title is not empty
3. Frontend sends POST request to `/api/v1/tasks`
4. Backend validates session token → extracts user_id
5. Backend validates title (not empty, max 200 chars)
6. Backend creates task with user_id, completed=false, timestamps
7. Backend returns created task (201 Created)
8. Frontend adds task to list (optimistic update)

### Task Update
1. User clicks pencil button → enters inline edit mode
2. User modifies title and/or description
3. User clicks save button
4. Frontend validates title is not empty
5. Frontend sends PATCH request to `/api/v1/tasks/{id}`
6. Backend validates session token → extracts user_id
7. Backend checks task ownership (task.user_id == current_user.id)
8. Backend validates updated fields
9. Backend updates task, sets updated_at = CURRENT_TIMESTAMP
10. Backend returns updated task (200 OK)
11. Frontend updates task in list

### Task Completion Toggle
1. User clicks completion checkbox
2. Frontend sends PATCH request with completed=true/false
3. Backend validates ownership and updates task
4. Frontend updates visual styling (strikethrough + gray)

### Task Deletion
1. User clicks delete button
2. Frontend shows confirmation dialog
3. User confirms deletion
4. Frontend sends DELETE request to `/api/v1/tasks/{id}`
5. Backend validates ownership
6. Backend deletes task from database
7. Backend returns 204 No Content
8. Frontend removes task from list

### User Deletion (Cascade)
1. User account deleted (via Phase 2 authentication system)
2. Database CASCADE DELETE automatically deletes all user's tasks
3. No orphaned tasks remain in database

## Security Considerations

### Data Isolation

**Enforcement**: Every query MUST include `WHERE user_id = current_user.id`

**Examples**:
```python
# ✅ CORRECT: Filters by authenticated user
tasks = db.exec(
    select(Task).where(Task.user_id == current_user.id)
).all()

# ❌ WRONG: No user filter (exposes all tasks)
tasks = db.exec(select(Task)).all()

# ✅ CORRECT: Ownership check before update
task = db.exec(
    select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")

# ❌ WRONG: No ownership check (allows cross-user access)
task = db.exec(select(Task).where(Task.id == task_id)).first()
```

### Sensitive Data

**No sensitive data in tasks**: Tasks contain only user-generated content (title, description). No passwords, tokens, or PII beyond what user explicitly enters.

**User ID protection**: user_id is never exposed in URLs or client-side code. Always derived from session token on backend.

## Testing Data

### Test Fixtures

```python
# pytest fixture for test tasks
@pytest.fixture
def test_tasks(test_user):
    return [
        Task(
            id=uuid.uuid4(),
            title="Test Task 1",
            description="Description 1",
            completed=False,
            user_id=test_user.id
        ),
        Task(
            id=uuid.uuid4(),
            title="Test Task 2",
            description=None,
            completed=True,
            user_id=test_user.id
        ),
    ]
```

### Edge Cases for Testing

1. **Empty title**: Should fail validation
2. **Whitespace-only title**: Should fail validation
3. **Title exactly 200 characters**: Should succeed
4. **Title 201 characters**: Should fail validation
5. **Description exactly 2000 characters**: Should succeed
6. **Description 2001 characters**: Should fail validation
7. **Null description**: Should succeed (optional field)
8. **Invalid user_id**: Should fail foreign key constraint
9. **Accessing another user's task**: Should return 404 or 403
10. **Deleting non-existent task**: Should return 404

---

**Data Model Status**: ✅ Complete - Ready for implementation
