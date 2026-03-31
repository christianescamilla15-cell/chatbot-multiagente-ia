"""Admin Panel API routes — operational management of the resident support platform."""

from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

from app.db.client import execute, fetch_one, fetch_all

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ── DASHBOARD SUMMARY ──

@router.get("/dashboard")
async def dashboard_summary():
    """Complete admin dashboard with real metrics."""
    try:
        result = await fetch_one("SELECT admin_dashboard_summary() as data")
        if result and result["data"]:
            return result["data"]
    except Exception:
        pass

    # Fallback: manual queries
    residents_total = await fetch_one("SELECT COUNT(*) as c FROM residents")
    residents_active = await fetch_one("SELECT COUNT(*) as c FROM residents WHERE resident_status = 'active'")
    residents_inactive = await fetch_one("SELECT COUNT(*) as c FROM residents WHERE resident_status = 'inactive'")
    multi = await fetch_one("SELECT COUNT(*) as c FROM residents WHERE multi_household = true")
    sessions_verified = await fetch_one("SELECT COUNT(*) as c FROM resident_sessions WHERE is_verified = true AND expires_at > NOW()")
    sessions_pending = await fetch_one("SELECT COUNT(*) as c FROM resident_sessions WHERE is_verified = false AND expires_at > NOW()")
    tickets_open = await fetch_one("SELECT COUNT(*) as c FROM tickets WHERE status = 'open'")
    tickets_urgent = await fetch_one("SELECT COUNT(*) as c FROM tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed')")
    tickets_escalated = await fetch_one("SELECT COUNT(*) as c FROM tickets WHERE status = 'escalated'")
    tickets_total = await fetch_one("SELECT COUNT(*) as c FROM tickets")
    payments_overdue = await fetch_one("SELECT COUNT(*) as c FROM payments WHERE payment_status = 'overdue'")
    outstanding = await fetch_one("SELECT COALESCE(SUM(current_balance), 0) as total FROM payments WHERE payment_status IN ('pending', 'overdue', 'partial')")
    payments_paid = await fetch_one("SELECT COUNT(*) as c FROM payments WHERE payment_status = 'paid'")
    payments_unpaid = await fetch_one("SELECT COUNT(*) as c FROM payments WHERE payment_status != 'paid'")
    conflicts_pending = await fetch_one("SELECT COUNT(*) as c FROM sync_conflicts WHERE resolution_status = 'pending'")
    pending_removal = await fetch_one("SELECT COUNT(*) as c FROM residents WHERE resident_status = 'pending_removal'")
    runs_today = await fetch_one("SELECT COUNT(*) as c FROM agent_runs WHERE created_at > NOW() - INTERVAL '24 hours'")
    avg_latency = await fetch_one("SELECT AVG(latency_ms) as avg FROM agent_runs WHERE created_at > NOW() - INTERVAL '24 hours'")

    return {
        "residents": {"total": _v(residents_total), "active": _v(residents_active), "inactive": _v(residents_inactive), "multi_household": _v(multi)},
        "sessions": {"verified": _v(sessions_verified), "pending": _v(sessions_pending), "total_active": _v(sessions_verified, 0) + _v(sessions_pending, 0)},
        "tickets": {"open": _v(tickets_open), "urgent": _v(tickets_urgent), "escalated": _v(tickets_escalated), "total": _v(tickets_total)},
        "payments": {"overdue": _v(payments_overdue), "total_outstanding": float(outstanding["total"]) if outstanding else 0, "paid": _v(payments_paid), "unpaid": _v(payments_unpaid)},
        "sync": {"pending_conflicts": _v(conflicts_pending), "pending_removal": _v(pending_removal)},
        "operations": {"runs_today": _v(runs_today), "avg_latency_ms": round(avg_latency["avg"]) if avg_latency and avg_latency["avg"] else 0},
    }


def _v(row, default=0):
    return row["c"] if row else default


# ── RESIDENTS ──

