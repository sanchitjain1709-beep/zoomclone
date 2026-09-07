from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
import logging
import uuid
import time
import asyncio

from app.config import settings
from app.database import engine, Base
from app.routers import meetings_router, users_router, signaling_router
from app.services.room_manager import room_manager
from app.utils.seed import seed_database_internal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zoom_app")

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Layer 3 Gateway Middleware: Injects X-Correlation-ID and X-Process-Time headers."""
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        start_time = time.time()

        response = await call_next(request)

        process_time = time.time() - start_time
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        return response

async def zombie_peer_cleanup_loop():
    """Layer 6 Scalability Daemon: Periodically prunes zombie WebSockets and dead peers."""
    logger.info("Zombie peer cleaner daemon started.")
    try:
        while True:
            await asyncio.sleep(30)
            pruned = await room_manager.prune_zombie_peers(max_idle_seconds=60)
            if pruned:
                logger.info(f"Pruned {len(pruned)} dead peer connection(s): {pruned}")
    except asyncio.CancelledError:
        logger.info("Zombie peer cleaner daemon stopped.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized.")

    # Run seeder to ensure default user and sample meetings exist
    await seed_database_internal()

    # Start background zombie cleaner task
    cleanup_task = asyncio.create_task(zombie_peer_cleanup_loop())

    yield

    # Shutdown
    cleanup_task.cancel()
    await engine.dispose()
    logger.info("Database connection pool and background tasks disposed.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Zoom Web Application Fullstack Clone API with WebRTC Signaling, Distributed EventBus & SQLite WAL",
    lifespan=lifespan
)

# 1. Register Gateway Tracing Middleware
app.add_middleware(CorrelationIdMiddleware)

# 2. Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register REST Routers
app.include_router(meetings_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)

# 4. Register WebSocket Signaling Router
app.include_router(signaling_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "sqlite_wal_enabled": settings.ENABLE_WAL_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
