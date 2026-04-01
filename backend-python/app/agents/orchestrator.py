"""Orchestrator — Pipeline-based message routing with verification.

Refactored from monolithic process_message into clean stages:
  1. identify_and_authenticate (resident lookup, session, OTP)
  2. classify_and_verify (intent detection, verification gate)
  3. execute_agent (context loading, agent routing, response)
  4. post_process (ticket creation, logging, notifications)
"""

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
from app.db.audit import log_otp_send, log_otp_verify, log_session_create
from app.services.notification import notify_ticket_created

logger = logging.getLogger(__name__)

sentinel = SentinelAgent()
AGENTS = {
    "NovaAgent": NovaAgent(),
    "AtlasAgent": AtlasAgent(),
    "AriaAgent": AriaAgent(),
    "OrionAgent": OrionAgent(),
    "NexusAgent": NexusAgent(),
    "ClosureAgent": ClosureAgent(),
}


# ═══════════════════════════════════════
# PUBLIC API (unchanged signature)
# ═══════════════════════════════════════

async def process_message(
    message: str,
    phone: str,
    context: list[dict[str, Any]] | None = None,
    session_id: str | None = None,
) -> dict:
    """Main entry point — thin orchestrator calling pipeline stages."""
    start = time.time()
    run_id = str(uuid.uuid4())
    agent_path = []
    context = context or []

    # Stage 1: Identify + Authenticate
    auth = await _identify_and_authenticate(message, phone, run_id, agent_path)
    if auth.get("early_return"):
        return auth["response"]

    resident = auth["resident"]
    session = auth["session"]

    # Stage 2: Classify + Verify
    classify = await _classify_and_verify(message, context, resident, session, phone, run_id, agent_path)
    if classify.get("early_return"):
        return classify["response"]

    classification = classify["classification"]
    agent_name = classify["agent_name"]

    # Stage 3: Execute Agent
    response = await _execute_agent(message, context, agent_name, resident, session, classification, agent_path)

    # Stage 4: Post-process (tickets, logging, notifications)
    latency_ms = int((time.time() - start) * 1000)
    return await _post_process(response, classification, resident, session, agent_path, run_id, message, latency_ms)


# ═══════════════════════════════════════
# STAGE 1: Identify + Authenticate
# ═══════════════════════════════════════

async def _identify_and_authenticate(message, phone, run_id, agent_path) -> dict:
    """Identify resident, manage session, handle OTP codes."""
    resident = await sentinel.identify_resident(phone)
    if not resident:
        return {"early_return": True, "response": {
            "run_id": run_id, "agent": "SentinelAgent", "agent_path": ["SentinelAgent"],
            "text": "No encontre tu numero en nuestro sistema. Contacta administracion.",
            "requires_action": "register",
        }}

    agent_path.append("SentinelAgent")
    session = await sentinel.get_or_create_session(resident["id"], phone)
    await log_session_create(resident["id"], str(session["id"]))

    # Handle OTP code submission
    if message.strip().isdigit() and len(message.strip()) == 6:
        result = await sentinel.verify_otp(resident["id"], session["id"], message.strip())
        await log_otp_verify(resident["id"], result["verified"], result.get("reason", ""))

        if result["verified"]:
            agent_path.append("SentinelAgent:verify_success")
            return {"early_return": True, "response": {
                "run_id": run_id, "agent": "SentinelAgent", "agent_path": agent_path,
                "text": f"Verificacion exitosa, {resident['full_name'].split()[0]}. En que puedo ayudarte con facturacion?",
                "session_id": str(session["id"]), "verified": True,
            }}

        msg = _get_otp_error_message(result)
        if result.get("reason") == "expired":
            code = await sentinel.generate_otp(resident["id"], session["id"], phone)
            if code != "RATE_LIMITED":
                await sentinel.send_otp_whatsapp(phone, code)

        return {"early_return": True, "response": {
            "run_id": run_id, "agent": "SentinelAgent", "agent_path": agent_path,
            "text": msg, "session_id": str(session["id"]), "verified": False,
        }}

    return {"early_return": False, "resident": resident, "session": session}


def _get_otp_error_message(result: dict) -> str:
    reason = result.get("reason", "unknown")
    if reason == "expired":
        return "Tu codigo ha expirado. Te enviare uno nuevo."
    if reason == "max_attempts":
        return "Has excedido el maximo de intentos. Contacta administracion."
    if reason == "invalid_code":
        remaining = result.get("attempts_remaining", 0)
        return f"Codigo incorrecto. Te quedan {remaining} intento(s)."
    return "No se pudo verificar. Intenta de nuevo."


