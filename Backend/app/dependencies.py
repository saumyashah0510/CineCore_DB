# =============================================================================
# dependencies.py — Shared FastAPI Dependencies
# =============================================================================
# FastAPI's dependency injection system lets you declare reusable logic
# that gets executed before your route handler runs.
#
# Depends(get_db)          → injects a DB session into any route
# Depends(get_redis)       → injects the Redis client
# Depends(get_current_role)→ (future) reads role from header/token
#
# The beauty: if get_db fails (DB down), FastAPI returns 503 automatically
# without your route handler ever running.
# =============================================================================

from fastapi import Depends, Header, HTTPException

from app.database import get_db          # re-export so routers import from one place
from app.redis_client import redis_client


async def get_redis():
    """Inject Redis client. Returns None gracefully if Redis is down."""
    return redis_client


# =============================================================================
# Role simulation — simple header-based for now
# In production this would validate a JWT token and extract the role.
#
# Usage in a router:
#   async def admin_only_route(role = Depends(require_role("ADMIN"))):
#
# Frontend sends:   X-User-Role: FINANCE_MANAGER
# =============================================================================

VALID_ROLES = {"ADMIN", "PRODUCTION_MANAGER", "FINANCE_MANAGER", "DIRECTOR", "AUDIENCE"}

def require_role(*allowed_roles: str):
    """
    Returns a dependency that checks if the request role is in allowed_roles.
    Usage: Depends(require_role("ADMIN", "FINANCE_MANAGER"))
    """
    async def role_checker(x_user_role: str = Header(default="AUDIENCE")):
        role = x_user_role.upper()
        if role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail=f"Invalid role: {x_user_role}")
        if role not in [r.upper() for r in allowed_roles]:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{role}' does not have access to this resource"
            )
        return role
    return role_checker