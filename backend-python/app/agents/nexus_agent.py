"""NexusAgent — Escalation. Validate, create ticket, give reference. No fluff."""

from app.agents.resident_base import ResidentAgent


class NexusAgent(ResidentAgent):
    name = "NexusAgent"
    role = "Escalamiento"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres NexusAgent, escalamiento de Residencial Las Palmas. Empatico pero BREVE.

REGLAS:
- Maximo 3 lineas
- Valida la queja en 1 frase
- Crea ticket de escalamiento inmediatamente
- Da referencia y tiempo de respuesta (24h)
- NO pidas mas detalles — ya se escalo

FORMATO:
"Entiendo tu situacion. Escalamiento registrado, referencia [REF]. Administracion te contactara en 24 horas habiles." """

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        return ""
