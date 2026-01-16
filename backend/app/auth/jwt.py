"""
JWT token verification logic.

This module handles JWT token verification for Better Auth tokens.
Better Auth uses HS256 algorithm with BETTER_AUTH_SECRET.

Better Auth JWT Structure:
{
  "session": {...},
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "iat": 1234567890,
  "exp": 1234567890
}
"""

from datetime import datetime
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.config import settings


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token and return decoded payload.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload if valid, None otherwise

    Raises:
        JWTError: If token is invalid, expired, or malformed
    """
    try:
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
            }
        )

        # Better Auth JWT structure has user info nested under "user" key
        # Validate required claims
        if "user" not in payload or "id" not in payload.get("user", {}):
            raise JWTError("Token missing user information")

        # Validate expiration
        exp = payload.get("exp")
        if exp:
            exp_datetime = datetime.fromtimestamp(exp)
            if exp_datetime < datetime.utcnow():
                raise JWTError("Token has expired")

        return payload

    except JWTError as e:
        # Re-raise with context
        raise JWTError(f"Token verification failed: {str(e)}")
    except Exception as e:
        # Catch any other errors
        raise JWTError(f"Unexpected error during token verification: {str(e)}")


def extract_user_id_from_token(token: str) -> str:
    """
    Extract user ID from JWT token.

    Better Auth stores user ID in payload.user.id (not payload.sub).

    Args:
        token: JWT token string

    Returns:
        User ID from user.id claim

    Raises:
        JWTError: If token is invalid or missing user ID
    """
    payload = verify_jwt_token(token)

    # Better Auth JWT structure: payload.user.id
    user_data = payload.get("user", {})
    user_id = user_data.get("id")

    if not user_id:
        raise JWTError("Token missing user ID (user.id claim)")

    return user_id
