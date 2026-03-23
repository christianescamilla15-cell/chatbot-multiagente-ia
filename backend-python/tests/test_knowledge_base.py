"""Tests for the knowledge base."""

from __future__ import annotations

from app.data.knowledge_base import KNOWLEDGE_BASE, get_context_for_agent


def test_all_sections_exist() -> None:
    expected = [
        "ventas", "soporte", "facturacion", "general",
        "faq", "competidores", "onboarding", "seguridad",
    ]
    for section in expected:
        assert section in KNOWLEDGE_BASE, f"Missing section: {section}"


def test_get_context_returns_relevant_content() -> None:
    ctx: str = get_context_for_agent("general", "hola que es synapse")
    assert len(ctx) > 0


def test_get_context_for_sales_includes_pricing() -> None:
    ctx: str = get_context_for_agent("sales", "precios planes costo")
    assert any(word in ctx.lower() for word in ("$19", "$34", "$49", "precio"))


def test_get_context_for_support_includes_troubleshooting() -> None:
    ctx: str = get_context_for_agent("support", "error 500 api")
    assert any(word in ctx.lower() for word in ("error", "500", "solución", "paso"))


def test_get_context_for_billing_includes_refund() -> None:
    ctx: str = get_context_for_agent("billing", "reembolso cancelar")
    assert any(word in ctx.lower() for word in ("reembolso", "cancelación", "art."))


def test_faq_has_at_least_15_entries() -> None:
    faq: str = KNOWLEDGE_BASE["faq"]
    # Count numbered FAQ items
    count = faq.count("**") // 2  # each Q has opening and closing **
    assert count >= 15, f"FAQ has only {count} entries, expected >= 15"
