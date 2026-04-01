"""Notification Service — saves notifications and broadcasts via WebSocket."""
from __future__ import annotations

import json
import logging
from typing import Dict, Optional

from app.db.client import execute, fetch_all
from app.websocket.manager import manager

logger = logging.getLogger(__name__)


async def notify(
    notification_type: str,
    message: str,
    ticket_id: int | None = None,
    resident_id: int | None = None,
    metadata: Dict | None = None,
) -> None:
    """Save notification to DB and broadcast via WebSocket."""
    # Save to DB
    try:
        await execute(
            """INSERT INTO notifications (type, ticket_id, resident_id, message, metadata)
               VALUES ($1, $2, $3, $4, $5::jsonb)""",
            notification_type, ticket_id, resident_id, message,
            json.dumps(metadata or {}),
        )
    except Exception as e:
        logger.error("Failed to save notification: %s", e)

    # Broadcast via WebSocket
    event = {
        "type": "notification",
        "notification_type": notification_type,
        "message": message,
        "ticket_id": ticket_id,
        "resident_id": resident_id,
        "metadata": metadata or {},
    }
    await manager.broadcast(event)
    logger.info("Notification broadcast: %s (clients: %d)", notification_type, manager.count)


async def notify_ticket_created(ticket_ref: str, subject: str, priority: str, resident_id: int) -> None:
    await notify("ticket_created", f"Nuevo ticket {ticket_ref}: {subject} [{priority}]",
                  resident_id=resident_id, metadata={"ticket_ref": ticket_ref, "priority": priority})


async def notify_ticket_updated(ticket_ref: str, status: str, ticket_id: int) -> None:
    await notify("ticket_updated", f"Ticket {ticket_ref} actualizado: {status}",
                  ticket_id=ticket_id, metadata={"ticket_ref": ticket_ref, "status": status})


async def notify_ticket_escalated(ticket_ref: str, ticket_id: int, resident_id: int) -> None:
    await notify("ticket_escalated", f"URGENTE: Ticket {ticket_ref} escalado",
                  ticket_id=ticket_id, resident_id=resident_id,
                  metadata={"ticket_ref": ticket_ref, "urgent": True})


async def get_notifications(limit: int = 20, unread_only: bool = False) -> list:
    """Get recent notifications."""
    query = "SELECT * FROM notifications"
    if unread_only:
        query += " WHERE read = false"
    query += " ORDER BY created_at DESC LIMIT $1"
    return await fetch_all(query, limit)


async def mark_read(notification_id: int) -> None:
    await execute("UPDATE notifications SET read = true WHERE id = $1", notification_id)


async def get_unread_count() -> int:
    result = await fetch_all("SELECT COUNT(*) as c FROM notifications WHERE read = false")
    return result[0]["c"] if result else 0
