"""Tests for the agentic chat service (tool use)."""

from __future__ import annotations

import pytest
import pytest_asyncio

from app.services.agentic_service import (
    _demo_fallback,
    _determine_agent,
    execute_tool,
    agentic_chat,
)


# ── Demo fallback tests ─────────────────────────────────────────


class TestDemoFallback:
    """Verify keyword-based demo responses."""

    def test_demo_fallback_pricing(self) -> None:
        result = _demo_fallback("Cuanto cuesta el plan pro?")
        assert result["agent"]["name"] == "Nova"
        assert result["agent"]["role"] == "Sales"
        assert result["mode"] == "demo"
        assert "plan" in result["response"].lower() or "precio" in result["response"].lower()

    def test_demo_fallback_support(self) -> None:
        result = _demo_fallback("Tengo un error en la plataforma")
        assert result["agent"]["name"] == "Atlas"
        assert result["agent"]["role"] == "Technical Support"
        assert result["mode"] == "demo"

    def test_demo_fallback_billing(self) -> None:
        result = _demo_fallback("Quiero cancelar mi suscripcion")
        assert result["agent"]["name"] == "Aria"
        assert result["agent"]["role"] == "Billing"
        assert result["mode"] == "demo"

    def test_demo_fallback_escalation(self) -> None:
        result = _demo_fallback("Estoy frustrado con el servicio")
        assert result["agent"]["name"] == "Nexus"
        assert result["agent"]["role"] == "Escalation"
        assert result["mode"] == "demo"

    def test_demo_fallback_general(self) -> None:
        result = _demo_fallback("Hola, buenas tardes")
        assert result["agent"]["name"] == "Orion"
        assert result["agent"]["role"] == "General"
        assert result["mode"] == "demo"
        assert result["session_id"] == "demo"


# ── Tool execution tests ────────────────────────────────────────


class TestExecuteTool:
    """Verify each tool returns expected output."""

    def test_execute_tool_search_kb(self) -> None:
        result = execute_tool(
            "search_knowledge_base",
            {"category": "ventas", "query": "planes precios"},
        )
        assert "[KB/ventas]" in result
        assert "Plan" in result or "plan" in result.lower()

    def test_execute_tool_create_ticket(self) -> None:
        result = execute_tool(
            "create_support_ticket",
            {
                "title": "Widget not loading",
                "priority": "high",
                "description": "The chat widget fails to render on our site",
                "category": "bug",
            },
        )
        assert "TKT-" in result
        assert "high" in result.lower()
        assert "Widget not loading" in result

    def test_execute_tool_calculate_pricing_monthly(self) -> None:
        result = execute_tool(
            "calculate_pricing",
            {"plan": "pro", "period": "monthly"},
        )
        assert "$199/month" in result
        assert "Pro" in result

    def test_execute_tool_calculate_pricing_annual(self) -> None:
        result = execute_tool(
            "calculate_pricing",
            {"plan": "pro", "period": "annual"},
        )
        assert "20% discount" in result
        assert "save" in result.lower()

    def test_execute_tool_calculate_pricing_enterprise(self) -> None:
        result = execute_tool(
            "calculate_pricing",
            {"plan": "enterprise", "period": "monthly"},
        )
        assert "custom pricing" in result.lower()

    def test_execute_tool_check_account(self) -> None:
        result = execute_tool(
            "check_account_status",
            {"email": "test@example.com"},
        )
        assert "test@example.com" in result
        assert "Pro" in result
        assert "Active" in result

    def test_execute_tool_escalate(self) -> None:
        result = execute_tool(
            "escalate_to_human",
            {
                "reason": "User very frustrated",
                "urgency": "high",
                "conversation_summary": "Multiple failed attempts",
            },
        )
        assert "ESC-" in result
        assert "high" in result.lower()
        assert "soporte@empresa.com" in result

    def test_execute_tool_process_cancel(self) -> None:
        result = execute_tool(
            "process_account_change",
            {"email": "user@test.com", "action": "cancel"},
        )
        assert "Cancellation" in result
        assert "user@test.com" in result

    def test_execute_tool_process_upgrade(self) -> None:
        result = execute_tool(
            "process_account_change",
            {"email": "user@test.com", "action": "upgrade", "target_plan": "enterprise"},
        )
        assert "Upgrade" in result
        assert "Enterprise" in result

    def test_execute_tool_process_downgrade(self) -> None:
        result = execute_tool(
            "process_account_change",
            {"email": "user@test.com", "action": "downgrade", "target_plan": "basic"},
        )
        assert "Downgrade" in result
        assert "Basic" in result

    def test_execute_tool_unknown(self) -> None:
        result = execute_tool("nonexistent_tool", {})
        assert result == "Tool not found"


