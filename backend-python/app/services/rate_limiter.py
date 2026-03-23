"""In-memory sliding-window rate limiter."""

from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass, field

from app.config import settings


@dataclass
class _ClientWindow:
    """Tracks request timestamps for a single client."""

    timestamps: list[float] = field(default_factory=list)


@dataclass
class RateLimitResult:
    """Whether the request is allowed plus metadata."""

    allowed: bool
    remaining: int
    retry_after: float  # seconds until next slot opens (0 if allowed)


class RateLimiter:
    """Per-IP sliding-window rate limiter (in-memory)."""

    def __init__(self, max_per_minute: int | None = None) -> None:
        self.max_per_minute: int = max_per_minute or settings.RATE_LIMIT_PER_MINUTE
        self._clients: dict[str, _ClientWindow] = defaultdict(_ClientWindow)

    def check(self, client_id: str) -> RateLimitResult:
        """Check (and record) a request for *client_id*."""
        now: float = time.time()
        window_start: float = now - 60.0

        window = self._clients[client_id]

        # Prune old timestamps
        window.timestamps = [t for t in window.timestamps if t > window_start]

        if len(window.timestamps) >= self.max_per_minute:
            oldest: float = window.timestamps[0]
            retry_after: float = round(oldest + 60.0 - now, 2)
            return RateLimitResult(
                allowed=False,
                remaining=0,
                retry_after=max(retry_after, 0.01),
            )

        window.timestamps.append(now)
        remaining: int = self.max_per_minute - len(window.timestamps)
        return RateLimitResult(allowed=True, remaining=remaining, retry_after=0)
