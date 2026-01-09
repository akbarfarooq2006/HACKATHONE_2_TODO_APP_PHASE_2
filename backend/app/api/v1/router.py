"""API v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health


router = APIRouter()

# Include endpoint routers
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(health.router, tags=["health"])
