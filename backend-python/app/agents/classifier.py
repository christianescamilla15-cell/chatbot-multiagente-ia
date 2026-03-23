"""Intent classifier — routes messages to the correct agent."""

from __future__ import annotations

import re
from dataclasses import dataclass, field

import anthropic

from app.config import settings


@dataclass
class ClassificationResult:
    """Result of classifying a user message."""

    agent_id: str
    confidence: float
    reasoning: str
    secondary: str | None = field(default=None)


# ── keyword lists ──────────────────────────────────────────────

_SALES_KEYWORDS: list[str] = [
    "precio", "costo", "plan", "planes", "comprar", "contratar",
    "suscripcion", "suscripción", "oferta", "descuento", "prueba",
    "trial", "demo", "cotizar", "cotización", "presupuesto",
    "enterprise", "premium", "basico", "básico", "pro",
]

_SUPPORT_KEYWORDS: list[str] = [
    "error", "falla", "bug", "no funciona", "problema", "ayuda",
    "configurar", "instalar", "integrar", "integración", "api",
    "código", "codigo", "lento", "caido", "caído", "crash",
    "timeout", "500", "404", "403", "429",
]

_BILLING_KEYWORDS: list[str] = [
    "factura", "cobro", "pago", "reembolso", "devolucion",
    "devolución", "cancelar", "cancelación", "recibo",
    "tarjeta", "refund", "invoice", "baja",
    "cambiar plan", "upgrade", "downgrade",
]

_ESCALATION_KEYWORDS: list[str] = [
    "hablar con humano", "persona real", "supervisor",
    "gerente", "queja", "demanda", "abogado", "legal",
    "denuncia", "inaceptable", "incompetente",
]

_FRUSTRATION_WORDS: list[str] = [
    "harto", "harta", "furioso", "furiosa", "indignado", "indignada",
    "molesto", "molesta", "frustrado", "frustrada", "enojado", "enojada",
    "cansado de", "cansada de", "no sirve", "basura", "pésimo", "pesimo",
    "terrible", "horrible", "asco", "peor servicio", "estafa",
    "ladrones", "robo", "maldito", "maldita", "porquería", "porqueria",
    "inútil", "inutil", "vergüenza", "verguenza",
]

_GENERAL_KEYWORDS: list[str] = [
    "hola", "buenas", "hey", "saludos", "buen dia", "buenos dias",
    "gracias", "adiós", "adios", "que es", "qué es", "quien",
    "quién", "horario", "contacto",
]


class IntentClassifier:
    """Classify user intent to select the appropriate agent."""

    async def classify(self, message: str) -> ClassificationResult:
        """Classify a message and return the routing result."""
        if settings.is_demo_mode:
            return self._keyword_classify(message)
        return await self._claude_classify(message)

    # ── keyword-based (demo) ────────────────────────────────────

    def _keyword_classify(self, message: str) -> ClassificationResult:
        """Fast keyword-based classification for demo mode."""
        msg_lower: str = message.lower().strip()

        if not msg_lower:
            return ClassificationResult(
                agent_id="general", confidence=0.5, reasoning="empty message"
            )

        # Frustration check first — overrides everything
        if self._detect_frustration(msg_lower):
            return ClassificationResult(
                agent_id="escalation",
                confidence=0.95,
                reasoning="frustration detected",
            )

        scores: dict[str, float] = {
            "sales": self._score(msg_lower, _SALES_KEYWORDS),
            "support": self._score(msg_lower, _SUPPORT_KEYWORDS),
            "billing": self._score(msg_lower, _BILLING_KEYWORDS),
            "escalation": self._score(msg_lower, _ESCALATION_KEYWORDS),
            "general": self._score(msg_lower, _GENERAL_KEYWORDS),
        }

        best: str = max(scores, key=lambda k: scores[k])
        confidence: float = scores[best]

        if confidence < 0.4:
            return ClassificationResult(
                agent_id="general",
                confidence=confidence,
                reasoning="low confidence — defaulting to general",
            )

        # Determine secondary
        sorted_agents = sorted(scores.items(), key=lambda x: -x[1])
        secondary: str | None = (
            sorted_agents[1][0] if len(sorted_agents) > 1 and sorted_agents[1][1] > 0.3 else None
        )

        return ClassificationResult(
            agent_id=best,
            confidence=min(confidence, 1.0),
            reasoning=f"keyword match for {best}",
            secondary=secondary,
        )

    @staticmethod
    def _score(text: str, keywords: list[str]) -> float:
        """Return a 0-1 score based on how many keywords match."""
        matches: int = sum(1 for kw in keywords if kw in text)
        if matches == 0:
            return 0.0
        # First match gets 0.6, each additional +0.15, capped at 1.0
        return min(0.6 + (matches - 1) * 0.15, 1.0)

    @staticmethod
    def _detect_frustration(text: str) -> bool:
        """Check whether the message contains Spanish frustration markers."""
        return any(word in text for word in _FRUSTRATION_WORDS)

    # ── Claude-based (live) ─────────────────────────────────────

    async def _claude_classify(self, message: str) -> ClassificationResult:
        """Use Claude Haiku for accurate intent classification."""
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        system_prompt: str = (
            "Eres un clasificador de intenciones. Dado un mensaje del usuario, "
            "responde SOLO con un JSON con los campos:\n"
            '{"agent_id": "sales|support|billing|escalation|general", '
            '"confidence": 0.0-1.0, "reasoning": "breve explicación", '
            '"secondary": "agent_id o null"}\n\n'
            "Agentes:\n"
            "- sales: preguntas sobre precios, planes, compra, demos\n"
            "- support: errores, problemas técnicos, configuración, API\n"
            "- billing: facturas, cobros, cancelaciones, reembolsos\n"
            "- escalation: frustración extrema, pedir hablar con humano, quejas graves\n"
            "- general: saludos, preguntas generales, despedidas\n"
        )

        response = await client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=256,
            system=system_prompt,
            messages=[{"role": "user", "content": message}],
        )

        text: str = response.content[0].text.strip()

        # Parse JSON from response
        import json

        try:
            # Extract JSON even if wrapped in markdown
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                data: dict = json.loads(json_match.group())
            else:
                data = json.loads(text)

            return ClassificationResult(
                agent_id=data.get("agent_id", "general"),
                confidence=float(data.get("confidence", 0.5)),
                reasoning=data.get("reasoning", "claude classification"),
                secondary=data.get("secondary"),
            )
        except (json.JSONDecodeError, ValueError):
            return ClassificationResult(
                agent_id="general",
                confidence=0.5,
                reasoning="failed to parse claude response — defaulting to general",
            )
