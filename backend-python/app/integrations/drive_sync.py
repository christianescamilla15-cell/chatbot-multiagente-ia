"""Google Drive → Database synchronization worker.

Architecture: Drive Spreadsheet → Parse → Validate → Compare → Safe Update → Audit Log
Drive is NOT source of truth. DB is source of truth. Drive is for bulk import/update only.
"""

import logging
import csv
import io
from typing import Any

from app.db.client import execute, fetch_one, fetch_all
from app.db.audit import log_event

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = {"full_name", "unit_number", "phone_number"}
VALID_STATUSES = {"active", "inactive", "archived", "blocked", "pending_removal"}


async def sync_from_csv(csv_content: str, source: str = "drive") -> dict:
    """Parse CSV content and sync residents with the database.

    CSV columns: resident_external_id, full_name, unit_number, phone_number, email, resident_status
    """
    reader = csv.DictReader(io.StringIO(csv_content))
    results = {"created": 0, "updated": 0, "marked_inactive": 0, "errors": [], "total_rows": 0}

    drive_phones = set()
    rows = list(reader)
    results["total_rows"] = len(rows)

    for i, row in enumerate(rows):
        try:
            # Validate required fields
            full_name = row.get("full_name", "").strip()
            unit_number = row.get("unit_number", "").strip()
            phone = row.get("phone_number", "").strip()
            email = row.get("email", "").strip() or None
            status = row.get("resident_status", "active").strip()
            external_id = row.get("resident_external_id", "").strip()

            if not full_name or not unit_number or not phone:
                results["errors"].append(f"Row {i+1}: missing required fields (name, unit, phone)")
                continue

            if status not in VALID_STATUSES:
                status = "active"

            # Normalize phone
            if not phone.startswith("+"):
                phone = f"+52{phone}" if not phone.startswith("52") else f"+{phone}"

            drive_phones.add(phone)

            # Check if resident exists
            existing = await fetch_one(
                "SELECT id, full_name, unit_number, email, resident_status FROM residents WHERE phone = $1",
                phone
            )

            if existing:
                # UPDATE — only allowed fields
                changes = []
                if existing["full_name"] != full_name:
                    changes.append(("full_name", existing["full_name"], full_name))
                if existing["unit_number"] != unit_number:
                    changes.append(("unit_number", existing["unit_number"], unit_number))
                if existing["email"] != email and email:
                    changes.append(("email", existing["email"], email))
                if existing["resident_status"] != status:
                    changes.append(("resident_status", existing["resident_status"], status))

                if changes:
                    await execute(
                        """UPDATE residents SET full_name = $1, unit_number = $2, email = $3,
                           resident_status = $4, updated_at = NOW() WHERE phone = $5""",
                        full_name, unit_number, email, status, phone
                    )
                    for field, old, new in changes:
                        await log_event("update", resident_id=existing["id"],
                                        field_changed=field, previous_value=str(old), new_value=str(new), source=source)
                    results["updated"] += 1
            else:
                # CREATE new resident
                await execute(
                    """INSERT INTO residents (full_name, phone, email, unit_number, resident_status, verification_enabled)
                       VALUES ($1, $2, $3, $4, $5, true)""",
                    full_name, phone, email, unit_number, status
                )
                new_resident = await fetch_one("SELECT id FROM residents WHERE phone = $1", phone)
                if new_resident:
                    await log_event("create", resident_id=new_resident["id"], source=source,
                                    metadata={"full_name": full_name, "unit": unit_number, "phone": phone})
                results["created"] += 1

        except Exception as e:
            results["errors"].append(f"Row {i+1}: {str(e)}")

    # Mark missing residents as inactive (soft delete)
    if drive_phones:
        all_phones = await fetch_all(
            "SELECT id, phone FROM residents WHERE resident_status = 'active' AND phone NOT IN (SELECT unnest($1::text[]))",
            list(drive_phones)
        )
        for r in all_phones:
            # Don't auto-deactivate, just flag for review
            await execute(
                "UPDATE residents SET resident_status = 'pending_removal', updated_at = NOW() WHERE id = $1",
                r["id"]
            )
            await log_event("mark_inactive", resident_id=r["id"], source=source,
                            field_changed="resident_status", previous_value="active", new_value="pending_removal")
            results["marked_inactive"] += 1

    logger.info("Drive sync complete: %s", results)
    return results