@router.get("/residents")
async def list_residents(
    page: int = 1, per_page: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    verification: Optional[str] = None,
    multi_household: Optional[str] = None,
    sort: str = "id",
):
    """Paginated resident list with filters."""
    offset = (page - 1) * per_page
    conditions = []
    params = []
    idx = 1

    if search:
        conditions.append(f"(full_name ILIKE ${idx} OR unit_number ILIKE ${idx} OR phone ILIKE ${idx})")
        params.append(f"%{search}%")
        idx += 1
    if status:
        conditions.append(f"resident_status = ${idx}")
        params.append(status)
        idx += 1
    if verification == "enabled":
        conditions.append("verification_enabled = true")
    elif verification == "disabled":
        conditions.append("verification_enabled = false")
    if multi_household == "true":
        conditions.append("multi_household = true")

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    sort_col = {"id": "id", "name": "full_name", "unit": "unit_number", "status": "resident_status", "recent": "updated_at DESC"}.get(sort, "id")

    total = await fetch_one(f"SELECT COUNT(*) as c FROM residents {where}", *params)
    residents = await fetch_all(
        f"""SELECT id, full_name, unit_number, building, phone, email, resident_status,
            verification_enabled, home_type, multi_household, occupants_count,
            last_sync_at, created_at, updated_at
            FROM residents {where} ORDER BY {sort_col} LIMIT ${idx} OFFSET ${idx+1}""",
        *params, per_page, offset
    )

    return {"residents": residents, "total": total["c"] if total else 0, "page": page, "per_page": per_page}


@router.get("/residents/{resident_id}")
async def resident_detail(resident_id: int):
    """Full resident detail with operational data."""
    resident = await fetch_one(
        """SELECT * FROM residents WHERE id = $1""", resident_id
    )
    if not resident:
        return {"error": "Resident not found"}

    sessions = await fetch_all(
        """SELECT id, is_verified, verification_level, current_agent, last_activity,
            active_intent, assigned_agent, escalation_level, session_status, created_at, expires_at
            FROM resident_sessions WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 10""",
        resident_id
    )

    tickets = await fetch_all(
        """SELECT ticket_ref, category, priority, status, subject, assigned_agent, created_at, resolved_at
            FROM tickets WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 15""",
        resident_id
    )

    payments = await fetch_all(
        """SELECT concept, amount, current_balance, due_date, payment_status, receipt_ref, last_payment_date
            FROM payments WHERE resident_id = $1 ORDER BY due_date DESC LIMIT 12""",
        resident_id
    )

    verifications = await fetch_all(
        """SELECT code, status, attempts, max_attempts, created_at, expires_at
            FROM verification_codes WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 10""",
        resident_id
    )

    audit = await fetch_all(
        """SELECT change_type, field_changed, previous_value, new_value, source, created_at
            FROM resident_change_log WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 20""",
        resident_id
    )

    messages = await fetch_all(
        """SELECT direction, agent, content, channel, created_at
            FROM messages WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 20""",
        resident_id
    )

    return {
        "resident": dict(resident),
        "sessions": sessions,
        "tickets": tickets,
        "payments": payments,
        "verifications": [_mask_otp(v) for v in verifications],
        "audit": audit,
        "messages": messages,
    }


def _mask_otp(v):
    """Mask OTP code for admin view (show only last 2 digits)."""
    d = dict(v)
    if d.get("code"):
        d["code"] = f"****{d['code'][-2:]}"
    return d


class ResidentAction(BaseModel):
    action: str  # mark_inactive, restore, archive, block
    reason: Optional[str] = None


@router.post("/residents/{resident_id}/action")
async def resident_action(resident_id: int, req: ResidentAction):
    """Admin actions on residents."""
    valid = {"mark_inactive": "inactive", "restore": "active", "archive": "archived", "block": "blocked"}
    new_status = valid.get(req.action)
    if not new_status:
        return {"error": f"Invalid action. Valid: {list(valid.keys())}"}

    old = await fetch_one("SELECT resident_status FROM residents WHERE id = $1", resident_id)
    if not old:
        return {"error": "Resident not found"}

    await execute("UPDATE residents SET resident_status = $1, updated_at = NOW() WHERE id = $2", new_status, resident_id)

    from app.db.audit import log_event
    await log_event("update", resident_id=resident_id, field_changed="resident_status",
                     previous_value=old["resident_status"], new_value=new_status, source="admin")

    return {"status": new_status, "resident_id": resident_id}


