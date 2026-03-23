"""Chat endpoints — message processing and rating."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import ChatRequest, ChatResponse, RatingRequest

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest) -> ChatResponse:
    """Process a user message through the multi-agent pipeline."""
    # Rate limiting
    client_ip: str = request.client.host if request.client else "unknown"
    result = request.app.state.rate_limiter.check(client_ip)
    if not result.allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Retry after {result.retry_after}s",
            headers={"Retry-After": str(int(result.retry_after))},
        )

    chat_service = request.app.state.chat_service
    response: ChatResponse = await chat_service.process_message(body)
    return response


@router.post("/rate")
async def rate_message(request: Request, body: RatingRequest) -> dict[str, str]:
    """Submit a rating for a specific agent response."""
    session_service = request.app.state.session_service
    await session_service.add_rating(body.session_id, body.message_index, body.rating)
    return {"status": "ok"}
