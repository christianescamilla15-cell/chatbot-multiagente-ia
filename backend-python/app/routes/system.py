"""System endpoints — health check and stats."""

from __future__ import annotations

import time

from fastapi import APIRouter, Request

from app.models.schemas import HealthResponse, StatsResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    """Return service health including uptime, mode, and active sessions."""
    start_time: float = request.app.state.start_time
    session_service = request.app.state.session_service
    agents: dict = request.app.state.agents

    active_sessions: int = await session_service.get_session_count()

    from app.config import settings

    return HealthResponse(
        status="ok",
        uptime_seconds=round(time.time() - start_time, 2),
        mode="demo" if settings.is_demo_mode else "live",
        agents=list(agents.keys()),
        active_sessions=active_sessions,
    )


@router.get("/api/stats", response_model=StatsResponse)
async def stats(request: Request) -> StatsResponse:
    """Return aggregate usage statistics."""
    session_service = request.app.state.session_service
    data: dict = await session_service.get_stats()
    return StatsResponse(**data)