# ═══════════════════════════════════════
# STAGE 2: Classify + Verify
# ═══════════════════════════════════════

async def _classify_and_verify(message, context, resident, session, phone, run_id, agent_path) -> dict:
    """Classify intent and handle verification gate."""
    classification = await classify_intent(message, context)
    agent_name = classification.get("agent", "OrionAgent")
    requires_verification = classification.get("requires_verification", False)
    agent_path.append(f"RouterAgent:{classification.get('intent', 'general')}")

    if requires_verification and not session.get("is_verified"):
        agent_path.append("SentinelAgent:otp_request")
        code = await sentinel.generate_otp(resident["id"], session["id"], phone)

        if code == "RATE_LIMITED":
            text = "Ya te envie un codigo hace menos de 1 minuto. Revisa tu WhatsApp."
        else:
            await log_otp_send(resident["id"], phone)
            sent = await sentinel.send_otp_whatsapp(phone, code, resident.get("full_name", ""))
            text = "Para acceder a informacion de facturacion, necesito verificar tu identidad.\n\nTe envie un codigo de 6 digitos a tu WhatsApp." if sent else "No se pudo enviar el codigo. Contacta administracion."

        return {"early_return": True, "response": {
            "run_id": run_id, "agent": "SentinelAgent", "agent_path": agent_path,
            "text": text, "session_id": str(session["id"]),
            "requires_verification": True, "intent": classification.get("intent"),
            "resident_name": resident.get("full_name", ""),
        }}

    return {"early_return": False, "classification": classification, "agent_name": agent_name}


# ═══════════════════════════════════════
# STAGE 3: Execute Agent
# ═══════════════════════════════════════

async def _execute_agent(message, context, agent_name, resident, session, classification, agent_path) -> dict:
    """Load context, route to agent, get response."""
    is_verified = session.get("is_verified", False)

    # Load DB context + knowledge base + conversation history
    db_context = await _get_agent_context(agent_name, resident["id"], is_verified)
    kb_context = await _get_kb_context(classification.get("intent", "general"))

    if not context:
        recent = await fetch_all(
            "SELECT direction, content FROM messages WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 10",
            resident["id"]
        )
        for m in reversed(recent):
            context.append({"role": "user" if m["direction"] == "inbound" else "assistant", "content": m["content"]})

    # Route to agent
    agent = AGENTS.get(agent_name, AGENTS["OrionAgent"])
    agent_path.append(agent.name)

    return await agent.respond(
        message=message, context=context,
        resident=dict(resident) if is_verified else None,
        session=dict(session), db_context=db_context, kb_context=kb_context,
    )


# ═══════════════════════════════════════
# STAGE 4: Post-process
# ═══════════════════════════════════════

async def _post_process(response, classification, resident, session, agent_path, run_id, message, latency_ms) -> dict:
    """Handle tickets, logging, notifications, build final response."""
    intent = classification.get("intent", "")
    is_verified = session.get("is_verified", False)

    # Auto-create ticket only when agent confirms
    resp_lower = response["text"].lower()
    if intent in ("maintenance", "technical_support") and any(kw in resp_lower for kw in ["ticket creado", "ticket registrado", "tecnico en maximo", "tecnico en"]):
        ticket_ref = await _create_ticket(resident["id"], session["id"], intent, message[:200], message, response["agent"])
        if ticket_ref:
            response["text"] += f"\n\nTicket registrado: **{ticket_ref}**"

    # Log messages
    await _log_message(session["id"], resident["id"], "inbound", message)
    await _log_message(session["id"], resident["id"], "outbound", response["text"], response["agent"])

    # Log agent run
    await _log_agent_run(
        run_id, session["id"], resident["id"], agent_path,
        intent, "verified" if is_verified else "none",
        latency_ms, response.get("tokens", 0) + classification.get("tokens", 0),
    )

    return {
        "run_id": run_id, "text": response["text"],
        "agent": response["agent"], "role": response["role"],
        "agent_path": agent_path, "intent": intent,
        "confidence": classification.get("confidence"),
        "session_id": str(session["id"]),
        "verified": is_verified,
        "resident_name": resident.get("full_name", "") if is_verified else "",
        "unit_number": resident.get("unit_number", "") if is_verified else "",
        "tokens": response.get("tokens", 0),
        "provider": response.get("provider"),
        "latency_ms": latency_ms,
    }


