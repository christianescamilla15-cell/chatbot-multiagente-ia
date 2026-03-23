"""FastAPI application entry point for the Synapse Chatbot API."""

from __future__ import annotations

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


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialise Redis on startup; close on shutdown."""
    # Startup
    app.state.start_time = time.time()

    redis_client = aioredis.from_url(
        settings.REDIS_URL, encoding="utf-8", decode_responses=True
    )
    app.state.redis = redis_client

    session_service = SessionService(redis_client)
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
    await redis_client.aclose()


app = FastAPI(
    title="Synapse Chatbot API",
    description=(
        "Backend multi-agente para chatbot de atención al cliente. "
        "Clasifica intenciones y enruta a 5 agentes especializados."
    ),
    version="2.0.0",
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
