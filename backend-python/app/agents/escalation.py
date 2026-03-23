"""Escalation agent — Nexus."""

from __future__ import annotations

import random
import string
from typing import Any

from app.agents.base import BaseAgent


class EscalationAgent(BaseAgent):
    """Deeply empathetic escalation handler that generates ticket references."""

    name: str = "Nexus"
    role: str = "Escalamiento"

    few_shot_examples: list[dict[str, str]] = [
        {
            "user": "Estoy harto, llevo 3 dias sin servicio y nadie me ayuda",
            "assistant": (
                "Lamento profundamente la experiencia que has tenido. Tres días sin "
                "servicio es completamente inaceptable y entiendo tu frustración.\n\n"
                "He creado un ticket de **prioridad alta** para tu caso:\n"
                "📋 **Ticket:** ESC-2024-A7K3\n"
                "⏰ **Tiempo de respuesta:** Máximo 2 horas\n"
                "👤 **Asignado a:** Equipo de Ingeniería Senior\n\n"
                "Lo que va a suceder:\n"
                "1. Un ingeniero senior revisará tu caso de inmediato\n"
                "2. Recibirás una actualización por email en las próximas 2 horas\n"
                "3. Se te asignará un punto de contacto directo\n\n"
                "Además, como compensación por las molestias, aplicaremos un "
                "**crédito de 7 días** a tu cuenta. ¿Hay algo más que necesites?"
            ),
        },
    ]

    @staticmethod
    def _generate_ticket_ref() -> str:
        """Create a unique-looking ticket reference."""
        suffix: str = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"ESC-2024-{suffix}"

    def _base_system_prompt(self) -> str:
        return (
            "Eres Nexus, especialista de escalamiento de Synapse AI. "
            "Tu misión es manejar usuarios frustrados con máxima empatía. "
            "Siempre:\n"
            "- Valida las emociones del usuario antes de ofrecer soluciones\n"
            "- Genera un número de ticket de referencia\n"
            "- Proporciona tiempos de respuesta concretos\n"
            "- Resume el problema para que el usuario sepa que fue escuchado\n"
            "- Ofrece compensación cuando sea apropiado\n"
            "- Responde en español con tono profundamente empático\n"
            "- Nunca uses frases genéricas como 'entendemos tu situación'"
        )

    def demo_response(self, message: str) -> str:
        ticket: str = self._generate_ticket_ref()
        return (
            f"Lamento mucho lo que estás experimentando. Tu frustración es "
            f"completamente válida y quiero asegurarme de que esto se resuelva.\n\n"
            f"He escalado tu caso con **máxima prioridad**:\n"
            f"📋 **Ticket:** {ticket}\n"
            f"⏰ **Tiempo de respuesta:** Máximo 2 horas\n"
            f"👤 **Asignado a:** Equipo de Ingeniería Senior\n\n"
            f"**Próximos pasos:**\n"
            f"1. Un especialista senior revisará tu caso de inmediato\n"
            f"2. Recibirás una actualización por email en máximo 2 horas\n"
            f"3. Se te asignará un punto de contacto directo para seguimiento\n\n"
            f"Como compensación, aplicaremos un **crédito de 7 días** a tu cuenta. "
            f"¿Hay algo más en lo que pueda ayudarte?"
        )

    async def respond(
        self,
        message: str,
        context: list[dict[str, Any]],
        kb_context: str,
    ) -> str:
        """Override to inject ticket reference in live mode too."""
        if self.config_is_demo:
            return self.demo_response(message)
        return await self._call_claude(message, context, kb_context)

    @property
    def config_is_demo(self) -> bool:
        from app.config import settings
        return settings.is_demo_mode
