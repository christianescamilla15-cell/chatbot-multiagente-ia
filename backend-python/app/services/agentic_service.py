"""Agentic chat service using Claude Tool Use.
Claude decides which tools to call — no manual classifier needed."""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any

import anthropic

from app.config import settings
from app.data.knowledge_base import KNOWLEDGE_BASE, get_context_for_agent

# Tool definitions for Claude
TOOLS: list[dict[str, Any]] = [
    {
        "name": "search_knowledge_base",
        "description": (
            "Search the company knowledge base for information about plans, "
            "pricing, support, billing, security, integrations, FAQ, "
            "competitors, or onboarding."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "enum": [
                        "ventas", "soporte", "facturacion", "general",
                        "faq", "competidores", "onboarding", "seguridad",
                        "integraciones",
                    ],
                    "description": "Knowledge base category to search",
                },
                "query": {
                    "type": "string",
                    "description": "What specific information to find",
                },
            },
            "required": ["category", "query"],
        },
    },
    {
        "name": "create_support_ticket",
        "description": (
            "Create a support ticket when user reports a technical problem. "
            "Use when: something is broken, errors occur, functionality not working."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Brief summary of the problem",
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "critical"],
                },
                "description": {
                    "type": "string",
                    "description": "Detailed problem description",
                },
                "category": {
                    "type": "string",
                    "enum": ["bug", "access", "integration", "performance", "other"],
                },
            },
            "required": ["title", "priority", "description"],
        },
    },
    {
        "name": "check_account_status",
        "description": (
            "Check customer account status: current plan, billing, next charge, "
            "payment method. Use when user asks about their account or before "
            "processing changes."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "email": {
                    "type": "string",
                    "description": "Customer email address",
                },
            },
            "required": ["email"],
        },
    },
    {
        "name": "calculate_pricing",
        "description": (
            "Calculate plan pricing with applicable discounts "
            "(annual, promo codes, upgrade prorations)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "plan": {
                    "type": "string",
                    "enum": ["basic", "pro", "enterprise"],
                },
                "period": {
                    "type": "string",
                    "enum": ["monthly", "annual"],
                },
                "coupon": {
                    "type": "string",
                    "description": "Optional coupon code",
                },
            },
            "required": ["plan", "period"],
        },
    },
    {
        "name": "escalate_to_human",
        "description": (
            "Escalate to a human agent. Use when: user is very frustrated after "
            "multiple attempts, explicitly asks for a person, problem is too "
            "complex, or involves sensitive account changes."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why escalation is needed",
                },
                "urgency": {
                    "type": "string",
                    "enum": ["normal", "high", "critical"],
                },
                "conversation_summary": {
                    "type": "string",
                    "description": "Summary of what has been discussed and attempted",
                },
            },
            "required": ["reason", "urgency", "conversation_summary"],
        },
    },
    {
        "name": "process_account_change",
        "description": (
            "Process cancellation, upgrade, or downgrade. "
            "ONLY use when customer explicitly requests it."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "email": {"type": "string"},
                "action": {
                    "type": "string",
                    "enum": ["cancel", "upgrade", "downgrade"],
                },
                "target_plan": {
                    "type": "string",
                    "enum": ["basic", "pro", "enterprise"],
                    "description": "Target plan for upgrade/downgrade",
                },
                "reason": {
                    "type": "string",
                    "description": "Reason for the change",
                },
            },
            "required": ["email", "action"],
        },
    },
]

SYSTEM_PROMPT: str = """\
You are the customer service AI for Synapse, a SaaS platform for AI chatbots.

PERSONALITY:
- Professional but warm
- Concise: max 3-4 lines per response
- Empathetic when users are frustrated
- Proactive: offer relevant additional info

RULES:
- ALWAYS use search_knowledge_base before answering about prices, plans, \
policies, or features
- If user reports a technical error, create a support ticket automatically
- If you detect accumulated frustration (multiple unresolved attempts), \
escalate to human
- Never invent information — if not in KB, say so honestly
- For account changes (cancel/upgrade), ALWAYS check account status first
- Respond in the SAME LANGUAGE as the user (Spanish or English)

AVAILABLE CONTEXT: You have tools to search the knowledge base, create \
tickets, check accounts, calculate pricing, escalate issues, and process \
account changes."""


