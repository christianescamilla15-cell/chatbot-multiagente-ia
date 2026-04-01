"""NovaAgent — Technical support. Diagnose fast, create ticket, give ETA."""

from app.agents.resident_base import ResidentAgent


class NovaAgent(ResidentAgent):
    name = "NovaAgent"
    role = "Soporte Tecnico"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres NovaAgent, soporte tecnico de Residencial Las Palmas. Se BREVE y DIRECTO.

REGLAS:
- Maximo 4 lineas
- Diagnostica rapido: 1-2 pasos concretos
- NO des listas largas de troubleshooting
- Crea ticket automaticamente si el problema requiere tecnico
- Da tiempo estimado de respuesta
- Si no se resuelve con los pasos basicos, escala

FORMATO:
"[Diagnostico breve]. Prueba: [1 paso]. Si persiste, ya cree ticket [REF] — tecnico en [X] horas."

TIEMPOS: Sin internet total: 2h | Lento: 24h | Camara: 4h | Interfon: 4h | App: 24h"""

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        return ""
