"""FastAPI application entry point for the Resident Support Multi-Agent System."""

from __future__ import annotations

import logging
import time
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.billing import BillingAgent
from app.agents.classifier import IntentClassifier
from app.agents.escalation import EscalationAgent
from app.agents.general import GeneralAgent
from app.agents.sales import SalesAgent
from app.agents.support import SupportAgent
from app.config import settings
from app.routes.chat import router as chat_router
from app.routes.system import router as system_router
from app.services.chat_service import ChatService
from app.services.rate_limiter import RateLimiter
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialise DB, Redis, and agents on startup."""
    # Startup
    app.state.start_time = time.time()

    # ── PostgreSQL ──
    app.state.db_pool = None
    app.state.migrations_applied = 0
    if settings.DATABASE_URL:
        try:
            from app.db.client import get_pool
            from app.db.migrator import run_migrations
            pool = await get_pool()
            if pool:
                app.state.db_pool = pool
                app.state.migrations_applied = await run_migrations(pool)
                logger.info("Database connected, %d migrations applied", app.state.migrations_applied)
        except Exception as e:
            logger.error("Database init failed (degraded mode): %s", e)

    # ── Redis ──
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL, encoding="utf-8", decode_responses=True
        )
        await redis_client.ping()
        app.state.redis = redis_client
    except Exception as e:
        logger.warning("Redis unavailable (in-memory mode): %s", e)
        app.state.redis = None

    session_service = SessionService(app.state.redis)
    app.state.session_service = session_service

    agents = {
        "sales": SalesAgent(),
        "support": SupportAgent(),
        "billing": BillingAgent(),
        "escalation": EscalationAgent(),
        "general": GeneralAgent(),
    }
    app.state.agents = agents

    classifier = IntentClassifier()
    app.state.classifier = classifier

    app.state.chat_service = ChatService(session_service, classifier, agents)
    app.state.rate_limiter = RateLimiter()

    yield

    # Shutdown
    if app.state.db_pool:
        from app.db.client import close_pool
        await close_pool()
    if app.state.redis:
        await app.state.redis.aclose()


app = FastAPI(
    title="MultiAgente — Resident Support System",
    description=(
        "Sistema multi-agente de soporte para residentes. "
        "8 agentes especializados con verificación OTP por WhatsApp."
    ),
    version="3.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat_router)
app.include_router(system_router)

# Resident Support System routes
from app.routes.residents import router as residents_router
app.include_router(residents_router)

# Admin Panel routes
from app.routes.admin import router as admin_router
app.include_router(admin_router)

# WhatsApp inbound pipeline
from app.routes.whatsapp import router as whatsapp_router
app.include_router(whatsapp_router)