# ═══════════════════════════════════════
# HELPERS (unchanged)
# ═══════════════════════════════════════

async def _get_agent_context(agent_name: str, resident_id: int, is_verified: bool) -> str:
    parts = []
    if agent_name == "AriaAgent" and is_verified:
        payments = await fetch_all(
            "SELECT concept, amount, current_balance, due_date, payment_status FROM payments WHERE resident_id = $1 ORDER BY due_date DESC LIMIT 6", resident_id)
        if payments:
            parts.append("HISTORIAL DE PAGOS:")
            for p in payments:
                parts.append(f"  {p['concept']}: ${p['amount']} | Saldo: ${p['current_balance']} | {p['payment_status']} | Vence: {p['due_date']}")
    elif agent_name == "AtlasAgent":
        tickets = await fetch_all(
            "SELECT ticket_ref, subject, status, priority FROM tickets WHERE resident_id = $1 AND category = 'maintenance' ORDER BY created_at DESC LIMIT 5", resident_id)
        if tickets:
            parts.append("TICKETS PREVIOS:")
            for t in tickets:
                parts.append(f"  {t['ticket_ref']}: {t['subject']} [{t['status']}]")
    elif agent_name == "NovaAgent":
        tickets = await fetch_all(
            "SELECT ticket_ref, subject, status FROM tickets WHERE resident_id = $1 AND category = 'technical_support' ORDER BY created_at DESC LIMIT 5", resident_id)
        if tickets:
            parts.append("TICKETS PREVIOS:")
            for t in tickets:
                parts.append(f"  {t['ticket_ref']}: {t['subject']} [{t['status']}]")
    return "\n".join(parts) if parts else ""


async def _get_kb_context(intent: str) -> str:
    category_map = {"general": ["faq", "rules", "schedule"], "billing": ["payment_policy", "faq"],
                     "maintenance": ["maintenance", "faq"], "technical_support": ["faq"], "escalation": ["rules", "faq"]}
    docs = await fetch_all("SELECT title, content FROM knowledge_documents WHERE category = ANY($1) AND is_active = true",
                            category_map.get(intent, ["faq"]))
    return "\n\n".join(f"[{d['title']}]\n{d['content']}" for d in docs) if docs else ""


async def _log_message(session_id, resident_id, direction, content, agent=None):
    try:
        await execute("INSERT INTO messages (session_id, resident_id, direction, channel, agent, content) VALUES ($1, $2, $3, 'whatsapp', $4, $5)",
                       session_id, resident_id, direction, agent, content)
    except Exception as e:
        logger.error("Log message failed: %s", e)


async def _log_agent_run(run_id, session_id, resident_id, agent_path, intent, verification_state, latency_ms, tokens):
    try:
        await execute("INSERT INTO agent_runs (id, session_id, resident_id, agent_path, intent, verification_state, latency_ms, total_tokens) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                       uuid.UUID(run_id), session_id, resident_id, agent_path, intent, verification_state, latency_ms, tokens)
    except Exception as e:
        logger.error("Log run failed: %s", e)


async def _create_ticket(resident_id, session_id, category, subject, description, agent_name):
    try:
        last = await fetch_one("SELECT COUNT(*) as c FROM tickets")
        num = (last["c"] if last else 0) + 1
        ticket_ref = f"TKT-{num:04d}"

        msg_lower = subject.lower()
        if any(w in msg_lower for w in ["fuga", "agua", "inundacion", "elevador", "atrapado", "emergencia"]):
            priority = "urgent"
        elif any(w in msg_lower for w in ["no funciona", "roto", "sin servicio"]):
            priority = "high"
        else:
            priority = "medium"

        await execute(
            "INSERT INTO tickets (ticket_ref, resident_id, session_id, category, priority, status, subject, description, assigned_agent) VALUES ($1, $2, $3, $4, $5, 'open', $6, $7, $8)",
            ticket_ref, resident_id, session_id, category, priority, subject[:500], description, agent_name)

        from app.db.audit import log_ticket_create
        await log_ticket_create(resident_id, ticket_ref, category)
        await notify_ticket_created(ticket_ref, subject[:100], priority, resident_id)

        logger.info("Ticket: %s for resident %d", ticket_ref, resident_id)
        return ticket_ref
    except Exception as e:
        logger.error("Ticket creation failed: %s", e)
        return None
