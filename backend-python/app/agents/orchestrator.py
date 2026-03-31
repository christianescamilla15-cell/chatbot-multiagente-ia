"""Orchestrator — Routes messages through the agent pipeline with verification."""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any

from app.agents.router_agent import classify_intent
from app.agents.sentinel_agent import SentinelAgent
from app.agents.nova_agent import NovaAgent
from app.agents.atlas_agent import AtlasAgent
from app.agents.aria_agent import AriaAgent
from app.agents.orion_agent import OrionAgent
from app.agents.nexus_agent import NexusAgent
from app.agents.closure_agent import ClosureAgent
from app.db.client import execute, fetch_one, fetch_all
from app.db.audit import log_otp_send, log_otp_verify, log_session_create, log_escalation

logger = logging.getLogger(__name__)

# Agent instances
sentinel = SentinelAgent()
AGENTS = {
    "NovaAgent": NovaAgent(),
    "AtlasAgent": AtlasAgent(),
    "AriaAgent": AriaAgent(),
    "OrionAgent": OrionAgent(),
    "NexusAgent": NexusAgent(),
    "ClosureAgent": ClosureAgent(),
}


async def process_message(
    message: str,
    phone: str,
    context: list[dict[str, Any]] | None = None,
    session_id: str | None = None,
) -> dict:
    """Main entry point: classify, verify if needed, route to agent, respond."""
    start = time.time()
    run_id = str(uuid.uuid4())
    agent_path = []
    context = context or []

    # ── Step 1: Identify resident ──
    resident = await sentinel.identify_resident(phone)
    if not resident:
        return {
            "run_id": run_id,
            "text": "No encontré tu número en nuestro sistema. ¿Podrías verificar que estés registrado como residente? Contacta administración para más información.",
            "agent": "SentinelAgent",
            "agent_path": ["SentinelAgent"],
            "requires_action": "register",
        }

    agent_path.append("SentinelAgent")

    # ── Step 2: Get or create session ──
    session = await sentinel.get_or_create_session(resident["id"], phone)
    await log_session_create(resident["id"], str(session["id"]))

    # ── Step 3: Check if this is an OTP code response ──
    if message.strip().isdigit() and len(message.strip()) == 6:
        result = await sentinel.verify_otp(resident["id"], session["id"], message.strip())
        await log_otp_verify(resident["id"], result["verified"], result.get("reason", ""))
        if result["verified"]:
            agent_path.append("SentinelAgent:verify_success")
            return {
                "run_id": run_id,
                "text": f"✅ Verificación exitosa, {resident['full_name'].split()[0]}. Tu identidad ha sido confirmada. ¿En qué puedo ayudarte con facturación?",
                "agent": "SentinelAgent",
                "agent_path": agent_path,
                "session_id": str(session["id"]),
                "verified": True,
            }
        else:
            reason = result.get("reason", "unknown")
            if reason == "expired":
                msg = "Tu código ha expirado. Te enviaré uno nuevo."
                code = await sentinel.generate_otp(resident["id"], session["id"], phone)
                if code != "RATE_LIMITED":
                    await sentinel.send_otp_whatsapp(phone, code)
            elif reason == "max_attempts":
                msg = "Has excedido el número máximo de intentos. Por seguridad, contacta administración directamente."
            elif reason == "invalid_code":
                remaining = result.get("attempts_remaining", 0)
                msg = f"Código incorrecto. Te quedan {remaining} intento(s)."
            else:
                msg = "No se pudo verificar. Intenta de nuevo."

            return {
                "run_id": run_id,
                "text": msg,
                "agent": "SentinelAgent",
                "agent_path": agent_path,
                "session_id": str(session["id"]),
                "verified": False,
            }

    # ── Step 4: Classify intent ──
    classification = await classify_intent(message, context)
    agent_name = classification.get("agent", "OrionAgent")
    requires_verification = classification.get("requires_verification", False)
    agent_path.append(f"RouterAgent:{classification.get('intent', 'general')}")

    # ── Step 5: Verification gate ──
    if requires_verification and not session.get("is_verified"):
        agent_path.append("SentinelAgent:otp_request")
        code = await sentinel.generate_otp(resident["id"], session["id"], phone)

        if code == "RATE_LIMITED":
            text = "Ya te envie un codigo hace menos de 1 minuto. Revisa tu WhatsApp e ingresalo aqui."
        else:
            await log_otp_send(resident["id"], phone)
            sent = await sentinel.send_otp_whatsapp(phone, code, resident.get("full_name", ""))
            if sent:
                text = "Para acceder a informacion de facturacion, necesito verificar tu identidad.\n\nTe envie un codigo de 6 digitos a tu WhatsApp. Ingresalo aqui para continuar."
            else:
                # Fallback: show code only if WhatsApp send failed
                text = f"Para verificar tu identidad, ingresa este codigo: **{code}**\n\n(Valido por 5 minutos)"

        return {
            "run_id": run_id,
            "text": text,
            "agent": "SentinelAgent",
            "agent_path": agent_path,
            "session_id": str(session["id"]),
            "requires_verification": True,
            "intent": classification.get("intent"),
            "resident_name": resident.get("full_name", ""),
        }

    # ── Step 6: Get DB context for the agent ──
    db_context = await _get_agent_context(agent_name, resident["id"], session.get("is_verified", False))

    # ── Step 7: Get knowledge base context ──
    kb_context = await _get_kb_context(classification.get("intent", "general"))

    # ── Step 8: Route to agent ──
    agent = AGENTS.get(agent_name, AGENTS["OrionAgent"])
    agent_path.append(agent.name)

    response = await agent.respond(
        message=message,
        context=context,
        resident=dict(resident),
        session=dict(session),
        db_context=db_context,
        kb_context=kb_context,
    )

    # ── Step 9: Log message ──
    await _log_message(session["id"], resident["id"], "inbound", message)
    await _log_message(session["id"], resident["id"], "outbound", response["text"], agent.name)

    # ── Step 10: Log agent run ──
    latency_ms = int((time.time() - start) * 1000)
    await _log_agent_run(
        run_id=run_id,
        session_id=session["id"],
        resident_id=resident["id"],
        agent_path=agent_path,
        intent=classification.get("intent"),
        verification_state="verified" if session.get("is_verified") else "none",
        latency_ms=latency_ms,
        tokens=response.get("tokens", 0) + classification.get("tokens", 0),
    )

    return {
        "run_id": run_id,
        "text": response["text"],
        "agent": response["agent"],
        "role": response["role"],
        "agent_path": agent_path,
        "intent": classification.get("intent"),
        "confidence": classification.get("confidence"),
        "session_id": str(session["id"]),
        "verified": session.get("is_verified", False),
        "resident_name": resident.get("full_name", ""),
        "unit_number": resident.get("unit_number", ""),
        "tokens": response.get("tokens", 0),
        "provider": response.get("provider"),
        "latency_ms": latency_ms,
    }


