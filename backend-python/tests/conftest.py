"""Shared test fixtures."""

from __future__ import annotations

import time
from collections.abc import AsyncGenerator
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import fakeredis.aioredis
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.agents.billing import BillingAgent
from app.agents.classifier import IntentClassifier
from app.agents.escalation import EscalationAgent
from app.agents.general import GeneralAgent
from app.agents.sales import SalesAgent
from app.agents.support import SupportAgent
from app.main import app
from app.services.chat_service import ChatService
from app.services.rate_limiter import RateLimiter
from app.services.session_service import SessionService


@pytest_asyncio.fixture
async def fake_redis() -> AsyncGenerator[Any, None]:
    """Provide a fakeredis async client."""
    server = fakeredis.FakeServer()
    client = fakeredis.aioredis.FakeRedis(server=server, decode_responses=True)
    yield client
    await client.aclose()


@pytest_asyncio.fixture
async def session_service(fake_redis: Any) -> SessionService:
    """Session service backed by fakeredis."""
    return SessionService(fake_redis)


@pytest.fixture
def classifier() -> IntentClassifier:
    """Classifier instance (keyword mode since no API key)."""
    return IntentClassifier()


@pytest.fixture
def agents() -> dict[str, Any]:
    """All agent instances."""
    return {
        "sales": SalesAgent(),
        "support": SupportAgent(),
        "billing": BillingAgent(),
        "escalation": EscalationAgent(),
        "general": GeneralAgent(),
    }


@pytest_asyncio.fixture
async def chat_service(
    session_service: SessionService,
    classifier: IntentClassifier,
    agents: dict[str, Any],
) -> ChatService:
    """Fully wired chat service."""
    return ChatService(session_service, classifier, agents)


@pytest_asyncio.fixture
async def client(fake_redis: Any) -> AsyncGenerator[AsyncClient, None]:
    """Async test client with fakeredis injected."""
    # Wire up app state manually
    app.state.start_time = time.time()
    app.state.redis = fake_redis
    app.state.session_service = SessionService(fake_redis)
    app.state.agents = {
        "sales": SalesAgent(),
        "support": SupportAgent(),
        "billing": BillingAgent(),
        "escalation": EscalationAgent(),
        "general": GeneralAgent(),
    }
    app.state.classifier = IntentClassifier()
    app.state.chat_service = ChatService(
        app.state.session_service,
        app.state.classifier,
        app.state.agents,
    )
    app.state.rate_limiter = RateLimiter()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
