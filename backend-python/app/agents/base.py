"""Abstract base class shared by every specialised agent."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import anthropic

from app.config import settings


class BaseAgent(ABC):
    """Common contract that every agent must fulfil."""

    name: str = ""
    role: str = ""

    # Subclasses override these for few-shot examples
    few_shot_examples: list[dict[str, str]] = []

    # ── public API ──────────────────────────────────────────────

    async def respond(
        self,
        message: str,
        context: list[dict[str, Any]],
        kb_context: str,
    ) -> str:
        """Generate a response — live (Claude) or demo (local)."""
        if settings.is_demo_mode:
            return self.demo_response(message)
        return await self._call_claude(message, context, kb_context)

    # ── helpers ─────────────────────────────────────────────────

    def get_system_prompt(self, kb_context: str) -> str:
        """Build full system prompt including KB context."""
        base = self._base_system_prompt()
        if kb_context:
            base += (
                "\n\n--- BASE DE CONOCIMIENTO ---\n"
                f"{kb_context}\n"
                "--- FIN BASE DE CONOCIMIENTO ---"
            )
        return base

    @abstractmethod
    def _base_system_prompt(self) -> str:
        """Return the agent-specific system prompt (no KB)."""
        ...

    @abstractmethod
    def demo_response(self, message: str) -> str:
        """Return a realistic canned response when no API key is set."""
        ...

    # ── Claude call ─────────────────────────────────────────────

    async def _call_claude(
        self,
        message: str,
        context: list[dict[str, Any]],
        kb_context: str,
    ) -> str:
        """Send request to Claude API and return the assistant text."""
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        messages: list[dict[str, str]] = []

        # Inject few-shot examples first
        for ex in self.few_shot_examples:
            messages.append({"role": "user", "content": ex["user"]})
            messages.append({"role": "assistant", "content": ex["assistant"]})

        # Conversation history
        for msg in context[-20:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Current user message
        messages.append({"role": "user", "content": message})

        response = await client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=self.get_system_prompt(kb_context),
            messages=messages,
        )
        return response.content[0].text
