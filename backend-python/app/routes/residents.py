"""API routes for the Resident Support System."""

from __future__ import annotations

from fastapi import APIRouter, Request
from pydantic import BaseModel

import os
from fastapi import UploadFile, File
from app.agents.orchestrator import process_message
from app.db.client import execute, fetch_one, fetch_all, get_pool
from app.integrations.drive_sync import sync_from_csv
from app.integrations.email_service import send_ticket_notification

router = APIRouter(prefix="/api/residents", tags=["residents"])


class MessageRequest(BaseModel):
    message: str
    phone: str = "+5215579605324"  # Default to Christian's phone for testing
    session_id: str | None = None


class VerifyRequest(BaseModel):
    phone: str
    code: str
    session_id: str


@router.post("/chat")
async def resident_chat(req: MessageRequest):
    """Main chat endpoint — routes through the agent pipeline."""
    result = await process_message(
        message=req.message,
        phone=req.phone,
        session_id=req.session_id,
    )
    return result


@router.get("/lookup/{phone}")
async def lookup_resident(phone: str):
    """Look up resident by phone number."""
    resident = await fetch_one(
        "SELECT id, full_name, unit_number, building, resident_status FROM residents WHERE phone = $1",
        phone
    )
    if not resident:
        return {"found": False}
    return {"found": True, "resident": dict(resident)}


class ResetRequest(BaseModel):
    phone: str = "+5215579605324"


@router.post("/reset-session")
async def reset_session(req: ResetRequest):
    """Reset/expire all sessions for a phone number (used by frontend clear chat)."""
    await execute(
        "UPDATE resident_sessions SET is_verified = false, verification_level = 'none', expires_at = NOW() - INTERVAL '1 hour' WHERE phone = $1",
        req.phone
    )
    await execute(
        "UPDATE verification_codes SET status = 'expired' WHERE phone = $1 AND status = 'pending'",
        req.phone
    )
    return {"status": "ok", "message": "Session reset"}


@router.get("/env-check")
async def env_check():
    """Debug: verify env vars are loaded."""
    from app.config import settings
    return {
        "groq_key_set": bool(settings.GROQ_API_KEY),
        "groq_key_prefix": settings.GROQ_API_KEY[:10] + "..." if settings.GROQ_API_KEY else "EMPTY",
        "anthropic_key_set": bool(settings.ANTHROPIC_API_KEY),
        "twilio_sid_set": bool(settings.TWILIO_SID),
        "database_url_set": bool(settings.DATABASE_URL),
        "is_demo_mode": settings.is_demo_mode,
    }


@router.get("/db-check")
async def db_check():
    """Debug endpoint to verify DB connection."""
    db_url = os.environ.get("DATABASE_URL", "NOT SET")
    pool = await get_pool()
    if not pool:
        return {"db": "no pool", "url_prefix": db_url[:30] + "..." if len(db_url) > 30 else db_url}
    try:
        async with pool.acquire() as conn:
            count = await conn.fetchval("SELECT COUNT(*) FROM residents")
            return {"db": "connected", "residents": count, "url_prefix": db_url[:50] + "..."}
    except Exception as e:
        return {"db": "error", "error": str(e)}


@router.get("/stats")
async def system_stats():
    """Get system-wide stats."""
    residents = await fetch_one("SELECT COUNT(*) as total FROM residents")
    active = await fetch_one("SELECT COUNT(*) as total FROM residents WHERE resident_status = 'active'")
    tickets_open = await fetch_one("SELECT COUNT(*) as total FROM tickets WHERE status IN ('open', 'in_progress')")
    tickets_total = await fetch_one("SELECT COUNT(*) as total FROM tickets")
    sessions_active = await fetch_one("SELECT COUNT(*) as total FROM resident_sessions WHERE expires_at > NOW()")
    runs_today = await fetch_one("SELECT COUNT(*) as total FROM agent_runs WHERE created_at > NOW() - INTERVAL '24 hours'")
    avg_latency = await fetch_one("SELECT AVG(latency_ms) as avg FROM agent_runs WHERE created_at > NOW() - INTERVAL '24 hours'")

    return {
        "residents": {"total": residents["total"] if residents else 0, "active": active["total"] if active else 0},
        "tickets": {"open": tickets_open["total"] if tickets_open else 0, "total": tickets_total["total"] if tickets_total else 0},
        "sessions_active": sessions_active["total"] if sessions_active else 0,
        "runs_today": runs_today["total"] if runs_today else 0,
        "avg_latency_ms": round(avg_latency["avg"]) if avg_latency and avg_latency["avg"] else 0,
    }


