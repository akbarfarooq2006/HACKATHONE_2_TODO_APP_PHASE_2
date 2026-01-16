# Developer Quickstart: Todo Task Management

**Feature**: 03-todo-crud | **Date**: 2026-01-09 | **Phase**: 1 (Design)

## Overview

This guide helps developers quickly set up and start working on the Todo Task Management feature. It assumes you have completed Phase 2 (Authentication System) and have a working development environment.

## Prerequisites

Before starting, ensure you have:

- ✅ Phase 2 authentication system fully operational
- ✅ Backend server running at http://localhost:8000
- ✅ Frontend dev server running at http://localhost:3000
- ✅ Neon PostgreSQL database accessible
- ✅ Environment variables configured (.env.local, .env)
- ✅ Node.js >= 18.0.0 and npm >= 9.0.0
- ✅ Python >= 3.12 and uv package manager

## Quick Setup (5 Minutes)

### Step 1: Run Database Migration

Create the tasks table in your Neon PostgreSQL database:

```bash
# Navigate to project root
cd /path/to/phase_2

# Run migration script
psql $DATABASE_URL -f specs/03-todo-crud/migrations/003_create_tasks_table.sql
```

**Expected output**:
```
BEGIN
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE FUNCTION
CREATE TRIGGER
COMMIT
```

**Verify migration**:
```bash
psql $DATABASE_URL -c "\d task"
```

You should see the task table schema with all columns and constraints.

### Step 2: Verify Backend is Running

The backend should already be running from Phase 2. Verify it's accessible:

```bash
curl http://localhost:8000/health
```

**Expected response**:
```json
{"status": "healthy", "message": "API is running"}
```

### Step 3: Verify Frontend is Running

The frontend should already be running from Phase 2. Open your browser:

```
http://localhost:3000
```

You should see the landing page with sign-in/sign-up links.

### Step 4: Sign In

1. Navigate to http://localhost:3000/sign-in
2. Sign in with your test account (or create one at /sign-up)
3. You should be redirected to the dashboard

**Note**: The dashboard currently shows user information. After implementing the task UI, it will display the task management interface.

## Development Workflow

### Backend Development

#### 1. Create Task Model

**File**: `backend/app/models/task.py`

```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional
import uuid

class Task(SQLModel, table=True):
    __tablename__ = "task"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False, nullable=False)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

#### 2. Create Pydantic Schemas

**File**: `backend/app/schemas/task.py`

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    completed: bool
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

#### 3. Create API Endpoints

**File**: `backend/app/api/v1/endpoints/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()

@router.get("/", response_model=dict)
async def list_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all tasks for the authenticated user."""
    statement = (
        select(Task)
        .where(Task.user_id == current_user.id)
        .order_by(Task.created_at.desc())
    )
    tasks = db.exec(statement).all()
    return {"tasks": tasks, "count": len(tasks)}

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task for the authenticated user."""
    task = Task(
        title=task_data.title.strip(),
        description=task_data.description,
        user_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

# Add GET /{id}, PATCH /{id}, DELETE /{id} endpoints...
```

#### 4. Register Router

**File**: `backend/app/api/v1/router.py`

```python
from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, tasks  # Add tasks

v1_router = APIRouter()
v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
v1_router.include_router(health.router, prefix="/health", tags=["health"])
v1_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])  # NEW
```

#### 5. Test Backend Endpoints

```bash
# Get session token from browser cookies (better-auth.session_token)
export TOKEN="your_session_token_here"

# List tasks (should return empty array initially)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/tasks

# Create a task
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"This is a test"}' \
  http://localhost:8000/api/v1/tasks

# List tasks again (should show the created task)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/tasks
```

### Frontend Development

#### 1. Create Task Type Definitions

**File**: `frontend/types/task.ts`

```typescript
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

#### 2. Create API Client

**File**: `frontend/lib/api/tasks.ts`

```typescript
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getSessionToken(): Promise<string> {
  // Get session token from cookies
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(c => c.trim().startsWith('better-auth.session_token='));
  if (!sessionCookie) throw new Error('No session token found');
  return sessionCookie.split('=')[1];
}

export async function listTasks(): Promise<Task[]> {
  const token = await getSessionToken();
  const response = await fetch(`${API_BASE}/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = await response.json();
  return data.tasks;
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const token = await getSessionToken();
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}

