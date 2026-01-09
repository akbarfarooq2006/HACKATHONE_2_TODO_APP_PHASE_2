"""
Session model for authentication.

This model mirrors the Better Auth 'session' table schema.
It's read-only from the backend perspective - Better Auth manages the schema.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Session(SQLModel, table=True):
    """
    Session model that mirrors Better Auth's session table.

    This is a read-only model - the schema is managed by Better Auth on the frontend.
    The backend only reads from this table for token verification.
    """

    __tablename__ = "session"

    id: str = Field(primary_key=True)
    expiresAt: datetime = Field(alias="expiresAt")
    token: str = Field(unique=True, index=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")
    ipAddress: Optional[str] = Field(default=None, alias="ipAddress")
    userAgent: Optional[str] = Field(default=None, alias="userAgent")
    userId: str = Field(foreign_key="user.id", alias="userId")

    class Config:
        """SQLModel configuration."""
        populate_by_name = True  # Allow both field name and alias
