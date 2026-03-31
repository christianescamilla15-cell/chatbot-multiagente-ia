"""AriaAgent — Billing, payments, receipts, debt inquiries. REQUIRES VERIFICATION."""

from app.agents.resident_base import ResidentAgent


class AriaAgent(ResidentAgent):
    name = "AriaAgent"
    role = "Facturación"
    requires_verification = True

    def _base_system_prompt(self) -> str:
        return """Eres AriaAgent, el agente de facturación de Residencial Las Palmas.

Tu especialidad:
- Consulta de saldos pendientes
- Emisión de recibos de pago
- Aclaración de cargos
- Estado de cuenta
- Historial de pagos
- Descuentos por pronto pago (5% antes del día 5)
- Información de recargos (3% mensual por mora)

REGLA CRÍTICA DE SEGURIDAD:
- SIEMPRE verifica que la sesión esté verificada antes de dar datos financieros
- Si la sesión NO está verificada, responde: "Para consultar información de facturación, necesito verificar tu identidad. Te enviaré un código por WhatsApp."
- NUNCA reveles datos de otros residentes
- NUNCA muestres saldos o pagos sin verificación

Datos de pago del condominio:
- Cuota mensual: $3,500.00 MXN
- Fecha límite: día 10 de cada mes
- Descuento pronto pago: 5% (antes del día 5)
- Recargo por mora: 3% mensual
- Cuenta BBVA CLABE: 012180001234567890
- Referencia: número de unidad + mes

Formato de respuesta:
- Siempre en español
- Incluye montos exactos cuando estén disponibles
- Indica fecha límite de pago
- Sugiere forma de pago más conveniente"""

    def demo_response(self, message: str, resident: dict | None = None) -> str:
        msg = message.lower()
        name = resident["full_name"].split()[0] if resident else "vecino"

        if any(w in msg for w in ["saldo", "adeudo", "debo", "pendiente"]):
            return f"{name}, tu saldo pendiente es:\n\n💰 Mantenimiento Abril 2026: $3,500.00 MXN\n📅 Fecha límite: 10 de abril\n⚡ Paga antes del 5 para 5% de descuento ($3,325.00)\n\nCuenta BBVA CLABE: 012180001234567890\nReferencia: {resident['unit_number'] if resident else 'A101'}-ABR2026"
        elif any(w in msg for w in ["recibo", "comprobante"]):
            return f"{name}, tu último recibo:\n\n📄 Recibo: REC-0001-202603\n💰 Monto: $3,500.00 MXN\n✅ Status: Pagado\n📅 Fecha: 05 de marzo 2026\n\n¿Necesitas que te envíe el PDF por email?"
        elif any(w in msg for w in ["estado de cuenta", "historial"]):
            return f"{name}, tu estado de cuenta:\n\nEnero 2026: ✅ Pagado\nFebrero 2026: ✅ Pagado\nMarzo 2026: ✅ Pagado\nAbril 2026: ⏳ Pendiente ($3,500.00)\n\nSaldo total pendiente: $3,500.00 MXN"
        else:
            return f"Hola {name}, soy AriaAgent de facturación. ¿En qué puedo ayudarte? Puedo consultar tu saldo, emitir recibos o aclarar cargos."
