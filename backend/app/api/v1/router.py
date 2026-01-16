"""API v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, tasks


router = APIRouter()

# Include endpoint routers
# Auth endpoints are mounted at root level (no prefix) for path-based security
# This allows endpoints like /api/v1/users/{user_id}/me
router.include_router(auth.router, tags=["auth"])
router.include_router(health.router, tags=["health"])
router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
