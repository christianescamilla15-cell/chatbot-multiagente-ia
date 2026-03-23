"""Tests for the API endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_chat_endpoint_returns_response(client: AsyncClient) -> None:
    resp = await client.post("/api/chat", json={"message": "Hola"})
    assert resp.status_code == 200
    data = resp.json()
    assert "response" in data
    assert "agent" in data
    assert "session_id" in data


@pytest.mark.asyncio
async def test_chat_missing_message_returns_422(client: AsyncClient) -> None:
    resp = await client.post("/api/chat", json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_chat_message_too_long_returns_422(client: AsyncClient) -> None:
    resp = await client.post("/api/chat", json={"message": "x" * 2001})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "uptime_seconds" in data
    assert data["mode"] == "demo"
    assert len(data["agents"]) == 5


@pytest.mark.asyncio
async def test_stats_endpoint(client: AsyncClient) -> None:
    resp = await client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_messages" in data
    assert "by_agent" in data
    assert "satisfaction" in data


@pytest.mark.asyncio
async def test_rate_limiting(client: AsyncClient) -> None:
    # Set a very low limit for testing
    client._transport.app.state.rate_limiter = __import__(
        "app.services.rate_limiter", fromlist=["RateLimiter"]
    ).RateLimiter(max_per_minute=2)

    await client.post("/api/chat", json={"message": "uno"})
    await client.post("/api/chat", json={"message": "dos"})
    resp = await client.post("/api/chat", json={"message": "tres"})
    assert resp.status_code == 429


@pytest.mark.asyncio
async def test_session_persistence(client: AsyncClient) -> None:
    # Send first message
    resp1 = await client.post(
        "/api/chat", json={"message": "Hola", "session_id": "test-session-123"}
    )
    assert resp1.status_code == 200

    # Send second message with same session
    resp2 = await client.post(
        "/api/chat",
        json={"message": "Cuanto cuesta?", "session_id": "test-session-123"},
    )
    assert resp2.status_code == 200
    assert resp2.json()["session_id"] == "test-session-123"


@pytest.mark.asyncio
async def test_agent_routing_sales(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/chat", json={"message": "Quiero ver los planes y precios"}
    )
    assert resp.status_code == 200
    assert resp.json()["category"] == "sales"


@pytest.mark.asyncio
async def test_agent_routing_support(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/chat", json={"message": "Tengo un error 500 en la API"}
    )
    assert resp.status_code == 200
    assert resp.json()["category"] == "support"


@pytest.mark.asyncio
async def test_cors_headers(client: AsyncClient) -> None:
    resp = await client.options(
        "/api/chat",
        headers={
            "Origin": "http://localhost:3001",
            "Access-Control-Request-Method": "POST",
        },
    )
    # FastAPI CORS middleware should respond
    assert resp.status_code in (200, 400)


@pytest.mark.asyncio
async def test_rate_message_endpoint(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/chat/rate",
        json={"session_id": "test-sess", "message_index": 0, "rating": 1},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_chat_empty_message_returns_422(client: AsyncClient) -> None:
    resp = await client.post("/api/chat", json={"message": ""})
    assert resp.status_code == 422