// Add updateTask, deleteTask functions...
```

#### 3. Create Task Components

**File**: `frontend/components/task-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createTask } from '@/lib/api/tasks';

export function TaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTask({ title: title.trim(), description: description || undefined });
      setTitle('');
      setDescription('');
      onTaskCreated();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full px-4 py-2 border rounded"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full px-4 py-2 border rounded"
        rows={3}
      />
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Add Task'}
      </button>
    </form>
  );
}
```

#### 4. Update Dashboard

**File**: `frontend/app/dashboard/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { listTasks } from '@/lib/api/tasks';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      loadTasks();
    }
  }, [session]);

  const loadTasks = async () => {
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
      <TaskForm onTaskCreated={loadTasks} />
      <TaskList tasks={tasks} onTasksChanged={loadTasks} />
    </div>
  );
}
```

## Testing

### Backend Tests

**File**: `backend/tests/integration/test_tasks_api.py`

```python
import pytest
from fastapi.testclient import TestClient

def test_list_tasks_requires_auth(client: TestClient):
    """Test that listing tasks requires authentication."""
    response = client.get("/api/v1/tasks")
    assert response.status_code == 401

def test_create_task(client: TestClient, auth_headers: dict):
    """Test creating a new task."""
    response = client.post(
        "/api/v1/tasks",
        json={"title": "Test task", "description": "Test description"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test task"
    assert data["completed"] is False

def test_user_isolation(client: TestClient, user1_headers: dict, user2_headers: dict):
    """Test that users cannot access each other's tasks."""
    # User 1 creates a task
    response = client.post(
        "/api/v1/tasks",
        json={"title": "User 1 task"},
        headers=user1_headers
    )
    task_id = response.json()["id"]

    # User 2 tries to access User 1's task
    response = client.get(f"/api/v1/tasks/{task_id}", headers=user2_headers)
    assert response.status_code in [403, 404]
```

### Frontend Tests

**File**: `frontend/components/__tests__/task-form.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../task-form';
import * as tasksApi from '@/lib/api/tasks';

jest.mock('@/lib/api/tasks');

describe('TaskForm', () => {
  it('creates a task when form is submitted', async () => {
    const mockCreate = jest.spyOn(tasksApi, 'createTask').mockResolvedValue({} as any);
    const onTaskCreated = jest.fn();

    render(<TaskForm onTaskCreated={onTaskCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: 'New task' }
    });
    fireEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ title: 'New task' });
      expect(onTaskCreated).toHaveBeenCalled();
    });
  });
});
```

## Common Issues & Solutions

### Issue 1: "Task table does not exist"

**Solution**: Run the database migration script:
```bash
psql $DATABASE_URL -f specs/03-todo-crud/migrations/003_create_tasks_table.sql
```

### Issue 2: "401 Unauthorized" when calling API

**Solution**: Verify session token is being sent correctly:
1. Open browser DevTools → Application → Cookies
2. Find `better-auth.session_token` cookie
3. Copy the value and use it in Authorization header

### Issue 3: CORS errors in browser

**Solution**: Verify CORS is configured in `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 4: Tasks not appearing after creation

**Solution**: Check browser console for errors. Common causes:
- Session token expired (sign in again)
- Backend not running (check http://localhost:8000/health)
- Database connection issue (check backend logs)

## API Testing with curl

```bash
# Set your session token
export TOKEN="your_session_token_here"

# List all tasks
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/tasks

# Create a task
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}' \
  http://localhost:8000/api/v1/tasks

# Get a specific task
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/tasks/{task_id}

# Update a task
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' \
  http://localhost:8000/api/v1/tasks/{task_id}

# Delete a task
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/tasks/{task_id}
```

## Next Steps

1. **Implement remaining endpoints**: Complete GET /{id}, PATCH /{id}, DELETE /{id}
2. **Create UI components**: TaskList, TaskItem, DeleteConfirmation
3. **Add inline editing**: Implement pencil button and edit mode
4. **Add visual styling**: Strikethrough and gray color for completed tasks
5. **Write tests**: Backend integration tests and frontend component tests
6. **Update documentation**: Add screenshots and usage examples to README

## Resources

- **Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/tasks-api.yaml](./contracts/tasks-api.yaml)
- **Phase 2 Auth Docs**: [../02-auth-db/README.md](../02-auth-db/README.md)

---

**Quickstart Status**: ✅ Complete - Ready for implementation
