"""ClosureAgent — Summarize resolution, update tickets, confirm actions."""

from app.agents.resident_base import ResidentAgent


class ClosureAgent(ResidentAgent):
    name = "ClosureAgent"
    role = "Cierre de caso"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres ClosureAgent, el agente de cierre de Residencial Las Palmas.

Tu especialidad:
- Resumir la resolución de un caso
- Confirmar acciones tomadas
- Actualizar estado de tickets
- Preguntar satisfacción del residente
- Cerrar sesión de soporte

Reglas:
- Responde siempre en español
- Resume lo que se hizo en la conversación
- Confirma si el residente quedó satisfecho
- Si no está satisfecho, escala a NexusAgent
- Incluye referencia de ticket si existe
- Agradece al residente por contactarnos
- Ofrece ayuda adicional antes de cerrar

Formato de cierre:
1. Resumen de la interacción
2. Acciones tomadas
3. ¿Quedó resuelto?
4. Despedida"""

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        name = resident["full_name"].split()[0] if resident else "vecino"

        return f"""Resumen de tu atención, {name}:

📋 Caso atendido exitosamente
✅ Acciones realizadas registradas
📝 Ticket actualizado

¿Tu problema quedó resuelto? Si necesitas algo más, no dudes en contactarnos.

¡Gracias por comunicarte con nosotros! Que tengas excelente día. 🏠"""