# ── SESSIONS ──

@router.get("/sessions")
async def list_sessions(
    verified: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1, per_page: int = 20,
):
    """List active and recent sessions."""
    offset = (page - 1) * per_page
    conditions = []
    params = []
    idx = 1

    if verified == "true":
        conditions.append("s.is_verified = true")
    elif verified == "false":
        conditions.append("s.is_verified = false")
    if status:
        conditions.append(f"s.session_status = ${idx}")
        params.append(status)
        idx += 1

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    sessions = await fetch_all(
        f"""SELECT s.id, s.resident_id, s.phone, s.is_verified, s.verification_level,
            s.current_agent, s.active_intent, s.assigned_agent, s.escalation_level,
            s.last_activity, s.session_status, s.created_at, s.expires_at,
            r.full_name as resident_name, r.unit_number
            FROM resident_sessions s
            LEFT JOIN residents r ON s.resident_id = r.id
            {where} ORDER BY s.created_at DESC LIMIT ${idx} OFFSET ${idx+1}""",
        *params, per_page, offset
    )

    total = await fetch_one(f"SELECT COUNT(*) as c FROM resident_sessions s {where}", *params)
    return {"sessions": sessions, "total": total["c"] if total else 0}


# ── TICKETS ──

@router.get("/tickets")
async def list_tickets(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1, per_page: int = 20,
):
    """Paginated ticket list with filters."""
    offset = (page - 1) * per_page
    conditions = []
    params = []
    idx = 1

    if category:
        conditions.append(f"t.category = ${idx}")
        params.append(category)
        idx += 1
    if priority:
        conditions.append(f"t.priority = ${idx}")
        params.append(priority)
        idx += 1
    if status:
        conditions.append(f"t.status = ${idx}")
        params.append(status)
        idx += 1
    if search:
        conditions.append(f"(t.ticket_ref ILIKE ${idx} OR t.subject ILIKE ${idx} OR r.full_name ILIKE ${idx})")
        params.append(f"%{search}%")
        idx += 1

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    tickets = await fetch_all(
        f"""SELECT t.id, t.ticket_ref, t.resident_id, r.full_name as resident_name,
            t.category, t.priority, t.status, t.subject, t.assigned_agent,
            t.resolution, t.created_at, t.updated_at, t.resolved_at
            FROM tickets t
            LEFT JOIN residents r ON t.resident_id = r.id
            {where} ORDER BY t.created_at DESC LIMIT ${idx} OFFSET ${idx+1}""",
        *params, per_page, offset
    )

    total = await fetch_one(f"SELECT COUNT(*) as c FROM tickets t LEFT JOIN residents r ON t.resident_id = r.id {where}", *params)
    return {"tickets": tickets, "total": total["c"] if total else 0, "page": page}


@router.get("/tickets/{ticket_id}")
async def ticket_detail(ticket_id: int):
    """Full ticket detail with events."""
    ticket = await fetch_one(
        """SELECT t.*, r.full_name as resident_name, r.unit_number, r.phone
            FROM tickets t LEFT JOIN residents r ON t.resident_id = r.id WHERE t.id = $1""",
        ticket_id
    )
    if not ticket:
        return {"error": "Ticket not found"}

    events = await fetch_all(
        "SELECT * FROM ticket_events WHERE ticket_id = $1 ORDER BY created_at", ticket_id
    )

    return {"ticket": dict(ticket), "events": events}


# ── PAYMENTS ──

@router.get("/payments")
async def list_payments(
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1, per_page: int = 20,
):
    """Paginated payment list."""
    offset = (page - 1) * per_page
    conditions = []
    params = []
    idx = 1

    if status:
        conditions.append(f"p.payment_status = ${idx}")
        params.append(status)
        idx += 1
    if search:
        conditions.append(f"(r.full_name ILIKE ${idx} OR r.unit_number ILIKE ${idx})")
        params.append(f"%{search}%")
        idx += 1

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    payments = await fetch_all(
        f"""SELECT p.id, p.resident_id, r.full_name as resident_name, r.unit_number,
            p.concept, p.amount, p.current_balance, p.due_date, p.payment_status,
            p.receipt_ref, p.last_payment_date, p.last_payment_amount
            FROM payments p
            LEFT JOIN residents r ON p.resident_id = r.id
            {where} ORDER BY p.due_date DESC LIMIT ${idx} OFFSET ${idx+1}""",
        *params, per_page, offset
    )

    total = await fetch_one(f"SELECT COUNT(*) as c FROM payments p LEFT JOIN residents r ON p.resident_id = r.id {where}", *params)
    return {"payments": payments, "total": total["c"] if total else 0, "page": page}


