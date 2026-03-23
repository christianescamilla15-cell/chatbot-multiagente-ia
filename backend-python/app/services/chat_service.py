"""Main orchestrator — ties classifier, agents, sessions, and KB together."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.agents.base import BaseAgent
from app.agents.classifier import IntentClassifier
from app.data.knowledge_base import get_context_for_agent
from app.models.schemas import AgentInfo, ChatRequest, ChatResponse
from app.services.session_service import SessionService


# Map classifier IDs to agent dict keys
_AGENT_MAP: dict[str, str] = {
    "sales": "sales",
    "support": "support",
    "billing": "billing",
    "escalation": "escalation",
    "general": "general",
}


class ChatService:
    """Orchestrate the full message → classify → respond pipeline."""

    def __init__(
        self,
        session_service: SessionService,
        classifier: IntentClassifier,
        agents: dict[str, BaseAgent],
    ) -> None:
        self.session_service: SessionService = session_service
        self.classifier: IntentClassifier = classifier
        self.agents: dict[str, BaseAgent] = agents

    async def process_message(self, request: ChatRequest) -> ChatResponse:
        """Process an incoming chat message end-to-end."""
        # 1. Get session context
        context: list[dict[str, Any]] = await self.session_service.get_context(
            request.session_id
        )

        # 2. Classify intent
        classification = await self.classifier.classify(request.message)
        agent_key: str = _AGENT_MAP.get(classification.agent_id, "general")
        agent: BaseAgent = self.agents.get(agent_key, self.agents["general"])

        # 3. Get KB context
        kb_context: str = get_context_for_agent(agent_key, request.message)

        # 4. Route to agent
        response_text: str = await agent.respond(request.message, context, kb_context)

        # 5. Persist messages
        await self.session_service.add_message(
            request.session_id, "user", request.message
        )
        await self.session_service.add_message(
            request.session_id, "assistant", response_text, agent=agent.name
        )
        await self.session_service.increment_agent_counter(agent.name)

        # 6. Build response
        from app.config import settings

        return ChatResponse(
            response=response_text,
            agent=AgentInfo(
                name=agent.name,
                role=agent.role,
                confidence=classification.confidence,
            ),
            category=classification.agent_id,
            session_id=request.session_id,
            demo=settings.is_demo_mode,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