async def _get_agent_context(agent_name: str, resident_id: int, is_verified: bool) -> str:
    """Fetch relevant DB data for the agent."""
    parts = []

    if agent_name == "AriaAgent" and is_verified:
        payments = await fetch_all(
            """SELECT concept, amount, current_balance, due_date, payment_status, receipt_ref
               FROM payments WHERE resident_id = $1 ORDER BY due_date DESC LIMIT 6""",
            resident_id
        )
        if payments:
            parts.append("HISTORIAL DE PAGOS:")
            for p in payments:
                status_emoji = {"paid": "✅", "pending": "⏳", "partial": "⚠️", "overdue": "❌"}.get(p["payment_status"], "?")
                parts.append(f"  {status_emoji} {p['concept']}: ${p['amount']} | Saldo: ${p['current_balance']} | Status: {p['payment_status']} | Vence: {p['due_date']}")

    elif agent_name == "AtlasAgent":
        tickets = await fetch_all(
            """SELECT ticket_ref, subject, status, priority, created_at
               FROM tickets WHERE resident_id = $1 AND category = 'maintenance'
               ORDER BY created_at DESC LIMIT 5""",
            resident_id
        )
        if tickets:
            parts.append("TICKETS DE MANTENIMIENTO PREVIOS:")
            for t in tickets:
                parts.append(f"  {t['ticket_ref']}: {t['subject']} [{t['status']}] ({t['priority']})")

    elif agent_name == "NovaAgent":
        tickets = await fetch_all(
            """SELECT ticket_ref, subject, status, priority
               FROM tickets WHERE resident_id = $1 AND category = 'technical_support'
               ORDER BY created_at DESC LIMIT 5""",
            resident_id
        )
        if tickets:
            parts.append("TICKETS DE SOPORTE PREVIOS:")
            for t in tickets:
                parts.append(f"  {t['ticket_ref']}: {t['subject']} [{t['status']}]")

    return "\n".join(parts) if parts else ""


async def _get_kb_context(intent: str) -> str:
    """Fetch relevant knowledge base docs."""
    category_map = {
        "general": ["faq", "rules", "schedule"],
        "billing": ["payment_policy", "faq"],
        "maintenance": ["maintenance", "faq"],
        "technical_support": ["faq"],
        "escalation": ["rules", "faq"],
    }
    categories = category_map.get(intent, ["faq"])

    docs = await fetch_all(
        """SELECT title, content FROM knowledge_documents
           WHERE category = ANY($1) AND is_active = true""",
        categories
    )

    if docs:
        return "\n\n".join(f"[{d['title']}]\n{d['content']}" for d in docs)
    return ""


async def _log_message(session_id, resident_id, direction, content, agent=None):
    """Log a message to the database."""
    try:
        await execute(
            """INSERT INTO messages (session_id, resident_id, direction, channel, agent, content)
               VALUES ($1, $2, $3, 'whatsapp', $4, $5)""",
            session_id, resident_id, direction, agent, content
        )
    except Exception as e:
        logger.error("Failed to log message: %s", e)


async def _log_agent_run(run_id, session_id, resident_id, agent_path, intent, verification_state, latency_ms, tokens):
    """Log agent execution for observability."""
    try:
        await execute(
            """INSERT INTO agent_runs (id, session_id, resident_id, agent_path, intent, verification_state, latency_ms, total_tokens)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
            uuid.UUID(run_id), session_id, resident_id, agent_path, intent, verification_state, latency_ms, tokens
        )
    except Exception as e:
        logger.error("Failed to log agent run: %s", e)
