"""
Authentication dependencies for FastAPI.

This module provides dependency functions for protecting API endpoints.
Better Auth uses session tokens (not JWT), so we verify by querying the session table.
"""

from datetime import datetime
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from app.database import get_db
from app.models.user import User
from app.models.session import Session as SessionModel


# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from Better Auth session token.

    This dependency:
    1. Extracts the session token from Authorization header
    2. Queries the session table to find the session
    3. Validates the session hasn't expired
    4. Queries the user table to get the user
    5. Returns the user object

    Args:
        credentials: HTTP Bearer credentials from Authorization header
        db: Database session

    Returns:
        User object if authentication succeeds

    Raises:
        HTTPException: 401 if token is invalid, expired, or user not found
    """
    # Extract session token from credentials
    session_token = credentials.credentials

    try:
        # Query session table to find the session
        statement = select(SessionModel).where(SessionModel.token == session_token)
        session = db.exec(statement).first()

        if session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if session has expired
        if session.expiresAt < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from session
        user_id = session.userId

        # Query database to get user
        user_statement = select(User).where(User.id == user_id)
        user = db.exec(user_statement).first()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise.

    This is useful for endpoints that work differently for authenticated vs anonymous users.

    Args:
        credentials: Optional HTTP Bearer credentials
        db: Database session

    Returns:
        User object if authenticated, None otherwise
    """
    if credentials is None:
        return None

    try:
        # Query session table to find the session
        statement = select(SessionModel).where(SessionModel.token == credentials.credentials)
        session = db.exec(statement).first()

        if session is None or session.expiresAt < datetime.utcnow():
            return None

        # Get user from session
        user_statement = select(User).where(User.id == session.userId)
        user = db.exec(user_statement).first()

        return user

    except Exception:
        return None
