"""
Authentication dependencies for FastAPI.

This module provides dependency functions for protecting API endpoints.
Uses STATELESS JWT verification - NO database queries performed.

JWT tokens are extracted from httpOnly cookies (better-auth.session_data).
Better Auth uses a two-cookie architecture:
- better-auth.session_token: Database session ID (primary mechanism)
- better-auth.session_data: JWT cache (stateless verification)
"""

from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status, Cookie
from jose import JWTError

from app.auth.jwt import verify_jwt_token, extract_user_id_from_token


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

    Note: Better Auth uses two cookies:
    - session_token: Database session ID (primary)
    - session_data: JWT cache (used here for stateless verification)

    Better Auth JWT structure: {"user": {"id": "...", "email": "...", "name": "..."}, ...}

    Args:
        session_data: JWT token from better-auth.session_data cookie

    Returns:
        User ID (user.id claim from token) if authentication succeeds

    Raises:
        HTTPException: 401 if token is missing, invalid, expired, or malformed
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


async def get_current_user_optional(
    session_data: Optional[str] = Cookie(None, alias="better-auth.session_data")
) -> Optional[str]:
    """
    Get current authenticated user ID from JWT token in session_data cookie (STATELESS), if present.
    Returns None if no token is provided or if the token is invalid.

    This is useful for endpoints that work differently for authenticated vs anonymous users.

    Better Auth JWT structure: {"user": {"id": "...", "email": "...", "name": "..."}, ...}

    Args:
        session_data: Optional JWT token from better-auth.session_data cookie

    Returns:
        User ID (user.id claim from token) if authentication succeeds, None otherwise
    """
    if not session_data:
        return None

    try:
        user_id = extract_user_id_from_token(session_data)
        return user_id
    except JWTError:
        return None
    except Exception:
        return None


async def get_token_payload(
    session_data: Optional[str] = Cookie(None, alias="better-auth.session_data")
) -> Dict[str, Any]:
    """
    Get full JWT token payload from session_data cookie (STATELESS).

    This dependency verifies the token and returns the complete payload,
    which includes user information like email, name, etc.

    NO DATABASE QUERIES ARE PERFORMED.

    Args:
        session_data: JWT token from better-auth.session_data cookie

    Returns:
        Complete token payload with all claims

    Raises:
        HTTPException: 401 if token is missing, invalid, expired, or malformed
    """
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        # Verify token signature and decode payload (STATELESS - no DB query)
        payload = verify_jwt_token(session_data)
        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    except Exception:
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

    Args:
        user_id: User ID from URL path parameter
        token_user_id: User ID from JWT token (injected by get_current_user)

    Returns:
        User ID if match succeeds

    Raises:
        HTTPException: 403 if user_id in path doesn't match token user_id
    """
    if user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in path does not match token user ID"
        )

    return user_id
