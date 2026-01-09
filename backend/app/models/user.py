"""
User model for authentication.

This model mirrors the Better Auth 'user' table schema.
It's read-only from the backend perspective - Better Auth manages the schema.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """
    User model that mirrors Better Auth's user table.

    This is a read-only model - the schema is managed by Better Auth on the frontend.
    The backend only reads from this table for token verification.
    """

    __tablename__ = "user"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    emailVerified: Optional[bool] = Field(default=False, alias="emailVerified")
    name: Optional[str] = None
    image: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    class Config:
        """SQLModel configuration."""
        populate_by_name = True  # Allow both field name and alias
