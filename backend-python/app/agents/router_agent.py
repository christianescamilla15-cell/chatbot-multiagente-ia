"""RouterAgent — Detects intent, routes to correct agent, determines verification need."""

from __future__ import annotations

import json
import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

AGENT_MAP = {
    "technical_support": "NovaAgent",
    "maintenance": "AtlasAgent",
    "billing": "AriaAgent",
    "general": "OrionAgent",
    "escalation": "NexusAgent",
}

SENSITIVE_INTENTS = {"billing", "account_info", "receipt", "balance", "payment_history"}

SYSTEM_PROMPT = """You are RouterAgent, the intent classifier for a residential support system.

Analyze the user's message and return a JSON object with:
- "intent": one of ["technical_support", "maintenance", "billing", "general", "escalation"]
- "confidence": float 0.0-1.0
- "requires_verification": boolean (true if the request involves sensitive data like billing, account info, personal data)
- "summary": brief summary of the request in Spanish

Rules:
- billing/payments/receipts/balances → billing (requires_verification: true)
- internet/wifi/cameras/access → technical_support
- leaks/elevator/lights/repairs → maintenance
- rules/schedule/pool/gym/FAQ → general
- complaints/unresolved/talk to human → escalation
- If confidence < 0.4, route to general
- ALWAYS respond with valid JSON only, no extra text"""


async def classify_intent(message: str, context: list[dict[str, Any]] | None = None) -> dict:
    """Classify user intent and determine routing."""
    context = context or []

    if settings.GROQ_API_KEY:
        return await _classify_groq(message, context)
    elif settings.ANTHROPIC_API_KEY and not settings.is_demo_mode:
        return await _classify_claude(message, context)
    else:
        return _classify_demo(message)


async def _classify_groq(message: str, context: list[dict]) -> dict:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": message},
    ]

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=256,
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content or "{}"
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        result = {"intent": "general", "confidence": 0.3, "requires_verification": False, "summary": message[:100]}

    result.setdefault("intent", "general")
    result.setdefault("confidence", 0.5)
    result.setdefault("requires_verification", False)
    result["agent"] = AGENT_MAP.get(result["intent"], "OrionAgent")
    result["tokens"] = response.usage.total_tokens if response.usage else 0

    if result["confidence"] < 0.4:
        result["agent"] = "OrionAgent"
        result["intent"] = "general"

    return result


async def _classify_claude(message: str, context: list[dict]) -> dict:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": message}],
    )

    text = response.content[0].text
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        result = {"intent": "general", "confidence": 0.3, "requires_verification": False}

    result.setdefault("intent", "general")
    result.setdefault("confidence", 0.5)
    result.setdefault("requires_verification", False)
    result["agent"] = AGENT_MAP.get(result["intent"], "OrionAgent")
    result["tokens"] = response.usage.input_tokens + response.usage.output_tokens

    if result["confidence"] < 0.4:
        result["agent"] = "OrionAgent"

    return result


def _classify_demo(message: str) -> dict:
    """Rule-based fallback classifier."""
    msg = message.lower()

    if any(w in msg for w in ["pago", "recibo", "saldo", "factura", "adeudo", "cobro", "cuenta"]):
        return {"intent": "billing", "agent": "AriaAgent", "confidence": 0.85, "requires_verification": True, "summary": "Consulta de facturación"}
    elif any(w in msg for w in ["internet", "wifi", "señal", "cámara", "interfón", "acceso", "red"]):
        return {"intent": "technical_support", "agent": "NovaAgent", "confidence": 0.85, "requires_verification": False, "summary": "Soporte técnico"}
    elif any(w in msg for w in ["fuga", "elevador", "luz", "puerta", "tubería", "reparar", "mantenimiento"]):
        return {"intent": "maintenance", "agent": "AtlasAgent", "confidence": 0.85, "requires_verification": False, "summary": "Reporte de mantenimiento"}
    elif any(w in msg for w in ["queja", "hablar con", "administrador", "no resuelto", "inconformidad"]):
        return {"intent": "escalation", "agent": "NexusAgent", "confidence": 0.8, "requires_verification": False, "summary": "Escalamiento"}
    else:
        return {"intent": "general", "agent": "OrionAgent", "confidence": 0.7, "requires_verification": False, "summary": "Consulta general"}
