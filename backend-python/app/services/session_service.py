"""Redis-backed session manager for conversation context."""

from __future__ import annotations

import json
from typing import Any

from redis.asyncio import Redis


class SessionService:
    """Manage per-session conversation history in Redis."""

    SESSION_TTL: int = 1800  # 30 minutes
    MAX_MESSAGES: int = 50

    def __init__(self, redis_client: Redis) -> None:
        self.redis: Redis = redis_client

    # ── context ─────────────────────────────────────────────────

    async def get_context(self, session_id: str) -> list[dict[str, Any]]:
        """Return the last 20 messages for a session."""
        key: str = f"session:{session_id}:messages"
        raw: list[bytes] = await self.redis.lrange(key, -20, -1)
        return [json.loads(item) for item in raw]

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        agent: str | None = None,
    ) -> None:
        """Append a message to the session, enforce max length and TTL."""
        key: str = f"session:{session_id}:messages"
        entry: dict[str, Any] = {"role": role, "content": content}
        if agent:
            entry["agent"] = agent

        await self.redis.rpush(key, json.dumps(entry))
        await self.redis.ltrim(key, -self.MAX_MESSAGES, -1)
        await self.redis.expire(key, self.SESSION_TTL)

        # Track session in the set of active sessions
        await self.redis.sadd("active_sessions", session_id)
        await self.redis.expire("active_sessions", self.SESSION_TTL)

    # ── stats ───────────────────────────────────────────────────

    async def get_session_count(self) -> int:
        """Count currently active sessions."""
        return await self.redis.scard("active_sessions")

    async def add_rating(
        self, session_id: str, message_index: int, rating: int
    ) -> None:
        """Store a user rating for a specific message."""
        key: str = f"session:{session_id}:ratings"
        await self.redis.hset(key, str(message_index), str(rating))
        await self.redis.expire(key, self.SESSION_TTL)

        # Aggregate counters
        if rating == 1:
            await self.redis.incr("stats:thumbs_up")
        elif rating == -1:
            await self.redis.incr("stats:thumbs_down")

    async def increment_agent_counter(self, agent_name: str) -> None:
        """Increment the message counter for a given agent."""
        await self.redis.incr(f"stats:agent:{agent_name}")
        await self.redis.incr("stats:total_messages")

    async def get_stats(self) -> dict[str, Any]:
        """Aggregate stats across all sessions."""
        total_raw = await self.redis.get("stats:total_messages")
        total: int = int(total_raw) if total_raw else 0

        agent_names: list[str] = ["Nova", "Atlas", "Aria", "Nexus", "Orion"]
        by_agent: dict[str, int] = {}
        for name in agent_names:
            val = await self.redis.get(f"stats:agent:{name}")
            by_agent[name] = int(val) if val else 0

        thumbs_up_raw = await self.redis.get("stats:thumbs_up")
        thumbs_down_raw = await self.redis.get("stats:thumbs_down")

        satisfaction: dict[str, int] = {
            "thumbs_up": int(thumbs_up_raw) if thumbs_up_raw else 0,
            "thumbs_down": int(thumbs_down_raw) if thumbs_down_raw else 0,
        }

        return {
            "total_messages": total,
            "by_agent": by_agent,
            "satisfaction": satisfaction,
        }
