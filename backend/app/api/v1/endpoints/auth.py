"""
Authentication endpoints.

This module provides endpoints for user authentication and profile management.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.models.user import User


router = APIRouter()


class UserResponse(BaseModel):
    """User response model."""
    user_id: str
    email: str
    name: str | None
    email_verified: bool
    status: str = "authenticated"

    class Config:
        """Pydantic configuration."""
        from_attributes = True


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Get current authenticated user information.

    This endpoint requires a valid JWT token in the Authorization header.
    Returns user profile information including ID, email, name, and verification status.

    Args:
        current_user: Current authenticated user (injected by dependency)

    Returns:
        UserResponse with user information

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    return UserResponse(
        user_id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        email_verified=current_user.emailVerified or False,
        status="authenticated"
    )