def execute_tool(name: str, inputs: dict[str, Any]) -> str:
    """Execute a tool and return the result string."""

    if name == "search_knowledge_base":
        category = inputs["category"]
        query = inputs.get("query", "")
        context = get_context_for_agent(category, query)
        if context:
            return f"[KB/{category}] {context}"
        section = KNOWLEDGE_BASE.get(category, "")
        if section:
            return f"[KB/{category}] {section[:500]}"
        return "Information not found in knowledge base."

    if name == "create_support_ticket":
        ticket_id = (
            f"TKT-{datetime.now().strftime('%y%m%d')}-"
            f"{abs(hash(inputs['title'])) % 10000:04d}"
        )
        return (
            f"Ticket created: {ticket_id} | Priority: {inputs['priority']} | "
            f"Category: {inputs.get('category', 'other')} | '{inputs['title']}'"
        )

    if name == "check_account_status":
        email = inputs["email"]
        return (
            f"Customer: {email} | Plan: Pro ($199/month) | "
            f"Next charge: April 1, 2026 | Method: Visa ****4532 | "
            f"Status: Active | Since: Jan 2025"
        )

    if name == "calculate_pricing":
        prices: dict[str, int] = {"basic": 99, "pro": 199, "enterprise": 0}
        plan = inputs["plan"]
        price = prices.get(plan, 0)
        period = inputs["period"]

        if plan == "enterprise":
            return (
                "Enterprise: custom pricing. Contact our sales team "
                "for a personalized quote."
            )

        if period == "annual":
            monthly = round(price * 0.8)
            annual = monthly * 12
            savings = (price * 12) - annual
            return (
                f"Plan {plan.title()} (annual): ${monthly}/month "
                f"(${annual}/year) — You save ${savings}/year (20% discount)"
            )

        return f"Plan {plan.title()} (monthly): ${price}/month"

    if name == "escalate_to_human":
        ref = (
            f"ESC-{datetime.now().strftime('%y%m%d%H%M')}-"
            f"{abs(hash(inputs['reason'])) % 1000:03d}"
        )
        return (
            f"Escalated to human agent. Reference: {ref} | "
            f"Urgency: {inputs['urgency']} | Estimated response: 30 minutes. "
            f"Direct contact: soporte@empresa.com / (55) 1234-5678"
        )

    if name == "process_account_change":
        action = inputs["action"]
        email = inputs["email"]
        if action == "cancel":
            return (
                f"Cancellation initiated for {email}. Effective at end of "
                f"current billing cycle. Data retained for 90 days. "
                f"Confirmation email sent."
            )
        if action == "upgrade":
            target = inputs.get("target_plan", "pro")
            return (
                f"Upgrade to {target.title()} initiated for {email}. "
                f"Changes effective immediately. Prorated charge applied."
            )
        if action == "downgrade":
            target = inputs.get("target_plan", "basic")
            return (
                f"Downgrade to {target.title()} scheduled for {email}. "
                f"Takes effect at next billing cycle."
            )

    return "Tool not found"


