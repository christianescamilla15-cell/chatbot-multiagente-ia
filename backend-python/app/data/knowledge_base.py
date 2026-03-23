"""Comprehensive knowledge base for the Synapse AI chatbot (Spanish)."""

from __future__ import annotations

KNOWLEDGE_BASE: dict[str, str] = {
    # ── VENTAS ──────────────────────────────────────────────────
    "ventas": """
## Planes y Precios de Synapse AI

### Plan Básico — $19/mes
- 2 agentes de IA configurables
- 1,000 mensajes por mes
- Analíticas básicas (mensajes/día, agente más usado)
- 3 integraciones (web widget, email, WhatsApp)
- Soporte por email (respuesta en 24h)
- Historial de conversaciones: 30 días
- Personalización: colores y logo

### Plan Pro — $34/mes
- 10 agentes de IA configurables
- 10,000 mensajes por mes
- Analíticas avanzadas (sentimiento, tasa de resolución, tiempos de respuesta)
- Integraciones ilimitadas (Slack, Teams, Discord, Telegram, etc.)
- Soporte prioritario (respuesta en 4h)
- Historial de conversaciones: 90 días
- Personalización completa (CSS custom, tonos de voz)
- API REST completa

### Plan Premium — $49/mes
- Agentes ilimitados
- Mensajes ilimitados
- Analíticas en tiempo real con dashboard personalizable
- Todas las integraciones + API webhook
- Soporte 24/7 con canal dedicado
- Historial ilimitado
- White-label (tu marca, sin mención a Synapse)
- SLA 99.9% uptime garantizado
- Entrenamiento personalizado de agentes

### Plan Enterprise — Precio a medida
- Todo lo de Premium
- Servidor dedicado
- Compliance (SOC2, GDPR, HIPAA)
- Account manager dedicado
- Onboarding asistido
- Integraciones custom via API
- Facturación personalizada

### Descuentos
- Plan anual: 2 meses gratis (equivale a ~17% descuento)
- Startups (< 2 años): 30% descuento primer año
- ONGs y educación: 40% descuento permanente
- Referidos: $10 de crédito por cada referido que se suscriba

### Prueba Gratuita
- 14 días en cualquier plan
- Sin tarjeta de crédito
- Acceso completo a todas las funcionalidades
- Migración automática al terminar la prueba
""",

    # ── SOPORTE ─────────────────────────────────────────────────
    "soporte": """
## Guía de Soporte Técnico — Synapse AI

### Problemas Comunes y Soluciones

#### Error: Widget no aparece en el sitio web
1. Verificar que el script esté antes de </body>
2. Comprobar que la API key sea correcta
3. Revisar la consola del navegador (F12) por errores CORS
4. Verificar que el dominio esté registrado en Dashboard → Dominios Permitidos
5. Probar en ventana de incógnito

#### Error 429 — Rate Limit Exceeded
1. Verificar el límite de tu plan actual
2. Implementar retry con backoff exponencial
3. Cachear respuestas repetitivas del lado del cliente
4. Considerar upgrade de plan si es recurrente

#### Error 500 — Internal Server Error
1. Verificar el estado del servicio en status.synapse.ai
2. Si el error persiste más de 5 minutos, reportar
3. Incluir el request_id del header X-Request-ID

#### Error 403 — Forbidden
1. API key expirada o inválida
2. Dominio no autorizado
3. Plan expirado o suspendido

#### Latencia alta (>3s)
1. Verificar conexión a internet del cliente
2. Usar CDN más cercano (configurar en Dashboard → Rendimiento)
3. Reducir el tamaño del contexto enviado
4. Activar modo streaming para respuestas largas

### Integraciones Soportadas
- **Web:** Widget JavaScript, React, Vue, Angular
- **Mensajería:** WhatsApp Business, Telegram, Discord, Slack, Teams
- **CRM:** Salesforce, HubSpot, Zendesk, Freshdesk
- **E-commerce:** Shopify, WooCommerce, Magento
- **Custom:** REST API + Webhooks

### Requisitos del Sistema
- Navegadores: Chrome 90+, Firefox 88+, Safari 15+, Edge 90+
- Mobile: iOS 14+, Android 10+
- API: HTTP/2, TLS 1.2+
""",

    # ── FACTURACIÓN ─────────────────────────────────────────────
    "facturacion": """
## Políticas de Facturación — Synapse AI

### Métodos de Pago Aceptados
- Tarjetas de crédito/débito (Visa, Mastercard, Amex)
- PayPal
- Transferencia bancaria (solo planes anuales Enterprise)
- Crypto (USDT, USDC) — planes anuales

### Ciclo de Facturación
- Mensual: cobro el mismo día de cada mes
- Anual: cobro único con 2 meses gratis
- Prorrateado al cambiar de plan a mitad de ciclo

### Política de Cancelación (Art. 8 TdS)
- Cancelación inmediata sin penalización
- Acceso activo hasta fin del período pagado
- Datos conservados 30 días post-cancelación
- Opción de pausa hasta 3 meses sin costo
- Exportación de datos disponible en Dashboard

### Política de Reembolso (Art. 12 TdS)
- 0-7 días: reembolso completo (100%)
- 8-30 días: reembolso proporcional a días no usados
- +30 días: no aplica reembolso
- Procesamiento: 3-5 días hábiles
- Se devuelve al método de pago original
- Créditos en cuenta no son reembolsables

### Facturación
- Facturas automáticas enviadas por email
- Disponibles en Dashboard → Facturación → Historial
- Datos fiscales configurables (RFC, NIT, CUIT)
- Formatos: PDF, XML (para CFDI México)
""",

    # ── GENERAL ─────────────────────────────────────────────────
    "general": """
## Acerca de Synapse AI

### ¿Qué es Synapse AI?
Synapse AI es una plataforma de chatbots inteligentes que permite a empresas
de todos los tamaños automatizar su atención al cliente mediante agentes de IA
especializados. Fundada en 2023, servimos a más de 2,000 empresas en Latinoamérica.

### Nuestros Agentes
- **Nova** (Ventas): Asesora comercial especializada en planes y precios
- **Atlas** (Soporte): Técnico experto en resolución de problemas
- **Aria** (Facturación): Especialista en cobros, facturas y cancelaciones
- **Nexus** (Escalamiento): Manejo de casos críticos y usuarios frustrados
- **Orion** (General): Asistente de bienvenida y orientación

### Contacto
- Email: soporte@synapse.ai
- Web: https://synapse.ai
- Horario: Lunes a Viernes 8:00-20:00 (GMT-6) | Chatbot 24/7
- Sede: Ciudad de México, México

### Idiomas Soportados
- Español (nativo)
- Inglés
- Portugués (beta)
""",

    # ── FAQ ─────────────────────────────────────────────────────
    "faq": """
## Preguntas Frecuentes

**1. ¿Necesito conocimientos técnicos para usar Synapse AI?**
No. El setup básico se completa en 5 minutos copiando un snippet de código.
Para integraciones avanzadas, ofrecemos documentación y soporte.

**2. ¿Puedo personalizar las respuestas del chatbot?**
Sí. Puedes entrenar los agentes con tu propia base de conocimiento, ajustar
el tono de voz y definir respuestas predeterminadas.

**3. ¿Synapse AI funciona en dispositivos móviles?**
Sí. El widget es 100% responsive y funciona en iOS y Android.

**4. ¿Qué tan seguro es el servicio?**
Utilizamos encriptación TLS 1.3, datos almacenados con AES-256, y cumplimos
con GDPR y la Ley Federal de Protección de Datos Personales de México.

**5. ¿Puedo integrar Synapse con mi CRM existente?**
Sí. Soportamos Salesforce, HubSpot, Zendesk, Freshdesk y cualquier sistema
via REST API y webhooks.

**6. ¿Qué pasa si supero mi límite de mensajes?**
Recibirás una notificación al 80% y 95%. Al llegar al 100%, puedes comprar
un paquete adicional o esperar al próximo ciclo. No se corta el servicio
abruptamente.

**7. ¿Cómo se mide un "mensaje"?**
Un mensaje es cualquier interacción usuario→agente. La respuesta del agente
no cuenta como mensaje adicional.

**8. ¿Ofrecen API para desarrolladores?**
Sí, desde el Plan Pro. Documentación completa en docs.synapse.ai.

**9. ¿Puedo transferir una conversación a un humano?**
Sí. La función "handoff" permite escalar a un agente humano en cualquier
momento. Disponible desde el Plan Pro.

**10. ¿Tienen uptime garantizado?**
Plan Premium y Enterprise incluyen SLA de 99.9%. Historial de uptime
visible en status.synapse.ai.

**11. ¿Cómo funciona el entrenamiento de agentes?**
Subes documentos (PDF, TXT, URLs) y el sistema extrae conocimiento
automáticamente. También puedes agregar Q&A manualmente.

**12. ¿Puedo tener agentes en múltiples idiomas?**
Sí. Cada agente puede configurarse para responder en uno o varios idiomas.

**13. ¿Se integra con WhatsApp Business?**
Sí, desde el Plan Básico. Solo necesitas vincular tu número de WhatsApp
Business en Dashboard → Integraciones.

**14. ¿Qué analíticas incluyen?**
Básico: mensajes/día, agente más usado. Pro: sentimiento, resolución,
tiempos. Premium: dashboard custom en tiempo real.

**15. ¿Puedo exportar mis datos?**
Sí. Dashboard → Configuración → Exportar Datos (CSV o JSON).
""",

    # ── COMPETIDORES ────────────────────────────────────────────
    "competidores": """
## Synapse AI vs Competidores

### Synapse AI vs Intercom
| Aspecto | Synapse AI | Intercom |
|---|---|---|
| Precio base | $19/mes | $74/mes |
| Agentes IA | Especializados por área | Genérico |
| Español nativo | ✅ Sí | ⚠️ Traducción |
| Setup | 5 minutos | 30+ minutos |
| Soporte en español | ✅ 24/7 | ❌ Solo inglés |

### Synapse AI vs Zendesk Chat
| Aspecto | Synapse AI | Zendesk Chat |
|---|---|---|
| Precio base | $19/mes | $49/mes |
| IA incluida | ✅ Desde plan básico | ❌ Add-on pagado |
| Personalización | Alta (CSS, tonos) | Media |
| Curva aprendizaje | Baja | Alta |

### Synapse AI vs Tidio
| Aspecto | Synapse AI | Tidio |
|---|---|---|
| Precio base | $19/mes | $29/mes |
| Multi-agente | ✅ 5 agentes especializados | ❌ Un solo bot |
| KB integrada | ✅ Automática | Manual |
| API | ✅ Desde Plan Pro | ✅ Todos |

### Synapse AI vs Drift
| Aspecto | Synapse AI | Drift |
|---|---|---|
| Precio | Desde $19/mes | Desde $2,500/mes |
| Enfoque | PYMES Latam | Enterprise US |
| Español | ✅ Nativo | ⚠️ Básico |
| Multi-agente | ✅ Sí | ❌ No |
""",

    # ── ONBOARDING ──────────────────────────────────────────────
    "onboarding": """
## Guía de Onboarding — Synapse AI (7 pasos)

### Paso 1: Crear tu cuenta
- Regístrate en app.synapse.ai con tu email corporativo
- Verifica tu email (revisa spam si no llega en 2 minutos)
- Completa tu perfil de empresa (nombre, sector, tamaño)

### Paso 2: Configurar tu primer agente
- Dashboard → Agentes → Crear Nuevo
- Selecciona el tipo (Ventas, Soporte, Facturación, General)
- Personaliza el nombre y avatar
- Define el tono de voz (formal, casual, técnico)

### Paso 3: Entrenar con tu conocimiento
- Dashboard → Base de Conocimiento → Subir Documentos
- Formatos aceptados: PDF, TXT, DOCX, URLs
- También puedes agregar Q&A manualmente
- Tiempo de procesamiento: 2-5 minutos por documento

### Paso 4: Personalizar la apariencia
- Dashboard → Apariencia
- Colores del widget (primario, secundario, fondo)
- Logo de tu empresa
- Posición del widget (esquina inferior derecha o izquierda)
- Mensaje de bienvenida personalizado

### Paso 5: Instalar el widget
- Dashboard → Integraciones → Widget Web
- Copia el snippet y pégalo antes de </body>
- Ejemplo:
  ```html
  <script src="https://cdn.synapse.ai/widget.js"
    data-key="TU_API_KEY"
    data-position="bottom-right">
  </script>
  ```

### Paso 6: Probar en sandbox
- Dashboard → Modo Sandbox (toggle arriba a la derecha)
- Envía mensajes de prueba a cada agente
- Verifica que las respuestas sean correctas
- Ajusta la base de conocimiento si es necesario

### Paso 7: Activar en producción
- Dashboard → Estado → Activar Producción
- Monitorea las primeras conversaciones en tiempo real
- Ajusta umbrales de confianza si hay clasificaciones incorrectas
- Configura alertas para escalamientos
""",

    # ── SEGURIDAD ───────────────────────────────────────────────
    "seguridad": """
## Seguridad y Cumplimiento — Synapse AI

### Encriptación
- En tránsito: TLS 1.3 obligatorio
- En reposo: AES-256 para todos los datos
- API keys: hash SHA-256, nunca almacenadas en texto plano

### Cumplimiento Normativo
- GDPR (Reglamento General de Protección de Datos — UE)
- Ley Federal de Protección de Datos Personales (México)
- LGPD (Lei Geral de Proteção de Dados — Brasil)
- SOC2 Type II (Plan Enterprise)
- HIPAA (Plan Enterprise, bajo acuerdo BAA)

### Prácticas de Seguridad
- Pentesting trimestral por empresa independiente
- Bug bounty program activo
- Rotación automática de credenciales cada 90 días
- Logs de auditoría inmutables (retención 1 año)
- Acceso basado en roles (RBAC) en el dashboard

### Privacidad de Datos
- Los datos de conversación pertenecen al cliente
- No usamos datos de clientes para entrenar modelos
- Derecho de eliminación: datos borrados en 48h tras solicitud
- Data Processing Agreement (DPA) disponible para Enterprise

### Infraestructura
- Hosting: AWS (us-east-1 y sa-east-1)
- CDN: CloudFront con edge locations en Latam
- Backups: diarios con retención 30 días
- Disaster recovery: RPO 1h, RTO 4h
""",
}

