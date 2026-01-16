"""
FastAPI application entry point.

This module initializes the FastAPI application with CORS middleware
and includes all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as v1_router
from app.config import settings


app = FastAPI(
    title="Phase 2 Todo App Backend",
    version="0.1.0",
    description="Backend API for Phase 2 Todo Application with stateless JWT authentication"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend development server
        "http://127.0.0.1:3000",  # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers including Authorization
)

# Include API v1 router
app.include_router(v1_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and verification.
    Returns the service status, name, and version.
    """
    return {
        "status": "healthy",
        "service": "backend",
        "version": "0.1.0"
    }
