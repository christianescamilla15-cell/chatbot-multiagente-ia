"""SentinelAgent — Identity verification via WhatsApp OTP."""

from __future__ import annotations

import logging
import os
import random
import string
from datetime import datetime, timedelta

from app.config import settings
from app.db.client import execute, fetch_one, fetch_all

logger = logging.getLogger(__name__)


class SentinelAgent:
    """Handles resident identity verification with OTP codes via WhatsApp."""

    name = "SentinelAgent"
    role = "Verificación de identidad"

    async def identify_resident(self, phone: str) -> dict | None:
        """Look up resident by phone number."""
        return await fetch_one(
            "SELECT * FROM residents WHERE phone = $1 AND resident_status = 'active'", phone
        )

    async def get_or_create_session(self, resident_id: int, phone: str) -> dict:
        """Get active session or create new one."""
        session = await fetch_one(
            """SELECT * FROM resident_sessions
               WHERE resident_id = $1 AND expires_at > NOW()
               ORDER BY created_at DESC LIMIT 1""",
            resident_id
        )

        if session:
            # Refresh expiry
            await execute(
                "UPDATE resident_sessions SET last_activity = NOW(), expires_at = NOW() + INTERVAL '30 minutes' WHERE id = $1",
                session["id"]
            )
            return session

        # Create new session
        session = await fetch_one(
            """INSERT INTO resident_sessions (resident_id, phone)
               VALUES ($1, $2) RETURNING *""",
            resident_id, phone
        )
        return session

    async def check_verification(self, session_id: str) -> bool:
        """Check if session is verified."""
        session = await fetch_one(
            "SELECT is_verified FROM resident_sessions WHERE id = $1", session_id
        )
        return session["is_verified"] if session else False

    async def generate_otp(self, resident_id: int, session_id: str, phone: str) -> str:
        """Generate a 6-digit OTP code."""
        # Check for recent pending codes (rate limit)
        recent = await fetch_one(
            """SELECT id FROM verification_codes
               WHERE resident_id = $1 AND status = 'pending' AND created_at > NOW() - INTERVAL '1 minute'""",
            resident_id
        )
        if recent:
            return "RATE_LIMITED"

        # Expire old pending codes
        await execute(
            "UPDATE verification_codes SET status = 'expired' WHERE resident_id = $1 AND status = 'pending'",
            resident_id
        )

        code = "".join(random.choices(string.digits, k=6))

        await execute(
            """INSERT INTO verification_codes (resident_id, session_id, code, phone, status, expires_at)
               VALUES ($1, $2, $3, $4, 'pending', NOW() + INTERVAL '5 minutes')""",
            resident_id, session_id, code, phone
        )

        logger.info("OTP generated for resident %d, session %s", resident_id, session_id)
        return code

    async def verify_otp(self, resident_id: int, session_id: str, code: str) -> dict:
        """Verify an OTP code. Returns status dict."""
        record = await fetch_one(
            """SELECT * FROM verification_codes
               WHERE resident_id = $1 AND session_id = $2 AND status = 'pending'
               ORDER BY created_at DESC LIMIT 1""",
            resident_id, session_id
        )

        if not record:
            return {"verified": False, "reason": "no_pending_code"}

        # Check expiry
        if record["expires_at"] < datetime.now(record["expires_at"].tzinfo):
            await execute("UPDATE verification_codes SET status = 'expired' WHERE id = $1", record["id"])
            return {"verified": False, "reason": "expired"}

        # Check attempts
        if record["attempts"] >= record["max_attempts"]:
            await execute("UPDATE verification_codes SET status = 'failed' WHERE id = $1", record["id"])
            return {"verified": False, "reason": "max_attempts"}

        # Increment attempts
        await execute(
            "UPDATE verification_codes SET attempts = attempts + 1 WHERE id = $1", record["id"]
        )

        # Verify code
        if record["code"] == code:
            await execute("UPDATE verification_codes SET status = 'verified' WHERE id = $1", record["id"])
            await execute(
                "UPDATE resident_sessions SET is_verified = true, verification_level = 'full' WHERE id = $1",
                session_id
            )
            logger.info("OTP verified for resident %d", resident_id)
            return {"verified": True, "reason": "success"}
        else:
            remaining = record["max_attempts"] - record["attempts"] - 1
            return {"verified": False, "reason": "invalid_code", "attempts_remaining": remaining}

    async def send_otp_whatsapp(self, phone: str, code: str, resident_name: str = "") -> bool:
        """Send OTP code via WhatsApp using Twilio.
        In demo mode, always sends to DEMO_PHONE regardless of resident's phone.
        """
        DEMO_PHONE = os.environ.get("DEMO_PHONE", "+5215579605324")

        if not settings.TWILIO_SID or not settings.TWILIO_TOKEN:
            logger.warning("Twilio not configured — OTP not sent")
            return False

        # In demo: always send to the demo phone (Christian's WhatsApp)
        target_phone = DEMO_PHONE if phone != DEMO_PHONE else phone

        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_SID, settings.TWILIO_TOKEN)

            name_line = f" para {resident_name}" if resident_name else ""
            message = client.messages.create(
                body=f"🔐 Codigo de verificacion{name_line}: *{code}*\n\nResidente: {phone}\nValido por 5 minutos. No compartas este codigo.",
                from_=settings.TWILIO_WHATSAPP_FROM,
                to=f"whatsapp:{target_phone}",
            )
            logger.info("OTP sent via WhatsApp to %s (target: %s): sid=%s", phone, target_phone, message.sid)
            return True
        except Exception as e:
            logger.error("Failed to send OTP via WhatsApp: %s", e)
            return False