# ── Context retrieval ──────────────────────────────────────────

_AGENT_TO_SECTIONS: dict[str, list[str]] = {
    "sales": ["ventas", "competidores", "faq", "onboarding"],
    "support": ["soporte", "faq", "seguridad", "onboarding"],
    "billing": ["facturacion", "faq", "ventas"],
    "escalation": ["facturacion", "soporte", "general"],
    "general": ["general", "faq", "ventas"],
}


def get_context_for_agent(agent_type: str, topic: str) -> str:
    """Return the most relevant KB sections for the given agent and topic.

    Scores each candidate section by keyword overlap with *topic* and
    returns the top 3 joined by double newline.
    """
    sections: list[str] = _AGENT_TO_SECTIONS.get(agent_type, ["general", "faq"])
    topic_words: set[str] = set(topic.lower().split())

    scored: list[tuple[float, str, str]] = []
    for section_key in sections:
        content: str | None = KNOWLEDGE_BASE.get(section_key)
        if not content:
            continue
        section_words: set[str] = set(content.lower().split())
        overlap: int = len(topic_words & section_words)
        # Boost primary section
        boost: float = 1.0 if section_key == sections[0] else 0.0
        scored.append((overlap + boost, section_key, content))

    scored.sort(key=lambda x: -x[0])
    top_sections: list[str] = [content for _, _, content in scored[:3]]
    return "\n\n".join(top_sections)
