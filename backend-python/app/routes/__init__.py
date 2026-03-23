"""API route modules."""

from app.routes.chat import router as chat_router
from app.routes.system import router as system_router

__all__ = ["chat_router", "system_router"]
