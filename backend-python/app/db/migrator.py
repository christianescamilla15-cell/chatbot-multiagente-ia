"""Auto-run SQL migrations on startup."""
import os
import logging
import asyncpg

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "migrations")


async def run_migrations(pool: asyncpg.Pool) -> int:
    """Run all .sql files in migrations/ directory in order."""
    if not pool:
        return 0

    # Track applied migrations
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(200) UNIQUE NOT NULL,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)

        applied = {r["filename"] for r in await conn.fetch("SELECT filename FROM _migrations")}

    # Find and run new migrations
    migration_files = sorted(f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql"))
    count = 0

    for filename in migration_files:
        if filename in applied:
            continue

        filepath = os.path.join(MIGRATIONS_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            sql = f.read()

        async with pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute(sql)
                await conn.execute("INSERT INTO _migrations (filename) VALUES ($1)", filename)

        logger.info("Migration applied: %s", filename)
        count += 1

    logger.info("Migrations complete: %d new, %d total", count, len(migration_files))
    return count
