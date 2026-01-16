"""
Task model for todo task management.

This model represents a todo task that belongs to a user.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """
    Task model for todo task management.

    Each task belongs to a user and contains a title, optional description,
    completion status, and timestamps.
    """

    __tablename__ = "task"

    id: str = Field(primary_key=True)
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = None
    completed: bool = Field(default=False)
    user_id: str = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """SQLModel configuration."""
        populate_by_name = True
