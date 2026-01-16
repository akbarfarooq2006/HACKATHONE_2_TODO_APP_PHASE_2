"""
Authentication endpoints.

This module provides endpoints for user authentication and profile management.
Uses STATELESS JWT verification with path-based security.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth.dependencies import verify_path_user_id, get_token_payload


router = APIRouter()


class UserResponse(BaseModel):
    """User response model."""
    user_id: str
    email: str
    name: str | None
    status: str = "authenticated"
    message: str = "Token verified statelessly - no database lookup performed"

    class Config:
        """Pydantic configuration."""
        from_attributes = True


@router.get("/users/{user_id}/me", response_model=UserResponse)
async def get_current_user_info(
    user_id: str,
    verified_user_id: str = Depends(verify_path_user_id),
    token_payload: Dict[str, Any] = Depends(get_token_payload)
) -> UserResponse:
    """
    Get current authenticated user information (STATELESS).

    This endpoint requires a valid JWT token in the Authorization header.
    Returns user profile information from token claims only.

    **Path-Based Security**: The user_id in the URL path must match the
    user_id (sub claim) in the JWT token. Returns 403 Forbidden if mismatch.

    **Stateless Verification**: NO database queries are performed. All user
    information is extracted from the verified JWT token claims.

    Args:
        user_id: User ID from URL path parameter
        verified_user_id: Verified user ID (injected by verify_path_user_id dependency)
        token_payload: Complete JWT token payload (injected by get_token_payload dependency)

    Returns:
        UserResponse with user information from token claims

    Raises:
        HTTPException: 401 if token is invalid or expired
        HTTPException: 403 if user_id in path doesn't match token user_id
    """
    # Extract user information from token claims (NO database query)
    return UserResponse(
        user_id=verified_user_id,
        email=token_payload.get("email", ""),
        name=token_payload.get("name"),
        status="authenticated",
        message="Token verified statelessly - no database lookup performed"
    )
