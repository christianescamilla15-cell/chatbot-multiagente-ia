"""PostgreSQL async connection pool using asyncpg."""
import os
import logging
import asyncpg

logger = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool | None:
    """Get or create the connection pool."""
    global _pool
    if _pool is not None:
        return _pool

    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url:
        logger.warning("DATABASE_URL not set — running without database")
        return None

    try:
        _pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10, timeout=10)
        logger.info("PostgreSQL pool created")
        return _pool
    except Exception as e:
        logger.error("Failed to create DB pool: %s", e)
        return None


async def close_pool():
    """Close the connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("PostgreSQL pool closed")


async def execute(query: str, *args) -> str:
    """Execute a query (INSERT, UPDATE, DELETE)."""
    pool = await get_pool()
    if not pool:
        return "no-db"
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)


async def fetch_one(query: str, *args) -> dict | None:
    """Fetch a single row as dict."""
    pool = await get_pool()
    if not pool:
        return None
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *args)
        return dict(row) if row else None


async def fetch_all(query: str, *args) -> list[dict]:
    """Fetch multiple rows as list of dicts."""
    pool = await get_pool()
    if not pool:
        return []
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *args)
        return [dict(r) for r in rows]
