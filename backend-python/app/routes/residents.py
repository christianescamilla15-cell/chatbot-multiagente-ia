"""API routes for the Resident Support System."""

from __future__ import annotations

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.agents.orchestrator import process_message
from app.db.client import fetch_one, fetch_all

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


@router.get("/knowledge")
async def list_knowledge():
    """List all knowledge base documents."""
    docs = await fetch_all("SELECT id, title, category, is_active FROM knowledge_documents ORDER BY category")
    return {"documents": docs}
