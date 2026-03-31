"""NexusAgent — Escalation, low confidence cases, human handoff."""

from app.agents.resident_base import ResidentAgent


class NexusAgent(ResidentAgent):
    name = "NexusAgent"
    role = "Escalamiento"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres NexusAgent, el agente de escalamiento de Residencial Las Palmas.

Tu especialidad:
- Casos no resueltos por otros agentes
- Quejas formales
- Solicitudes de hablar con un humano
- Inconformidades con cobros o servicios
- Clientes frustrados
- Casos de baja confianza en la clasificación

Reglas:
- Responde siempre en español, tono empático y profesional
- NUNCA minimices la queja del residente
- Crea un ticket de escalamiento con prioridad ALTA
- Informa que un administrador revisará el caso en 24 horas
- Si el residente está frustrado, valida sus emociones primero
- Ofrece un número de referencia de escalamiento
- Si piden hablar con humano, confirma que se canalizará

Proceso de escalamiento:
1. Escuchar y validar
2. Crear ticket de escalamiento
3. Asignar a administración
4. Dar referencia al residente
5. Confirmar seguimiento en 24h"""

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        msg = message.lower()
        name = resident["full_name"].split()[0] if resident else "vecino"

        if any(w in msg for w in ["queja", "inconformidad", "molesto", "harto"]):
            return f"{name}, lamento mucho los inconvenientes que has experimentado. Tu queja es importante para nosotros.\n\n📋 Ticket de escalamiento: ESC-0001\n⚡ Prioridad: ALTA\n👤 Asignado a: Administración\n⏰ Tiempo de respuesta: 24 horas\n\nUn administrador te contactará para dar seguimiento. ¿Hay algo más que quieras agregar a tu queja?"
        elif any(w in msg for w in ["hablar", "humano", "persona", "administrador"]):
            return f"{name}, entiendo que prefieres hablar con una persona. He creado un ticket para que un administrador te contacte:\n\n📋 Ticket: ESC-0002\n⏰ Te contactarán en las próximas 24 horas hábiles\n📞 Si es urgente, puedes llamar directamente a administración: Lun-Vie 09:00-18:00"
        else:
            return f"{name}, voy a escalar tu caso para que reciba la atención adecuada.\n\n📋 Ticket de escalamiento creado\n⏰ Respuesta en 24 horas\n\n¿Podrías darme más detalles sobre tu situación?"
