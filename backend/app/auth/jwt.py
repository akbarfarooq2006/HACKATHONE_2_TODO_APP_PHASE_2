"""
JWT token verification logic.

This module handles JWT token verification for Better Auth tokens.
Better Auth uses HS256 algorithm with BETTER_AUTH_SECRET.
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

        # Validate required claims
        if "sub" not in payload:
            raise JWTError("Token missing 'sub' claim (user ID)")

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

    Args:
        token: JWT token string

    Returns:
        User ID (sub claim)

    Raises:
        JWTError: If token is invalid or missing user ID
    """
    payload = verify_jwt_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise JWTError("Token missing user ID (sub claim)")

    return user_id