async def agentic_chat(
    message: str,
    session_id: str,
    conversation_history: list[dict[str, Any]],
) -> dict[str, Any]:
    """Process a message using Claude's tool use agentic loop."""

    if settings.is_demo_mode:
        return _demo_fallback(message)

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    # Build messages from history + new message
    messages: list[dict[str, Any]] = []
    for entry in conversation_history[-20:]:
        messages.append({
            "role": entry.get("role", "user"),
            "content": entry.get("content", ""),
        })
    messages.append({"role": "user", "content": message})

    tools_used: list[dict[str, Any]] = []
    max_iterations = 5

    for _ in range(max_iterations):
        try:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2048,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            )
        except Exception as exc:
            return _demo_fallback(message, error=str(exc))

        # Claude finished responding
        if response.stop_reason == "end_turn":
            assistant_text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    assistant_text = block.text

            return {
                "response": assistant_text,
                "tools_used": tools_used,
                "agent": _determine_agent(tools_used),
                "mode": "agentic",
                "session_id": session_id,
            }

        # Claude wants to use tools
        messages.append({"role": "assistant", "content": response.content})

        tool_results: list[dict[str, Any]] = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tools_used.append({
                    "tool": block.name,
                    "input": block.input,
                    "result": result,
                })
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    # Safety: max iterations reached
    return _demo_fallback(message, error="Max iterations reached")


def _determine_agent(tools_used: list[dict[str, Any]]) -> dict[str, str]:
    """Determine which 'agent' was effectively used based on tools called."""
    if not tools_used:
        return {"name": "Orion", "role": "General"}

    tool_names = [t["tool"] for t in tools_used]

    if "escalate_to_human" in tool_names:
        return {"name": "Nexus", "role": "Escalation"}
    if "create_support_ticket" in tool_names:
        return {"name": "Atlas", "role": "Technical Support"}
    if "process_account_change" in tool_names or any(
        "facturacion" in str(t.get("input", {})) for t in tools_used
    ):
        return {"name": "Aria", "role": "Billing"}
    if "calculate_pricing" in tool_names or any(
        "ventas" in str(t.get("input", {})) for t in tools_used
    ):
        return {"name": "Nova", "role": "Sales"}

    return {"name": "Orion", "role": "General"}


def _demo_fallback(
    message: str, *, error: str | None = None
) -> dict[str, Any]:
    """Fallback when no API key or error occurs."""
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["precio", "plan", "costo", "price", "cost"]):
        resp = (
            "Tenemos 3 planes: Basico ($99/mes), Pro ($199/mes) y Enterprise "
            "(personalizado). Todos incluyen 14 dias de prueba gratis. "
            "Con pago anual obtienes 20% de descuento."
        )
        agent: dict[str, str] = {"name": "Nova", "role": "Sales"}
    elif any(w in msg_lower for w in ["error", "problema", "no funciona", "bug", "broken"]):
        resp = (
            "Lamento el problema. Para ayudarte mejor: 1) Limpia cache del "
            "navegador, 2) Prueba en modo incognito, 3) Verifica tu conexion. "
            "Si persiste, ya cree un ticket para nuestro equipo."
        )
        agent = {"name": "Atlas", "role": "Technical Support"}
    elif any(w in msg_lower for w in ["factura", "cobro", "cancelar", "reembolso", "invoice", "cancel"]):
        resp = (
            "Para temas de facturacion: las facturas CFDI se envian el dia 1. "
            "Para cancelar: Configuracion > Suscripcion > Cancelar. "
            "Reembolso completo en los primeros 30 dias."
        )
        agent = {"name": "Aria", "role": "Billing"}
    elif any(w in msg_lower for w in ["frustrado", "harto", "terrible", "angry", "frustrated"]):
        resp = (
            "Lamento mucho tu experiencia. Estoy escalando tu caso a un agente "
            "humano ahora mismo. Te contactaran en maximo 30 minutos. "
            "Ref: ESC-DEMO-001"
        )
        agent = {"name": "Nexus", "role": "Escalation"}
    else:
        resp = (
            "Hola! Soy el asistente de Synapse. Puedo ayudarte con planes y "
            "precios, soporte tecnico, facturacion, o conectarte con un agente. "
            "En que te ayudo?"
        )
        agent = {"name": "Orion", "role": "General"}

    return {
        "response": resp,
        "tools_used": [],
        "agent": agent,
        "mode": "demo",
        "session_id": "demo",
    }
