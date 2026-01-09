"""
FastAPI application entry point.

This module creates and configures the FastAPI application with:
- CORS middleware for frontend communication
- API v1 routes
- Database connection
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import v1_router
from app.config import settings


# Create FastAPI application
app = FastAPI(
    title="Phase 2 Todo App API",
    description="Backend API for authentication and task management",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend development server
        settings.BETTER_AUTH_URL if hasattr(settings, 'BETTER_AUTH_URL') else "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers including Authorization
)

# Include API v1 router
app.include_router(v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Phase 2 Todo App API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Simple health check endpoint (no database check)."""
    return {"status": "healthy", "message": "API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
