"""SMS inbound webhook — receives SMS from Twilio, routes through orchestrator, responds via TwiML."""

from __future__ import annotations

import logging
import xml.sax.saxutils as saxutils
from typing import Optional

from fastapi import APIRouter, Form, Response

from app.agents.orchestrator import process_message

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sms", tags=["sms"])


def twiml_response(text: str) -> Response:
    """Return a TwiML XML response."""
    safe_text = saxutils.escape(text[:1600])
    xml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{safe_text}</Message></Response>'
    return Response(content=xml, media_type="application/xml")


@router.post("/webhook")
async def sms_webhook(
    Body: str = Form(""),
    From: str = Form(""),
):
    """Receive SMS from Twilio, process through orchestrator, respond via TwiML."""
    phone = From.strip()
    message_text = Body.strip()

    logger.info("SMS from %s: '%s'", phone, message_text[:50])

    if not message_text:
        return Response(content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>', media_type="application/xml")

    try:
        result = await process_message(message=message_text, phone=phone)
        response_text = result.get("text", "No pude procesar tu mensaje.")
        logger.info("SMS processed: agent=%s intent=%s", result.get("agent"), result.get("intent"))
        return twiml_response(response_text)
    except Exception as e:
        logger.error("SMS orchestrator error: %s", e)
        return twiml_response("Hubo un error. Intenta de nuevo.")
