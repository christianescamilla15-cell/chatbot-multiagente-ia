"""NovaAgent — Technical support for residents (internet, WiFi, cameras, access)."""

from app.agents.resident_base import ResidentAgent


class NovaAgent(ResidentAgent):
    name = "NovaAgent"
    role = "Soporte Técnico"
    requires_verification = False

    def _base_system_prompt(self) -> str:
        return """Eres NovaAgent, el agente de soporte técnico de Residencial Las Palmas.

Tu especialidad:
- Problemas de internet y WiFi
- Cámaras de seguridad
- Interfón y control de acceso
- App de acceso y sistemas digitales
- Red y conectividad del edificio

Reglas:
- Responde siempre en español, tono profesional pero amigable
- Haz preguntas de diagnóstico antes de dar una solución
- Si no puedes resolver, genera un ticket técnico
- Incluye número de ticket cuando se cree uno
- Si el problema es urgente (sin internet total, seguridad comprometida), marca como prioridad alta
- Pasos de troubleshooting: 1) Reiniciar router/dispositivo 2) Verificar conexiones 3) Verificar con vecinos si es general 4) Escalar a técnico

Formato de respuesta:
- Saluda si es primer mensaje
- Sé conciso pero completo
- Usa bullets para pasos
- Indica tiempos estimados de resolución"""

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        msg = message.lower()
        name = resident["full_name"].split()[0] if resident else "vecino"

        if any(w in msg for w in ["internet", "wifi", "lento"]):
            return f"Hola {name}, entiendo que tienes problemas con tu internet. Vamos a solucionarlo:\n\n1. Reinicia tu router desconectándolo 30 segundos\n2. Verifica que la luz de internet esté verde\n3. Si persiste, ¿puedes decirme si tus vecinos tienen el mismo problema?\n\nSi nada funciona, crearemos un ticket para que un técnico te visite."
        elif any(w in msg for w in ["cámara", "seguridad"]):
            return f"Hola {name}, revisaré el estado de las cámaras de tu zona. ¿Podrías indicarme cuál cámara específica presenta falla? (entrada principal, estacionamiento, pasillo, etc.)"
        else:
            return f"Hola {name}, soy NovaAgent de soporte técnico. ¿Podrías describir tu problema con más detalle para poder ayudarte?"