@router.get("/tickets")
async def list_tickets(status: str | None = None, limit: int = 20):
    """List tickets with optional status filter."""
    if status:
        tickets = await fetch_all(
            "SELECT * FROM tickets WHERE status = $1 ORDER BY created_at DESC LIMIT $2",
            status, limit
        )
    else:
        tickets = await fetch_all(
            "SELECT * FROM tickets ORDER BY created_at DESC LIMIT $1",
            limit
        )
    return {"tickets": tickets, "total": len(tickets)}


@router.get("/runs")
async def list_runs(limit: int = 20):
    """List recent agent runs for observability."""
    runs = await fetch_all(
        "SELECT * FROM agent_runs ORDER BY created_at DESC LIMIT $1",
        limit
    )
    return {"runs": runs, "total": len(runs)}


@router.get("/sample")
async def sample_residents(limit: int = 10):
    """Get a sample of residents for the demo selector."""
    residents = await fetch_all(
        """SELECT id, full_name, phone, unit_number, building, resident_status
           FROM residents WHERE resident_status = 'active'
           ORDER BY id LIMIT $1""",
        limit
    )
    return {"residents": residents}


@router.get("/knowledge")
async def list_knowledge():
    """List all knowledge base documents."""
    docs = await fetch_all("SELECT id, title, category, is_active FROM knowledge_documents ORDER BY category")
    return {"documents": docs}


@router.get("/audit")
async def audit_log(limit: int = 50):
    """View recent audit log entries."""
    logs = await fetch_all(
        "SELECT * FROM resident_change_log ORDER BY created_at DESC LIMIT $1", limit
    )
    return {"logs": logs, "total": len(logs)}


@router.get("/residents-list")
async def residents_list(page: int = 1, per_page: int = 20, search: str | None = None):
    """Paginated resident list with optional search."""
    offset = (page - 1) * per_page
    if search:
        residents = await fetch_all(
            """SELECT id, full_name, phone, unit_number, building, resident_status, created_at
               FROM residents WHERE full_name ILIKE $1 OR unit_number ILIKE $1 OR phone ILIKE $1
               ORDER BY id LIMIT $2 OFFSET $3""",
            f"%{search}%", per_page, offset
        )
        total = await fetch_one("SELECT COUNT(*) as c FROM residents WHERE full_name ILIKE $1 OR unit_number ILIKE $1", f"%{search}%")
    else:
        residents = await fetch_all(
            "SELECT id, full_name, phone, unit_number, building, resident_status, created_at FROM residents ORDER BY id LIMIT $1 OFFSET $2",
            per_page, offset
        )
        total = await fetch_one("SELECT COUNT(*) as c FROM residents")
    return {"residents": residents, "total": total["c"] if total else 0, "page": page, "per_page": per_page}


@router.post("/sync")
async def sync_residents(file: UploadFile = File(...)):
    """Upload CSV to sync residents from Google Drive export."""
    content = (await file.read()).decode("utf-8")
    result = await sync_from_csv(content, source="drive-upload")
    return result


@router.get("/pending-removal")
async def pending_removal():
    """List residents flagged for removal (from Drive sync)."""
    residents = await fetch_all(
        "SELECT id, full_name, phone, unit_number FROM residents WHERE resident_status = 'pending_removal' ORDER BY updated_at DESC"
    )
    return {"residents": residents, "total": len(residents)}


@router.post("/{resident_id}/confirm-removal")
async def confirm_removal(resident_id: int):
    """Confirm removal of a resident (soft archive)."""
    await execute("UPDATE residents SET resident_status = 'archived', updated_at = NOW() WHERE id = $1", resident_id)
    return {"status": "archived", "resident_id": resident_id}


@router.post("/{resident_id}/restore")
async def restore_resident(resident_id: int):
    """Restore a pending-removal or archived resident."""
    await execute("UPDATE residents SET resident_status = 'active', updated_at = NOW() WHERE id = $1", resident_id)
    return {"status": "active", "resident_id": resident_id}


@router.get("/conversations/{phone}")
async def conversation_history(phone: str, limit: int = 50):
    """Get conversation history for a resident by phone."""
    resident = await fetch_one("SELECT id, full_name FROM residents WHERE phone = $1", phone)
    if not resident:
        return {"messages": [], "resident": None}
    messages = await fetch_all(
        """SELECT m.direction, m.agent, m.content, m.channel, m.created_at
           FROM messages m WHERE m.resident_id = $1
           ORDER BY m.created_at DESC LIMIT $2""",
        resident["id"], limit
    )
    return {"messages": messages, "resident": dict(resident)}
