"""Tests for individual agent behaviour."""

from __future__ import annotations

import pytest

from app.agents.billing import BillingAgent
from app.agents.escalation import EscalationAgent
from app.agents.general import GeneralAgent
from app.agents.sales import SalesAgent
from app.agents.support import SupportAgent


def test_each_agent_has_name_and_role() -> None:
    agents = [SalesAgent(), SupportAgent(), BillingAgent(), EscalationAgent(), GeneralAgent()]
    for agent in agents:
        assert agent.name, f"{agent.__class__.__name__} missing name"
        assert agent.role, f"{agent.__class__.__name__} missing role"


def test_sales_agent_demo_response_contains_pricing() -> None:
    agent = SalesAgent()
    response: str = agent.demo_response("Cuanto cuesta el plan?")
    assert any(w in response.lower() for w in ("$", "precio", "plan", "mes"))


def test_support_agent_demo_response_contains_steps() -> None:
    agent = SupportAgent()
    response: str = agent.demo_response("Tengo un error en la API")
    # Should contain numbered steps
    assert "1." in response or "**1.**" in response


def test_escalation_agent_generates_ticket_reference() -> None:
    agent = EscalationAgent()
    response: str = agent.demo_response("Estoy furioso con el servicio")
    assert "ESC-2024-" in response


def test_billing_agent_demo_mentions_refund_policy() -> None:
    agent = BillingAgent()
    response: str = agent.demo_response("Necesito un reembolso")
    assert any(w in response.lower() for w in ("reembolso", "refund", "política", "art."))


def test_general_agent_demo_greeting() -> None:
    agent = GeneralAgent()
    response: str = agent.demo_response("Hola buenas tardes")
    assert any(w in response.lower() for w in ("hola", "bienvenido", "synapse"))


def test_sales_agent_trial_response() -> None:
    agent = SalesAgent()
    response: str = agent.demo_response("Tienen prueba gratis?")
    assert "14 días" in response or "prueba" in response.lower()


def test_support_agent_integration_response() -> None:
    agent = SupportAgent()
    response: str = agent.demo_response("Como instalar el widget?")
    assert "integración" in response.lower() or "script" in response.lower() or "API" in response
