# =============================================================================
# run.py — Start the server
# =============================================================================
# Run with:  python run.py
#
# This is equivalent to:
#   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
#
# --reload    = auto-restarts server when you save a file (dev only)
# --host 0.0.0.0 = accessible from other devices on your network
# --port 8000 = the port the API listens on
# =============================================================================

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",   # module:variable
        host="0.0.0.0",
        port=8000,
        reload=True,      # remove this in production
        log_level="info",
    )