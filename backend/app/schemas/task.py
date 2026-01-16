"""
Pydantic schemas for task API requests and responses.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class TaskResponse(BaseModel):
    """Response schema for a single task."""

    id: str
    title: str
    description: Optional[str] = None
    completed: bool
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class TaskListResponse(BaseModel):
    """Response schema for a list of tasks."""

    tasks: List[TaskResponse]
    count: int


class TaskCreate(BaseModel):
    """Request schema for creating a new task."""

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """Validate that title is not empty or whitespace only."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class TaskUpdate(BaseModel):
    """Request schema for updating a task."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    completed: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate that title is not empty or whitespace only if provided."""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Title cannot be empty or whitespace only")
            return v.strip()
        return v
