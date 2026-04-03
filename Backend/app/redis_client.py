# =============================================================================
# redis_client.py — Redis Caching
# =============================================================================
# Redis is an in-memory key-value store. We use it as a cache:
#
#   HOW CACHING WORKS:
#   1. Request comes in for GET /projects
#   2. Check Redis: is "projects:all" in cache?
#      YES → return cached JSON instantly (no DB query)
#      NO  → query PostgreSQL, store result in Redis with a TTL, return it
#   3. Next request hits cache → ~1ms response instead of ~50ms DB query
#
#   TTL (Time To Live) = how long the cache lives before auto-deleting.
#   After TTL expires, next request refreshes it from DB.
#
#   CACHE INVALIDATION = when data changes (INSERT/UPDATE), we DELETE
#   the related cache key so stale data isn't served.
#
#   WHAT WE CACHE:
#   - List endpoints (GET /projects, GET /persons) — high read, low write
#   - Analytics/dashboard data — expensive queries, cache for 5 minutes
#
#   WHAT WE DON'T CACHE:
#   - Single record lookups by ID (less benefit)
#   - Write endpoints (POST/PUT/DELETE) — these invalidate caches instead
# =============================================================================

import json
from typing import Any

import redis.asyncio as aioredis

from app.config import settings

# TTL constants (in seconds) — centralised so you can tune them easily
CACHE_TTL_SHORT  = 60        # 1 minute  — frequently changing data
CACHE_TTL_MEDIUM = 300       # 5 minutes — dashboard/analytics
CACHE_TTL_LONG   = 3600      # 1 hour    — rarely changing data (OTT platforms list)

# Global Redis client — created once when app starts
redis_client: aioredis.Redis = None


async def init_redis():
    """Call this once on app startup to create the Redis connection pool."""
    global redis_client
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,   # automatically decode bytes → str
    )


async def close_redis():
    """Call this on app shutdown."""
    global redis_client
    if redis_client:
        await redis_client.aclose()


# =============================================================================
# Helper functions used in routers
# =============================================================================

async def cache_get(key: str) -> Any | None:
    """
    Get a value from cache. Returns the parsed Python object or None.
    Values are stored as JSON strings in Redis.
    """
    if redis_client is None:
        return None
    value = await redis_client.get(key)
    if value is None:
        return None
    return json.loads(value)


async def cache_set(key: str, value: Any, ttl: int = CACHE_TTL_MEDIUM):
    """
    Store a value in cache as JSON with a TTL (in seconds).
    value must be JSON-serializable (dicts, lists, strings, numbers).
    """
    if redis_client is None:
        return
    await redis_client.setex(key, ttl, json.dumps(value, default=str))
    # default=str handles Decimal, date, datetime objects


async def cache_delete(key: str):
    """Delete a specific cache key (call this after writes)."""
    if redis_client is None:
        return
    await redis_client.delete(key)


async def cache_delete_pattern(pattern: str):
    """
    Delete all keys matching a pattern. Example: "projects:*" deletes
    projects:all, projects:1, projects:1:contracts etc.
    Use sparingly — KEYS command scans entire Redis keyspace.
    """
    if redis_client is None:
        return
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)