# ── SYNC CONFLICTS ──

@router.get("/sync-conflicts")
async def list_sync_conflicts(
    status: Optional[str] = None,
    conflict_type: Optional[str] = None,
    page: int = 1, per_page: int = 20,
):
    """List Drive sync conflicts."""
    offset = (page - 1) * per_page
    conditions = []
    params = []
    idx = 1

    if status:
        conditions.append(f"sc.resolution_status = ${idx}")
        params.append(status)
        idx += 1
    if conflict_type:
        conditions.append(f"sc.conflict_type = ${idx}")
        params.append(conflict_type)
        idx += 1

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    conflicts = await fetch_all(
        f"""SELECT sc.*, r.full_name as resident_name, r.unit_number
            FROM sync_conflicts sc
            LEFT JOIN residents r ON sc.resident_id = r.id
            {where} ORDER BY sc.created_at DESC LIMIT ${idx} OFFSET ${idx+1}""",
        *params, per_page, offset
    )

    total = await fetch_one(f"SELECT COUNT(*) as c FROM sync_conflicts sc {where}", *params)
    return {"conflicts": conflicts, "total": total["c"] if total else 0}


class ConflictResolve(BaseModel):
    action: str  # resolve, ignore, escalate
    resolved_by: str = "admin"


@router.post("/sync-conflicts/{conflict_id}/resolve")
async def resolve_conflict(conflict_id: int, req: ConflictResolve):
    """Resolve a sync conflict."""
    valid = {"resolve": "resolved", "ignore": "ignored", "escalate": "escalated"}
    new_status = valid.get(req.action)
    if not new_status:
        return {"error": "Invalid action"}

    await execute(
        "UPDATE sync_conflicts SET resolution_status = $1, resolved_by = $2, resolved_at = NOW() WHERE id = $3",
        new_status, req.resolved_by, conflict_id
    )
    return {"status": new_status, "conflict_id": conflict_id}


# ── AUDIT LOG ──

@router.get("/audit")
async def audit_log(
    change_type: Optional[str] = None,
    resident_id: Optional[int] = None,
    page: int = 1, per_page: int = 30,
):
    """Searchable/filterable audit log."""
    offset = (page - 1) * per_page
    conditions = []
    params = []
    idx = 1

    if change_type:
        conditions.append(f"change_type = ${idx}")
        params.append(change_type)
        idx += 1
    if resident_id:
        conditions.append(f"resident_id = ${idx}")
        params.append(resident_id)
        idx += 1

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    logs = await fetch_all(
        f"""SELECT cl.*, r.full_name as resident_name
            FROM resident_change_log cl
            LEFT JOIN residents r ON cl.resident_id = r.id
            {where} ORDER BY cl.created_at DESC LIMIT ${idx} OFFSET ${idx+1}""",
        *params, per_page, offset
    )

    total = await fetch_one(f"SELECT COUNT(*) as c FROM resident_change_log {where}", *params)
    return {"logs": logs, "total": total["c"] if total else 0}


# ── AGENT RUNS ──

@router.get("/runs")
async def list_runs(page: int = 1, per_page: int = 20):
    """List agent execution runs."""
    offset = (page - 1) * per_page
    runs = await fetch_all(
        """SELECT ar.*, r.full_name as resident_name
           FROM agent_runs ar
           LEFT JOIN residents r ON ar.resident_id = r.id
           ORDER BY ar.created_at DESC LIMIT $1 OFFSET $2""",
        per_page, offset
    )
    total = await fetch_one("SELECT COUNT(*) as c FROM agent_runs")
    return {"runs": runs, "total": total["c"] if total else 0}
