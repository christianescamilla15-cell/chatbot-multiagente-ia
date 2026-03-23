"""Tests for the intent classifier."""

from __future__ import annotations

import pytest

from app.agents.classifier import IntentClassifier


@pytest.fixture
def clf() -> IntentClassifier:
    return IntentClassifier()


@pytest.mark.asyncio
async def test_greeting_routes_to_general(clf: IntentClassifier) -> None:
    result = await clf.classify("Hola, buenos dias")
    assert result.agent_id == "general"


@pytest.mark.asyncio
async def test_pricing_routes_to_sales(clf: IntentClassifier) -> None:
    result = await clf.classify("Cuanto cuesta el plan premium?")
    assert result.agent_id == "sales"


@pytest.mark.asyncio
async def test_error_routes_to_support(clf: IntentClassifier) -> None:
    result = await clf.classify("Tengo un error 500 en la API")
    assert result.agent_id == "support"


@pytest.mark.asyncio
async def test_cancel_routes_to_billing(clf: IntentClassifier) -> None:
    result = await clf.classify("Quiero cancelar mi suscripcion y pedir reembolso")
    assert result.agent_id == "billing"


@pytest.mark.asyncio
async def test_frustrated_routes_to_escalation(clf: IntentClassifier) -> None:
    result = await clf.classify("Estoy furioso, esto es inaceptable, pésimo servicio")
    assert result.agent_id == "escalation"
    assert result.confidence >= 0.9


@pytest.mark.asyncio
async def test_ambiguous_routes_with_low_confidence(clf: IntentClassifier) -> None:
    result = await clf.classify("xyz abc random words")
    assert result.agent_id == "general"
    assert result.confidence < 0.4


@pytest.mark.asyncio
async def test_empty_message_routes_to_general(clf: IntentClassifier) -> None:
    result = await clf.classify("")
    assert result.agent_id == "general"


@pytest.mark.asyncio
async def test_confidence_above_threshold(clf: IntentClassifier) -> None:
    result = await clf.classify("Necesito ver mi factura y el recibo de pago")
    assert result.confidence >= 0.4
    assert result.agent_id == "billing"


@pytest.mark.asyncio
async def test_support_keywords_integration(clf: IntentClassifier) -> None:
    result = await clf.classify("No funciona la integración, da error al configurar")
    assert result.agent_id == "support"


@pytest.mark.asyncio
async def test_escalation_human_request(clf: IntentClassifier) -> None:
    result = await clf.classify("Quiero hablar con humano, esto es una queja formal")
    assert result.agent_id == "escalation"
