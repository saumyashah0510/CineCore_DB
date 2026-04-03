# =============================================================================
# main.py — FastAPI Application Entry Point
# =============================================================================
# This is the file FastAPI reads to build the app.
# It:
#   1. Creates the FastAPI app instance
#   2. Registers startup/shutdown events (Redis, DB)
#   3. Adds CORS middleware (so React frontend can talk to it)
#   4. Registers all routers with their URL prefixes
#   5. Adds a health check endpoint
# =============================================================================

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.redis_client import init_redis, close_redis
import app.models  # registers all 17 ORM models with SQLAlchemy
from app.routers import (
    projects,
    contracts,
    expenses,
    persons,
    analytics,
)


# =============================================================================
# Lifespan — runs on startup and shutdown
# =============================================================================
# asynccontextmanager turns this into a context manager FastAPI understands.
# Code before `yield` runs on startup, code after runs on shutdown.
# =============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP ---
    print("🎬 CineCore API starting up...")
    await init_redis()
    print("✅ Redis connected")
    yield
    # --- SHUTDOWN ---
    await close_redis()
    print("👋 CineCore API shut down cleanly")


# =============================================================================
# App instance
# =============================================================================
app = FastAPI(
    title="CineCore DB API",
    description="Film Production & Distribution Management System",
    version="1.0.0",
    lifespan=lifespan,
    # Swagger UI available at /docs
    # ReDoc available at /redoc
)


# =============================================================================
# CORS Middleware
# =============================================================================
# CORS = Cross-Origin Resource Sharing.
# Browsers block requests from one origin (localhost:5173 — React)
# to a different origin (localhost:8000 — FastAPI) unless the server
# explicitly allows it via these headers.
# In production, replace "*" with your actual frontend domain.
# =============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],    # GET, POST, PUT, PATCH, DELETE
    allow_headers=["*"],    # including X-User-Role header
)


# =============================================================================
# Register routers
# =============================================================================
# Each router has its own prefix. Final URLs will be:
#   /api/v1/projects/
#   /api/v1/contracts/
#   /api/v1/expenses/
#   /api/v1/persons/
#   /api/v1/analytics/dashboard
# =============================================================================
API_PREFIX = "/api/v1"

app.include_router(projects.router,  prefix=API_PREFIX)
app.include_router(contracts.router, prefix=API_PREFIX)
app.include_router(expenses.router,  prefix=API_PREFIX)
app.include_router(persons.router,   prefix=API_PREFIX)
app.include_router(analytics.router, prefix=API_PREFIX)


# =============================================================================
# Root + Health check endpoints
# =============================================================================
@app.get("/")
async def root():
    return {
        "app": "CineCore DB API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """
    Returns status of API, DB, and Redis.
    Useful for deployment health checks and monitoring.
    """
    from app.database import engine
    from app.redis_client import redis_client
    import asyncpg

    status = {"api": "ok", "database": "unknown", "redis": "unknown"}

    # Check DB
    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        status["database"] = "ok"
    except Exception as e:
        status["database"] = f"error: {str(e)}"

    # Check Redis
    try:
        if redis_client:
            await redis_client.ping()
            status["redis"] = "ok"
        else:
            status["redis"] = "not initialized"
    except Exception as e:
        status["redis"] = f"error: {str(e)}"

    return status