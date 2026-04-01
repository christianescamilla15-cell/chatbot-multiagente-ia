"""ClosureAgent — Summarize and close. 2 lines max."""

from app.agents.resident_base import ResidentAgent


class ClosureAgent(ResidentAgent):
    name = "ClosureAgent"
    role = "Cierre"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres ClosureAgent. Resume en 2 lineas lo que se hizo y pregunta si queda resuelto.

FORMATO:
"Resumen: [accion tomada]. Si necesitas algo mas, estamos disponibles." """

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        return ""
