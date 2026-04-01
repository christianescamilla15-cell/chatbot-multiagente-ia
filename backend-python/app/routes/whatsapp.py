"""WhatsApp inbound webhook — receives messages from Twilio, routes through orchestrator, responds via WhatsApp."""

from __future__ import annotations

import io
import logging
import os
from typing import Optional

import requests
from fastapi import APIRouter, Form, Response

from app.agents.orchestrator import process_message
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"


def send_whatsapp_response(to_phone: str, message: str) -> bool:
    """Send a WhatsApp message back to the resident via Twilio."""
    if not settings.TWILIO_SID or not settings.TWILIO_TOKEN:
        logger.warning("Twilio not configured")
        return False

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_SID, settings.TWILIO_TOKEN)
        # Truncate to WhatsApp limit (1600 chars)
        msg_text = message[:1600]
        client.messages.create(
            body=msg_text,
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{to_phone}",
        )
        logger.info("WhatsApp response sent to %s (%d chars)", to_phone, len(msg_text))
        return True
    except Exception as e:
        logger.error("Failed to send WhatsApp response: %s", e)
        return False


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
    """Receive WhatsApp messages from Twilio, process through orchestrator, respond.

    Handles:
    - Text messages -> orchestrator -> response
    - Voice notes -> Whisper transcription -> orchestrator -> response
    - Images -> acknowledge receipt
    """
    phone = From.replace("whatsapp:", "")
    num_media = int(NumMedia)
    message_text = ""

    logger.info("WhatsApp inbound from %s: body='%s' media=%d", phone, Body[:50], num_media)

    # --- Extract message text ---

    # Case 1: Voice note
    if num_media > 0 and MediaUrl0 and "audio" in (MediaContentType0 or ""):
        try:
            audio_bytes = download_twilio_media(MediaUrl0)
            message_text = transcribe_audio(audio_bytes)
            if not message_text:
                send_whatsapp_response(phone, "No se pudo transcribir el audio. Intenta enviar un mensaje de texto.")
                return Response(status_code=200)
            logger.info("Voice transcribed: %s", message_text[:100])
        except Exception as e:
            logger.error("Voice processing error: %s", e)
            send_whatsapp_response(phone, "Error procesando audio. Intenta de nuevo.")
            return Response(status_code=200)

    # Case 2: Image/document (acknowledge only)
    elif num_media > 0 and MediaUrl0 and "audio" not in (MediaContentType0 or ""):
        send_whatsapp_response(phone, "Recibi tu archivo. Por ahora solo proceso texto y notas de voz.")
        return Response(status_code=200)

    # Case 3: Text message
    elif Body.strip():
        message_text = Body.strip()

    # No content
    else:
        return Response(status_code=200)

    # --- Route through orchestrator ---
    try:
        result = await process_message(message=message_text, phone=phone)
        response_text = result.get("text", "No pude procesar tu mensaje.")

        # Send response back via WhatsApp
        send_whatsapp_response(phone, response_text)

        logger.info(
            "WhatsApp processed: phone=%s agent=%s intent=%s",
            phone, result.get("agent"), result.get("intent"),
        )
    except Exception as e:
        logger.error("Orchestrator error for WhatsApp: %s", e)
        send_whatsapp_response(phone, "Hubo un error procesando tu mensaje. Intenta de nuevo.")

    return Response(status_code=200)
