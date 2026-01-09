"""
Health check endpoints.

This module provides endpoints for health checks and system status.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, text

from app.database import get_db


router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    database: str
    message: str


@router.get("/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    """
    Health check endpoint.

    Verifies that the API is running and can connect to the database.

    Args:
        db: Database session (injected by dependency)

    Returns:
        HealthResponse with status information
    """
    try:
        # Test database connection
        db.exec(text("SELECT 1"))
        database_status = "connected"
        overall_status = "healthy"
        message = "API is running and database is connected"
    except Exception as e:
        database_status = "disconnected"
        overall_status = "unhealthy"
        message = f"Database connection failed: {str(e)}"

    return HealthResponse(
        status=overall_status,
        database=database_status,
        message=message
    )