# ── Agent determination tests ───────────────────────────────────


class TestDetermineAgent:
    """Verify agent name/role is inferred correctly from tool usage."""

    def test_no_tools(self) -> None:
        agent = _determine_agent([])
        assert agent["name"] == "Orion"
        assert agent["role"] == "General"

    def test_escalation(self) -> None:
        tools = [{"tool": "escalate_to_human", "input": {}, "result": "ok"}]
        agent = _determine_agent(tools)
        assert agent["name"] == "Nexus"

    def test_support_ticket(self) -> None:
        tools = [{"tool": "create_support_ticket", "input": {}, "result": "ok"}]
        agent = _determine_agent(tools)
        assert agent["name"] == "Atlas"

    def test_billing_via_tool(self) -> None:
        tools = [{"tool": "process_account_change", "input": {"action": "cancel"}, "result": "ok"}]
        agent = _determine_agent(tools)
        assert agent["name"] == "Aria"

    def test_billing_via_category(self) -> None:
        tools = [
            {
                "tool": "search_knowledge_base",
                "input": {"category": "facturacion", "query": "reembolso"},
                "result": "ok",
            }
        ]
        agent = _determine_agent(tools)
        assert agent["name"] == "Aria"

    def test_sales_via_pricing(self) -> None:
        tools = [{"tool": "calculate_pricing", "input": {"plan": "pro"}, "result": "ok"}]
        agent = _determine_agent(tools)
        assert agent["name"] == "Nova"

    def test_sales_via_category(self) -> None:
        tools = [
            {
                "tool": "search_knowledge_base",
                "input": {"category": "ventas", "query": "planes"},
                "result": "ok",
            }
        ]
        agent = _determine_agent(tools)
        assert agent["name"] == "Nova"

    def test_general_fallback(self) -> None:
        tools = [
            {
                "tool": "search_knowledge_base",
                "input": {"category": "general", "query": "horario"},
                "result": "ok",
            }
        ]
        agent = _determine_agent(tools)
        assert agent["name"] == "Orion"


# ── Agentic chat (demo mode) ───────────────────────────────────


class TestAgenticChatDemoMode:
    """The agentic_chat function should fall back to demo when no API key."""

    @pytest.mark.asyncio
    async def test_agentic_chat_demo_mode(self) -> None:
        result = await agentic_chat(
            message="Cuanto cuesta el plan basico?",
            session_id="test-session",
            conversation_history=[],
        )
        assert result["mode"] == "demo"
        assert result["response"]
        assert isinstance(result["tools_used"], list)


# ── API endpoint test ───────────────────────────────────────────


class TestAgenticEndpoint:
    """Test the /api/chat/agentic HTTP endpoint."""

    @pytest.mark.asyncio
    async def test_agentic_endpoint_returns_200(self, client) -> None:
        resp = await client.post(
            "/api/chat/agentic",
            json={"message": "Hola, que planes tienen?"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "response" in data
        assert "agent" in data
        assert "tools_used" in data
        assert "mode" in data
        assert data["demo"] is True  # No API key in tests

    @pytest.mark.asyncio
    async def test_agentic_endpoint_empty_message_rejected(self, client) -> None:
        resp = await client.post(
            "/api/chat/agentic",
            json={"message": ""},
        )
        assert resp.status_code == 422
