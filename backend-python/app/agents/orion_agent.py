"""OrionAgent — General questions, regulations, FAQ, schedules."""

from app.agents.resident_base import ResidentAgent


class OrionAgent(ResidentAgent):
    name = "OrionAgent"
    role = "Información General"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres OrionAgent, el agente de información general de Residencial Las Palmas.

Tu especialidad:
- Reglamento del condominio
- Horarios de amenidades (alberca, gimnasio, salón de fiestas)
- Preguntas frecuentes
- Información de contacto
- Orientación a residentes nuevos
- Políticas generales
- Reservaciones de áreas comunes

Reglas:
- Responde siempre en español, tono amigable
- Usa la base de conocimiento para dar respuestas precisas
- Si la pregunta no está en el FAQ, intenta responder con sentido común
- Para temas de facturación, redirige a AriaAgent
- Para mantenimiento, redirige a AtlasAgent
- Para soporte técnico, redirige a NovaAgent

Datos clave:
- Administración: Lun-Vie 09:00-18:00, Sáb 09:00-13:00
- Seguridad: 24/7
- Alberca: Lun-Dom 07:00-21:00 (martes mantenimiento 06:00-09:00)
- Gimnasio: Lun-Sáb 06:00-22:00, Dom 07:00-20:00
- Salón de fiestas: reservar con 72h, depósito $2,000"""

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        msg = message.lower()
        name = resident["full_name"].split()[0] if resident else "vecino"

        if any(w in msg for w in ["alberca", "piscina", "nadar"]):
            return f"Hola {name}, la alberca está abierta:\n\n🏊 Lunes a Domingo: 07:00 - 21:00\n🔧 Mantenimiento: Martes 06:00 - 09:00\n\nRecuerda usar gorro de natación y respetar las reglas del área."
        elif any(w in msg for w in ["gimnasio", "gym"]):
            return f"{name}, el gimnasio tiene estos horarios:\n\n💪 Lunes a Sábado: 06:00 - 22:00\n🏋️ Domingo: 07:00 - 20:00\n\nRecuerda llevar toalla y limpiar el equipo después de usarlo."
        elif any(w in msg for w in ["salón", "fiesta", "evento", "reserv"]):
            return f"{name}, para reservar el salón de fiestas:\n\n1. Contacta administración con 72h de anticipación\n2. Depósito: $2,000 MXN\n3. Capacidad máxima: 50 personas\n4. Horario: hasta las 23:00\n\n¿Te gustaría hacer una reservación?"
        elif any(w in msg for w in ["reglamento", "reglas", "mascotas", "perro"]):
            return f"{name}, sobre mascotas en el condominio:\n\n🐕 Máximo 2 mascotas por unidad\n🦮 Deben usar correa en áreas comunes\n🧹 Los dueños deben recoger desechos\n🔇 Horario de silencio aplica también para mascotas"
        elif any(w in msg for w in ["hola", "buenos", "buenas"]):
            return f"¡Hola {name}! Bienvenido al sistema de soporte de Residencial Las Palmas. Soy OrionAgent y puedo ayudarte con:\n\n• Horarios de amenidades\n• Reglamento\n• Preguntas frecuentes\n• Información general\n\n¿En qué puedo ayudarte?"
        else:
            return f"Hola {name}, soy OrionAgent. Puedo ayudarte con horarios, reglamento y preguntas generales. ¿Qué necesitas saber?"
