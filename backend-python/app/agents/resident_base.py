"""Base agent for the Resident Support System. Supports Claude + Groq with DB access."""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)


class ResidentAgent(ABC):
    """Base class for all resident support agents."""

    name: str = ""
    role: str = ""
    requires_verification: bool = False

    async def respond(
        self,
        message: str,
        context: list[dict[str, Any]] | None = None,
        resident: dict | None = None,
        session: dict | None = None,
        db_context: str = "",
        kb_context: str = "",
    ) -> dict:
        """Generate a response with metadata."""
        start = time.time()
        context = context or []

        system_prompt = self._build_system_prompt(resident, session, db_context, kb_context)

        if settings.GROQ_API_KEY:
            try:
                text, tokens = await self._call_groq(message, context, system_prompt)
                provider = "groq"
            except Exception as e:
                logger.warning("Groq agent call failed: %s", e)
                text = "El sistema esta experimentando alta demanda. Intenta de nuevo en unos minutos."
                tokens, provider = 0, "rate_limited"
        elif settings.ANTHROPIC_API_KEY and not settings.is_demo_mode:
            text, tokens = await self._call_claude(message, context, system_prompt)
            provider = "claude"
        else:
            text = "Sistema temporalmente no disponible. Intenta de nuevo en unos minutos."
            tokens, provider = 0, "offline"

        latency_ms = int((time.time() - start) * 1000)

        return {
            "text": text,
            "agent": self.name,
            "role": self.role,
            "tokens": tokens,
            "provider": provider,
            "latency_ms": latency_ms,
            "requires_verification": self.requires_verification,
        }

    def _build_system_prompt(
        self,
        resident: dict | None,
        session: dict | None,
        db_context: str,
        kb_context: str,
    ) -> str:
        """Build the full system prompt with resident context."""
        parts = [self._base_system_prompt()]

        if resident:
            parts.append(f"""
--- DATOS DEL RESIDENTE ---
Nombre: {resident.get('full_name', 'Desconocido')}
Unidad: {resident.get('unit_number', 'N/A')}
Edificio: {resident.get('building', 'N/A')}
Status: {resident.get('resident_status', 'N/A')}
Verificado: {'Sí' if session and session.get('is_verified') else 'No'}
--- FIN DATOS ---""")

        if db_context:
            parts.append(f"\n--- CONTEXTO DE BASE DE DATOS ---\n{db_context}\n--- FIN CONTEXTO ---")

        if kb_context:
            parts.append(f"\n--- BASE DE CONOCIMIENTO ---\n{kb_context}\n--- FIN BASE DE CONOCIMIENTO ---")

        return "\n".join(parts)

    @abstractmethod
    def _base_system_prompt(self) -> str:
        """Agent-specific system prompt."""
        ...

    @abstractmethod
    def demo_response(self, message: str, resident: dict | None = None) -> str:
        """Fallback response without LLM."""
        ...

    async def _call_groq(
        self, message: str, context: list[dict], system_prompt: str
    ) -> tuple[str, int]:
        """Call Groq (Llama 3.3 70B)."""
        from groq import AsyncGroq

        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        messages = [{"role": "system", "content": system_prompt}]

        for msg in context[-20:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": message})

        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=300,
            temperature=0.3,
        )

        text = response.choices[0].message.content or ""
        tokens = response.usage.total_tokens if response.usage else 0
        return text, tokens

    async def _call_claude(
        self, message: str, context: list[dict], system_prompt: str
    ) -> tuple[str, int]:
        """Call Claude API."""
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        messages = []

        for msg in context[-20:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": message})

        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=system_prompt,
            messages=messages,
        )

        text = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens
        return text, tokens
