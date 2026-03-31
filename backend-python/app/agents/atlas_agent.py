"""AtlasAgent — Maintenance issues, service tickets, urgency classification."""

from app.agents.resident_base import ResidentAgent


class AtlasAgent(ResidentAgent):
    name = "AtlasAgent"
    role = "Mantenimiento"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres AtlasAgent, el agente de mantenimiento de Residencial Las Palmas.

Tu especialidad:
- Fugas de agua
- Problemas con elevador
- Luces fundidas en áreas comunes
- Puertas y accesos dañados
- Filtración en techos
- Pintura y fachadas
- Tuberías tapadas
- Alarmas contra incendios

Reglas:
- Responde siempre en español
- Clasifica la urgencia: baja, media, alta, urgente
- Fugas de agua y elevador fuera de servicio = URGENTE
- Luces fundidas = BAJA
- Crea ticket automáticamente para cada reporte
- Pregunta ubicación exacta (edificio, piso, unidad, área común)
- Indica tiempo estimado de respuesta según urgencia:
  - Urgente: 2 horas
  - Alta: 4 horas
  - Media: 24 horas
  - Baja: 72 horas

Formato de ticket:
- Ticket: TKT-XXXX
- Categoría: mantenimiento
- Prioridad: [urgente/alta/media/baja]
- Descripción: [resumen del problema]
- Tiempo estimado: [X horas]"""

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        msg = message.lower()
        name = resident["full_name"].split()[0] if resident else "vecino"
        unit = resident["unit_number"] if resident else "tu unidad"

        if any(w in msg for w in ["fuga", "agua", "gotea"]):
            return f"⚠️ {name}, entiendo que hay una fuga de agua. Esto es URGENTE.\n\nTicket creado: TKT-0201\n- Prioridad: URGENTE\n- Ubicación: {unit}\n- Tiempo de respuesta: máximo 2 horas\n\nUn técnico de plomería te contactará pronto. ¿Puedes cerrar la llave de paso mientras tanto?"
        elif any(w in msg for w in ["elevador", "ascensor"]):
            return f"{name}, reportaré el problema del elevador.\n\nTicket creado: TKT-0202\n- Prioridad: ALTA\n- Tiempo de respuesta: 4 horas\n\n¿Hay personas atrapadas en el elevador? Si es así, llamaré a emergencias de inmediato."
        elif any(w in msg for w in ["luz", "foco", "iluminación"]):
            return f"{name}, registraré el reporte de iluminación.\n\nTicket creado: TKT-0203\n- Prioridad: BAJA\n- Tiempo de respuesta: 72 horas\n\n¿Podrías indicarme la ubicación exacta? (pasillo, escalera, estacionamiento, etc.)"
        else:
            return f"Hola {name}, soy AtlasAgent de mantenimiento. ¿Podrías describir el problema y la ubicación exacta para crear un ticket?"
