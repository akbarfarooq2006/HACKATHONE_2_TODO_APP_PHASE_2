from fastapi import FastAPI

app = FastAPI(
    title="Phase 2 Todo App Backend",
    version="0.1.0",
    description="Backend API for Phase 2 Todo Application"
)

@app.get("/api/v1/health")
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
