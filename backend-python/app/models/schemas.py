"""Pydantic v2 schemas for the Synapse Chatbot API."""

from __future__ import annotations

from uuid import uuid4

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming chat message from the user."""

    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = Field(default_factory=lambda: str(uuid4()))


class AgentInfo(BaseModel):
    """Metadata about the agent that handled the request."""

    name: str
    role: str
    confidence: float


class ChatResponse(BaseModel):
    """Response returned to the frontend after processing."""

    response: str
    agent: AgentInfo
    category: str
    session_id: str
    demo: bool = False
    timestamp: str


class AgenticChatResponse(BaseModel):
    """Response from the agentic (tool use) chat endpoint."""

    response: str
    agent: AgentInfo
    tools_used: list[str] = []
    mode: str  # "agentic" or "demo"
    session_id: str
    demo: bool = False


class HealthResponse(BaseModel):
    """System health-check payload."""

    status: str
    uptime_seconds: float
    mode: str  # "live" or "demo"
    agents: list[str]
    active_sessions: int


class StatsResponse(BaseModel):
    """Aggregate usage statistics."""

    total_messages: int
    by_agent: dict[str, int]
    satisfaction: dict[str, int]  # thumbs_up, thumbs_down


class RatingRequest(BaseModel):
    """User feedback for a specific agent response."""

    session_id: str
    message_index: int
    rating: int = Field(..., ge=-1, le=1)
