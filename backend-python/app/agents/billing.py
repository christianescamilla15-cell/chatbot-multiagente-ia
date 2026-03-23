"""Billing agent — Aria."""

from __future__ import annotations

from app.agents.base import BaseAgent


class BillingAgent(BaseAgent):
    """Precise billing specialist that cites policies."""

    name: str = "Aria"
    role: str = "Facturación"

    few_shot_examples: list[dict[str, str]] = [
        {
            "user": "Quiero cancelar mi suscripcion",
            "assistant": (
                "Entiendo tu solicitud. Antes de procesar la cancelación, "
                "déjame informarte sobre nuestra política:\n\n"
                "**Política de Cancelación:**\n"
                "• Puedes cancelar en cualquier momento sin penalización.\n"
                "• El acceso se mantiene activo hasta el final del período facturado.\n"
                "• Los datos se conservan por **30 días** después de la cancelación.\n\n"
                "**Opciones disponibles:**\n"
                "1. **Pausar** la suscripción (hasta 3 meses, sin costo)\n"
                "2. **Cambiar** a un plan inferior\n"
                "3. **Cancelar** definitivamente\n\n"
                "¿Cuál opción prefieres? Si eliges cancelar, necesitaré tu "
                "confirmación por email registrado."
            ),
        },
        {
            "user": "Necesito un reembolso",
            "assistant": (
                "Revisemos tu caso para el reembolso.\n\n"
                "**Política de Reembolso de Synapse AI:**\n"
                "• Reembolso **completo** dentro de los primeros 7 días.\n"
                "• Reembolso **proporcional** entre los días 8 y 30.\n"
                "• Después de 30 días no aplica reembolso, según Art. 12 de nuestros "
                "Términos de Servicio.\n\n"
                "Para procesar tu solicitud necesito:\n"
                "1. Email de la cuenta\n"
                "2. Motivo del reembolso\n"
                "3. Número de factura (si lo tienes)\n\n"
                "¿Me proporcionas estos datos?"
            ),
        },
    ]

    def _base_system_prompt(self) -> str:
        return (
            "Eres Aria, especialista de facturación de Synapse AI. "
            "Tu estilo es preciso, transparente y orientado a políticas. "
            "Siempre:\n"
            "- Cita políticas específicas con referencias\n"
            "- Usa **negrita** para destacar puntos clave\n"
            "- Presenta opciones claras al usuario\n"
            "- Responde en español con tono profesional y empático\n"
            "- Solicita los datos necesarios para procesar solicitudes\n"
            "- Nunca compartas datos financieros sensibles en el chat"
        )

    def demo_response(self, message: str) -> str:
        msg_lower: str = message.lower()
        if any(w in msg_lower for w in ("cancelar", "cancel", "baja", "dar de baja")):
            return (
                "Entiendo tu solicitud de cancelación.\n\n"
                "**Según nuestra Política de Cancelación (Art. 8):**\n"
                "• Sin penalización en cualquier momento\n"
                "• Acceso activo hasta fin del período facturado\n"
                "• Datos conservados 30 días post-cancelación\n\n"
                "**Alternativas disponibles:**\n"
                "1. **Pausar** suscripción (hasta 3 meses sin costo)\n"
                "2. **Downgrade** a plan inferior\n"
                "3. **Cancelar** definitivamente\n\n"
                "¿Qué opción prefieres?"
            )
        if any(w in msg_lower for w in ("reembolso", "devolucion", "refund", "cobro")):
            return (
                "Revisemos tu caso de reembolso.\n\n"
                "**Política de Reembolso (Art. 12):**\n"
                "• **0-7 días:** Reembolso completo (100%)\n"
                "• **8-30 días:** Reembolso proporcional\n"
                "• **+30 días:** No aplica reembolso\n\n"
                "Para procesar necesito:\n"
                "1. Email de la cuenta\n"
                "2. Motivo del reembolso\n"
                "3. Número de factura\n\n"
                "El procesamiento toma **3-5 días hábiles**. ¿Me proporcionas los datos?"
            )
        if any(w in msg_lower for w in ("factura", "recibo", "invoice", "comprobante")):
            return (
                "Puedo ayudarte con tu facturación.\n\n"
                "**Acceso a facturas:**\n"
                "Dashboard → Facturación → Historial de Pagos\n\n"
                "Desde ahí puedes:\n"
                "• Descargar facturas en PDF\n"
                "• Actualizar datos fiscales (RFC/NIT)\n"
                "• Cambiar método de pago\n"
                "• Ver el próximo cobro programado\n\n"
                "¿Necesitas algo específico con tu facturación?"
            )
        return (
            "¡Hola! Soy **Aria**, especialista de facturación. 📋\n\n"
            "Puedo asistirte con:\n"
            "• Consultas sobre planes y precios\n"
            "• Cancelaciones y pausas de suscripción\n"
            "• Reembolsos y devoluciones\n"
            "• Facturas y comprobantes\n"
            "• Cambios de plan y métodos de pago\n\n"
            "¿En qué puedo ayudarte?"
        )
