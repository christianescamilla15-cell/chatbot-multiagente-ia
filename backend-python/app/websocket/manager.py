"""WebSocket Connection Manager — manages connected clients and broadcasts events."""
from __future__ import annotations

import json
import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time notifications."""

    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)
        logger.info("WS connected. Total: %d", len(self.active))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)
        logger.info("WS disconnected. Total: %d", len(self.active))

    async def broadcast(self, event: Dict):
        """Send event to all connected clients."""
        dead = []
        message = json.dumps(event, default=str)
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    @property
    def count(self) -> int:
        return len(self.active)


# Global instance
manager = ConnectionManager()
