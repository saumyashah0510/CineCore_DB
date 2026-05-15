from contextlib import asynccontextmanager
import os

from fastapi import FastAPI, Request, Response
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from app.redis_client import init_redis, close_redis
import app.models  # registers all 18 ORM models with SQLAlchemy

from app.routers import (
    projects,
    contracts,
    expenses,
    persons,
    scripts,
    locations,
    songs,
    vendors,
    distribution,
    analytics,
    production,
    ai
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🎬 CineCore API starting up...")
    await init_redis()
    print("✅ Redis connected")
    yield
    await close_redis()
    print("👋 CineCore API shut down cleanly")


app = FastAPI(
    title="CineCore DB API",
    description="Film Production & Distribution Management System",
    version="1.0.0",
    lifespan=lifespan,
)

from app.config import settings

@app.middleware("http")
async def demo_mode_middleware(request: Request, call_next):
    if settings.DEMO_MODE and request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        # Allow AI text-to-SQL endpoint (it is read-only and safely validated)
        if not request.url.path.endswith("/ai/query"):
            superadmin_key = request.headers.get("X-Superadmin-Key", "")
            if superadmin_key != settings.SUPERADMIN_KEY:
                return Response(
                    content='{"detail": "Action disabled in demo mode. Database is read-only."}',
                status_code=403,
                media_type="application/json"
            )
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(projects.router,      prefix=API_PREFIX)
app.include_router(contracts.router,     prefix=API_PREFIX)
app.include_router(expenses.router,      prefix=API_PREFIX)
app.include_router(persons.router,       prefix=API_PREFIX)
app.include_router(scripts.router,       prefix=API_PREFIX)
app.include_router(locations.router,     prefix=API_PREFIX)
app.include_router(songs.router,         prefix=API_PREFIX)
app.include_router(vendors.router,       prefix=API_PREFIX)
app.include_router(distribution.router,  prefix=API_PREFIX)
app.include_router(analytics.router,     prefix=API_PREFIX)
app.include_router(production.router,    prefix=API_PREFIX)
app.include_router(ai.router,            prefix=API_PREFIX)


@app.get("/")
async def root():
    return {"app": "CineCore DB API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    from app.database import engine
    from app.redis_client import redis_client
    import sqlalchemy

    status = {"api": "ok", "database": "unknown", "redis": "unknown"}

    try:
        async with engine.connect() as conn:
            await conn.execute(sqlalchemy.text("SELECT 1"))
        status["database"] = "ok"
    except Exception as e:
        status["database"] = f"error: {str(e)}"

    try:
        if redis_client:
            await redis_client.ping()
            status["redis"] = "ok"
        else:
            status["redis"] = "not initialized"
    except Exception as e:
        status["redis"] = f"error: {str(e)}"

    return status