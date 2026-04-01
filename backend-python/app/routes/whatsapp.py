"""WhatsApp inbound webhook — receives messages from Twilio, routes through orchestrator, responds via TwiML."""

from __future__ import annotations

import logging
import xml.sax.saxutils as saxutils
from typing import Optional

import requests
from fastapi import APIRouter, Form, Response

from app.agents.orchestrator import process_message
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"


def twiml_response(text: str) -> Response:
    """Return a TwiML XML response with escaped text."""
    safe_text = saxutils.escape(text[:1600])
    xml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{safe_text}</Message></Response>'
    return Response(content=xml, media_type="application/xml")


def download_twilio_media(media_url: str) -> bytes:
    """Download media from Twilio (requires auth)."""
    resp = requests.get(
        media_url,
        auth=(settings.TWILIO_SID, settings.TWILIO_TOKEN),
        timeout=15,
    )
    resp.raise_for_status()
    return resp.content


def transcribe_audio(audio_bytes: bytes, language: str = "es") -> str:
    """Transcribe audio using Groq Whisper."""
    if not settings.GROQ_API_KEY:
        return ""
    try:
        import httpx
        resp = httpx.post(
            GROQ_WHISPER_URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            files={"file": ("audio.ogg", audio_bytes, "audio/ogg")},
            data={"model": "whisper-large-v3-turbo", "language": language, "response_format": "text"},
            timeout=15,
        )
        if resp.status_code == 200:
            return resp.text.strip()
        logger.error("Whisper error %d: %s", resp.status_code, resp.text[:200])
    except Exception as e:
        logger.error("Whisper transcription failed: %s", e)
    return ""


@router.post("/webhook")
async def whatsapp_webhook(
    Body: str = Form(""),
    From: str = Form(""),
    NumMedia: str = Form("0"),
    MediaUrl0: Optional[str] = Form(None),
    MediaContentType0: Optional[str] = Form(None),
):
    """Receive WhatsApp messages from Twilio, process, respond via TwiML only."""
    phone = From.replace("whatsapp:", "")
    num_media = int(NumMedia)
    message_text = ""

    logger.info("WhatsApp from %s: body='%s' media=%d", phone, Body[:50], num_media)

    # Case 1: Voice note
    if num_media > 0 and MediaUrl0 and "audio" in (MediaContentType0 or ""):
        try:
            audio_bytes = download_twilio_media(MediaUrl0)
            message_text = transcribe_audio(audio_bytes)
            if not message_text:
                return twiml_response("No se pudo transcribir el audio. Intenta con texto.")
        except Exception as e:
            logger.error("Voice error: %s", e)
            return twiml_response("Error procesando audio. Intenta de nuevo.")

    # Case 2: File/image
    elif num_media > 0 and MediaUrl0:
        return twiml_response("Recibi tu archivo. Por ahora solo proceso texto y notas de voz.")

    # Case 3: Text
    elif Body.strip():
        message_text = Body.strip()

    # No content
    else:
        return Response(content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>', media_type="application/xml")

    # Route through orchestrator
    try:
        result = await process_message(message=message_text, phone=phone)
        response_text = result.get("text", "No pude procesar tu mensaje.")
        logger.info("WhatsApp processed: agent=%s intent=%s", result.get("agent"), result.get("intent"))
        return twiml_response(response_text)
    except Exception as e:
        logger.error("Orchestrator error: %s", e)
        return twiml_response("Hubo un error. Intenta de nuevo.")
