"""Audit logging for all security-sensitive actions."""

import logging
from app.db.client import execute

logger = logging.getLogger(__name__)


async def log_event(
    change_type: str,
    resident_id: int | None = None,
    field_changed: str | None = None,
    previous_value: str | None = None,
    new_value: str | None = None,
    source: str = "system",
    metadata: dict | None = None,
):
    """Write an audit log entry."""
    try:
        import json
        meta_json = json.dumps(metadata) if metadata else "{}"
        await execute(
            """INSERT INTO resident_change_log
               (resident_id, change_type, field_changed, previous_value, new_value, source, metadata)
               VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)""",
            resident_id, change_type, field_changed, previous_value, new_value, source, meta_json,
        )
    except Exception as e:
        logger.error("Audit log failed: %s", e)


async def log_otp_send(resident_id: int, phone: str):
    await log_event("otp_send", resident_id=resident_id, metadata={"phone": phone})


async def log_otp_verify(resident_id: int, success: bool, reason: str = ""):
    await log_event(
        "otp_verify" if success else "otp_fail",
        resident_id=resident_id,
        metadata={"success": success, "reason": reason},
    )


async def log_session_create(resident_id: int, session_id: str):
    await log_event("session_create", resident_id=resident_id, metadata={"session_id": session_id})


async def log_session_expire(resident_id: int, session_id: str):
    await log_event("session_expire", resident_id=resident_id, metadata={"session_id": session_id})


async def log_ticket_create(resident_id: int, ticket_ref: str, category: str):
    await log_event("ticket_create", resident_id=resident_id, metadata={"ticket_ref": ticket_ref, "category": category})


async def log_escalation(resident_id: int, reason: str):
    await log_event("escalation", resident_id=resident_id, metadata={"reason": reason})
