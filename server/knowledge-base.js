// Base de conocimiento — en producción esto vendría de Notion API

export const KNOWLEDGE_BASE = {
  ventas: `## Planes y Precios

### Plan Básico — $99/mes
- Hasta 3 usuarios
- Funciones esenciales del producto
- Soporte por email (respuesta en 48h)
- 5GB de almacenamiento
- Reportes básicos
- 1 chatbot IA configurado
- Widget web personalizable

### Plan Pro — $199/mes
- Hasta 10 usuarios
- Todas las funciones + integraciones avanzadas
- Soporte prioritario (respuesta en 24h)
- 50GB de almacenamiento
- Reportes avanzados + exportación
- Acceso a API
- Chatbots ilimitados
- Analítica de conversaciones
- Reglas de enrutamiento personalizadas
- Webhooks y automatizaciones

### Plan Enterprise — Precio personalizado
- Usuarios ilimitados
- SLA garantizado (99.9% uptime)
- Onboarding dedicado (2 sesiones incluidas)
- Soporte directo 4h (línea privada)
- Almacenamiento ilimitado
- Seguridad avanzada + SSO
- Account manager dedicado
- Integraciones custom bajo demanda
- Ambiente aislado (single-tenant) disponible
- SLA de respuesta: 1 hora en horario laboral, 4 horas fuera de horario

### Beneficios Generales
- Prueba gratuita: 14 días en cualquier plan, sin tarjeta de crédito
- Descuento del 20% en pago anual
- Demo personalizada para equipos 5+ personas
- Migración gratuita desde otros sistemas (Plan Pro y Enterprise)
- Cancelación en cualquier momento, sin penalización
- Uptime garantizado del 99.7% (histórico)

### Comparativa Rápida
| Característica        | Básico  | Pro      | Enterprise |
|-----------------------|---------|----------|------------|
| Usuarios              | 3       | 10       | Ilimitados |
| Chatbots IA           | 1       | Ilimitados | Ilimitados |
| Integraciones         | Básicas | Todas    | Custom     |
| API Access            | No      | Sí       | Sí         |
| SLA                   | No      | 99.5%    | 99.9%      |
| Soporte               | Email   | Prioritario | Dedicado |
| Almacenamiento        | 5GB     | 50GB     | Ilimitado  |
| SSO/SAML              | No      | No       | Sí         |
| Onboarding dedicado   | No      | No       | Sí         |`,

  soporte: `## Soporte Técnico

### Horarios de Atención
- Lunes a Viernes: 9:00am – 7:00pm (CDMX, UTC-6)
- Sábados: 10:00am – 2:00pm (solo Plan Pro y Enterprise)

### Tiempos de Respuesta por Plan
- Plan Básico: 48 horas hábiles
- Plan Pro: 24 horas hábiles
- Plan Enterprise: 4 horas

### Canales de Soporte
- Chat en plataforma (todos los planes)
- Email: soporte@empresa.com
- Línea directa Enterprise: disponible en panel de control

### Problemas Frecuentes
- No puedo iniciar sesión: Login > ¿Olvidaste tu contraseña? > Revisar spam
- Integración no funciona: Verificar Plan Pro+, revocar y re-autorizar, ver docs.empresa.com
- Error al exportar: Verificar < 100MB, exportar en lotes. Formatos: CSV, Excel, JSON, PDF
- Chatbot no responde: Verificar que esté activado en Panel > Chatbots > Estado
- Widget no aparece: Verificar snippet JS en el <head>, comprobar dominio permitido
- Notificaciones no llegan: Verificar permisos del navegador y filtros de spam

### Documentación
- Guías: docs.empresa.com
- Videos: docs.empresa.com/videos
- API: docs.empresa.com/api
- Status: status.empresa.com

### Troubleshooting — Árboles de Decisión

#### Chatbot no responde
1. ¿El chatbot está activo? → Panel > Chatbots > Verificar estado "Activo"
2. ¿Tiene créditos/mensajes disponibles? → Panel > Uso > Verificar cuota
3. ¿La API key de IA está configurada? → Panel > Configuración > IA > Verificar key
4. Si todo está bien → Limpiar caché, recargar, o contactar soporte

#### Widget no carga en sitio web
1. ¿El snippet está en el <head>? → Verificar código fuente de la página
2. ¿El dominio está en la lista permitida? → Panel > Widget > Dominios
3. ¿Hay errores en consola? → F12 > Console > buscar errores de empresa.com
4. ¿Hay bloqueador de anuncios? → Desactivar temporalmente y probar

#### Integración falla al conectar
1. ¿El plan soporta integraciones? → Solo Pro y Enterprise
2. ¿Los permisos/scopes son correctos? → Revocar y reconectar
3. ¿El token expiró? → Regenerar token en la app tercera
4. ¿Es un problema de red/firewall? → Verificar que el dominio no esté bloqueado

#### Reportes muestran datos incorrectos
1. ¿El rango de fechas es correcto? → Verificar filtros de fecha
2. ¿Hay filtros aplicados? → Limpiar todos los filtros
3. ¿Los datos se sincronizaron? → Esperar 15 min después de cambios
4. Si persiste → Exportar reporte y enviar a soporte para auditoría`,

  facturacion: `## Facturación y Pagos

### Métodos de Pago
- Tarjetas: Visa, Mastercard, American Express
- Transferencia bancaria (solo planes anuales o Enterprise)
- OXXO (solo México, pago mensual)
- SPEI (solo México, planes anuales)
- PayPal (todos los planes)

### Ciclos de Facturación
- Mensual: cobro automático el día 1 de cada mes
- Anual: un solo cobro con 20% de descuento
- Facturas automáticas al correo registrado en formato PDF
- CFDI disponible para clientes en México (RFC requerido)

### Cambiar Método de Pago
Configuración > Facturación > Método de pago > Agregar nueva tarjeta

### Cancelación
- Configuración > Suscripción > Cancelar plan
- Acceso continúa hasta fin del período pagado
- Sin penalización
- Datos conservados 30 días después de cancelar
- Exportación de datos disponible hasta el último día del período

### Reembolsos
- Primeros 30 días: reembolso completo
- Después de 30 días: no se procesan reembolsos parciales
- Solicitar a: facturacion@empresa.com
- Procesamiento: 5-7 días hábiles
- Cobros duplicados: reembolso inmediato al detectarse

### Prorrateo y Cambios de Plan
- Upgrade (Básico → Pro): se cobra la diferencia proporcional al día del cambio
- Upgrade (Pro → Enterprise): contactar ventas para cotización personalizada
- Downgrade (Pro → Básico): el cambio aplica al siguiente ciclo de facturación
- Downgrade (Enterprise → Pro): contactar account manager, aplica al siguiente ciclo
- No hay cargos por cambio de plan

### Impuestos y Moneda
- Precios publicados no incluyen IVA/impuestos locales
- IVA 16% se agrega automáticamente para México
- Moneda base: USD. Se acepta MXN con tipo de cambio del día
- Para facturación en EUR o GBP: contactar facturacion@empresa.com
- Tax ID/RFC se puede agregar en Panel > Configuración > Datos fiscales

### Cobros Fallidos
- Primer intento fallido: notificación por email + reintento en 3 días
- Segundo intento fallido: notificación urgente + reintento en 3 días
- Tercer intento fallido: cuenta suspendida, acceso de solo lectura
- Después de 15 días sin pago: cuenta desactivada (datos se conservan 30 días)
- Para reactivar: actualizar método de pago y contactar facturacion@empresa.com`,

  general: `## Información General

### Contacto
- Soporte: soporte@empresa.com
- Facturación: facturacion@empresa.com
- Ventas: ventas@empresa.com
- Teléfono: +52 55 1234 5678 (9am–7pm CDMX)
- WhatsApp: +52 55 9876 5432

### Integraciones (+50 disponibles, desde Plan Pro)
- CRM: HubSpot, Salesforce, Pipedrive
- Productividad: Notion, Monday.com, Asana, Trello
- Comunicación: Slack, Microsoft Teams, Discord
- Automatización: Zapier, Make.com, n8n
- Almacenamiento: Google Drive, Dropbox, OneDrive
- E-commerce: Shopify, WooCommerce, Stripe
- Helpdesk: Zendesk (migración), Freshdesk (migración)

### Seguridad
- Cifrado AES-256 en reposo y TLS 1.3 en tránsito
- Servidores en México y EU (AWS)
- 2FA disponible en todos los planes
- Backups automáticos diarios con retención de 30 días
- Uptime histórico: 99.7%
- Pen testing anual por firma externa
- Logs de auditoría disponibles (Plan Enterprise)`,

  // ─── NEW SECTIONS ───────────────────────────────────────────

  faq: `## Preguntas Frecuentes (FAQ)

### Cuenta y Acceso
**P: ¿Cómo creo una cuenta?**
R: Ve a empresa.com/signup, ingresa tu email corporativo y sigue los pasos. No necesitas tarjeta para la prueba de 14 días.

**P: ¿Puedo tener múltiples organizaciones con un email?**
R: Sí, puedes pertenecer a múltiples organizaciones. Cambia entre ellas desde el menú superior derecho.

**P: Olvidé mi contraseña, ¿qué hago?**
R: En la pantalla de login, haz clic en "¿Olvidaste tu contraseña?". Recibirás un email en 2-5 minutos. Revisa spam si no llega.

**P: ¿Puedo cambiar mi email de cuenta?**
R: Sí, desde Panel > Configuración > Perfil > Email. Se requiere verificación del nuevo email.

**P: ¿Cómo activo 2FA?**
R: Panel > Configuración > Seguridad > Autenticación de dos factores. Compatible con Google Authenticator, Authy y 1Password.

### Producto y Funcionalidad
**P: ¿Cuántos chatbots puedo crear?**
R: Básico: 1, Pro: ilimitados, Enterprise: ilimitados + personalizaciones avanzadas.

**P: ¿En qué idiomas funciona el chatbot?**
R: Soportamos español, inglés, portugués, francés y alemán. Detección automática de idioma incluida.

**P: ¿Puedo personalizar la apariencia del widget?**
R: Sí, colores, logo, posición, mensaje de bienvenida y comportamiento son configurables desde Panel > Widget > Diseño.

**P: ¿Hay límite de mensajes mensuales?**
R: Básico: 1,000 mensajes/mes. Pro: 10,000 mensajes/mes. Enterprise: ilimitados. Mensajes adicionales: $0.02 c/u.

**P: ¿Puedo exportar mis conversaciones?**
R: Sí, desde Panel > Conversaciones > Exportar. Formatos: CSV, JSON, PDF. Límite de 100MB por exportación.

**P: ¿El chatbot aprende de las conversaciones?**
R: No automáticamente. Puedes entrenar el chatbot manualmente agregando FAQs y documentos a la base de conocimiento.

**P: ¿Puedo usar mi propia API key de OpenAI/Claude?**
R: Sí, en Plan Pro y Enterprise. Panel > Configuración > IA > Clave API personalizada.

### Integraciones
**P: ¿Cómo conecto Slack?**
R: Panel > Integraciones > Slack > Autorizar. Necesitas ser admin del workspace de Slack.

**P: ¿Las integraciones tienen costo adicional?**
R: No, todas las integraciones están incluidas en Plan Pro y Enterprise sin costo extra.

**P: ¿Puedo recibir notificaciones en Teams?**
R: Sí, con la integración de Microsoft Teams. Se requiere permisos de administrador en tu tenant de Microsoft 365.

### Seguridad y Privacidad
**P: ¿Dónde se almacenan mis datos?**
R: En servidores AWS en México (us-east-1) y EU (eu-west-1). Puedes elegir región en Plan Enterprise.

**P: ¿Cumplen con GDPR?**
R: Sí, somos GDPR compliant. Ofrecemos DPA (Data Processing Agreement) firmado para clientes que lo requieran.

**P: ¿Puedo eliminar todos mis datos?**
R: Sí, tienes derecho al olvido. Solicita la eliminación en Panel > Configuración > Privacidad > Eliminar datos, o escríbenos a privacidad@empresa.com.

**P: ¿Tienen certificaciones de seguridad?**
R: SOC 2 Type II (auditado anualmente), ISO 27001 (en proceso), GDPR compliant.

### Facturación
**P: ¿Puedo cambiar de plan en cualquier momento?**
R: Sí, upgrades son inmediatos con prorrateo. Downgrades aplican al siguiente ciclo.

**P: ¿Hay descuentos para startups o ONGs?**
R: Sí, ofrecemos 50% de descuento para startups en etapa temprana y ONGs verificadas. Aplica en ventas@empresa.com.

**P: ¿Qué pasa si excedo mi límite de mensajes?**
R: Recibes una notificación al 80% y al 100%. Los mensajes adicionales se cobran a $0.02 c/u. Puedes configurar un límite duro para evitar sobrecargos.

**P: ¿Ofrecen facturación en MXN?**
R: Sí, facturamos en MXN con CFDI. Configura tu RFC en Panel > Configuración > Datos fiscales.`,

  competidores: `## Comparativa con Competidores

### Nova vs Zendesk
| Aspecto | Nova | Zendesk |
|---------|------|---------|
| Precio inicial | $99/mes | $49/agente/mes (se multiplica rápido) |
| IA nativa | Sí, Claude/GPT integrado | Add-on de IA ($50/agente extra) |
| Configuración | 15 minutos | 2-4 semanas típico |
| Español nativo | Sí, primera clase | Traducción, no nativo |
| Chatbot builder | Visual, drag & drop | Advanced AI add-on requerido |
| Mejor para | LATAM, equipos pequeños-medianos | Empresas grandes globales |
| Migración | Importador automático desde Zendesk | N/A |

### Nova vs Intercom
| Aspecto | Nova | Intercom |
|---------|------|----------|
| Precio inicial | $99/mes flat | $74/mes + $0.99/resolución |
| Modelo de precio | Predecible, por plan | Variable, por uso |
| IA conversacional | Incluida en todos los planes | Fin AI ($0.99/resolución) |
| Onboarding tools | Enterprise incluido | Product tours ($199/mes extra) |
| Ideal para | Soporte + ventas integrado | SaaS con alto volumen |

### Nova vs Freshdesk
| Aspecto | Nova | Freshdesk |
|---------|------|-----------|
| Precio inicial | $99/mes | Gratis (limitado) / $15/agente |
| IA avanzada | Sí, nativamente | Freddy AI (planes altos) |
| UX/Interfaz | Moderna, minimalista | Funcional pero dated |
| Integraciones LATAM | WhatsApp, OXXO, SPEI | Limitadas en LATAM |
| Soporte en español | Nativo, equipo local | Traducido, equipo global |

### Nova vs Drift
| Aspecto | Nova | Drift |
|---------|------|-------|
| Enfoque | Soporte + ventas | Ventas conversacionales |
| Precio | Desde $99/mes | Desde $2,500/mes |
| Chatbot IA | General purpose | Enfocado en revenue |
| LATAM presence | Sí | No |
| Ideal para | Equipos de soporte | Equipos de revenue/SDR |

### Resumen de Ventajas Nova
1. **Precio predecible** — sin sorpresas por agente o por resolución
2. **IA de primer nivel** — Claude integrado, no un add-on caro
3. **LATAM-first** — soporte, pagos y equipo en español nativo
4. **Setup en minutos** — no semanas como la competencia
5. **Todo incluido** — sin módulos extra que inflan el precio`,

  onboarding: `## Flujo de Onboarding

### Paso 1: Crear Cuenta (2 min)
- Ir a empresa.com/signup
- Ingresar email corporativo y contraseña
- Verificar email (link en bandeja de entrada)
- No se requiere tarjeta de crédito

### Paso 2: Configuración Inicial (5 min)
- Nombre de la organización
- Sector/industria (para templates optimizados)
- Número de agentes estimados
- Canales principales (web, WhatsApp, email)

### Paso 3: Crear Primer Chatbot (10 min)
- Panel > Chatbots > Crear nuevo
- Elegir template por industria o empezar de cero
- Configurar personalidad, tono y nombre
- Agregar FAQs iniciales (mínimo 10 recomendadas)
- Configurar mensaje de bienvenida y horarios

### Paso 4: Instalar Widget (5 min)
- Panel > Widget > Obtener código
- Copiar snippet JavaScript
- Pegarlo antes del </head> en tu sitio web
- Verificar que carga correctamente
- Personalizar colores y posición

### Paso 5: Conectar Integraciones (10 min por integración)
- Panel > Integraciones > seleccionar herramienta
- Seguir wizard de autorización
- Configurar reglas de enrutamiento
- Probar conexión

### Paso 6: Invitar al Equipo (3 min)
- Panel > Equipo > Invitar miembros
- Asignar roles (Admin, Agente, Viewer)
- Los invitados reciben email con acceso

### Paso 7: Go Live
- Activar chatbot en modo producción
- Monitorear primeras conversaciones en Panel > Live
- Ajustar respuestas y flujos según feedback real

### Recursos de Onboarding
- Video tutorial completo: docs.empresa.com/videos/quickstart (12 min)
- Checklist interactivo en el panel de control
- Sesión 1-on-1 gratuita para Enterprise (agendar en Panel > Ayuda)
- Webinar semanal de onboarding (jueves 11am CDMX)`,

  seguridad: `## Seguridad y Compliance

### SOC 2 Type II
- Auditoría anual por firma independiente (Deloitte)
- Controles de seguridad, disponibilidad y confidencialidad
- Reporte disponible bajo NDA para clientes Enterprise
- Última auditoría: enero 2025 — sin hallazgos críticos

### ISO 27001
- Proceso de certificación en curso (estimado Q3 2025)
- SGSI (Sistema de Gestión de Seguridad de la Información) implementado
- Controles Anexo A aplicables documentados

### GDPR (Reglamento General de Protección de Datos)
- Data Processing Agreement (DPA) disponible para todos los clientes
- Derechos del titular: acceso, rectificación, eliminación, portabilidad
- Bases legales documentadas para cada tratamiento de datos
- Data Protection Officer (DPO): dpo@empresa.com
- Notificación de brechas: dentro de 72 horas según regulación
- Transferencias internacionales: SCCs (Standard Contractual Clauses) vigentes

### LFPDPPP (México)
- Aviso de privacidad publicado en empresa.com/privacidad
- Derechos ARCO garantizados
- Oficial de privacidad designado

### Controles Técnicos
- Cifrado en reposo: AES-256
- Cifrado en tránsito: TLS 1.3 obligatorio
- Gestión de llaves: AWS KMS con rotación automática cada 90 días
- MFA/2FA disponible en todos los planes
- SSO (SAML 2.0 / OIDC) en Plan Enterprise
- IP allowlisting disponible en Enterprise
- Logs de auditoría: retención de 1 año (Enterprise), 90 días (Pro)
- Backups: diarios automáticos, retención 30 días, cifrados
- Pen testing: anual por firma externa, remediación en <30 días
- Vulnerability scanning: semanal automatizado (Snyk + OWASP ZAP)
- WAF (Web Application Firewall) activo en todos los endpoints

### Infraestructura
- Proveedor: AWS (Amazon Web Services)
- Regiones: us-east-1 (Virginia), eu-west-1 (Irlanda)
- Opción de región dedicada para Enterprise (incluye México)
- Auto-scaling con mínimo 3 zonas de disponibilidad
- DR (Disaster Recovery): RPO < 1 hora, RTO < 4 horas
- Uptime SLA: 99.5% (Pro), 99.9% (Enterprise)
- Status page público: status.empresa.com`,

  integraciones: `## Guías de Configuración — Top 5 Integraciones

### 1. Slack
**Requisitos:** Plan Pro+, ser admin del workspace de Slack
**Pasos:**
1. Panel > Integraciones > Slack > "Conectar"
2. Se abre ventana de autorización de Slack
3. Seleccionar workspace y canal destino
4. Permitir permisos: leer mensajes, enviar mensajes, gestionar canales
5. Configurar: qué notificaciones enviar (nuevas conversaciones, escalamientos, etc.)
6. Probar: enviar mensaje de prueba desde Panel > Integraciones > Slack > "Test"

**Troubleshooting Slack:**
- "No tengo opción de conectar" → Verificar que eres admin del workspace
- "No llegan notificaciones" → Verificar canal seleccionado y permisos del bot
- "Error 403" → Revocar y reconectar la integración

### 2. Microsoft Teams
**Requisitos:** Plan Pro+, admin de Microsoft 365 tenant
**Pasos:**
1. Panel > Integraciones > Microsoft Teams > "Conectar"
2. Iniciar sesión con cuenta admin de Microsoft 365
3. Aprobar permisos de la aplicación en Azure AD
4. Seleccionar equipo y canal destino
5. Configurar reglas de notificación
6. Probar conexión

**Troubleshooting Teams:**
- "No puedo autorizar" → Necesitas rol Global Admin o Teams Admin en M365
- "La app no aparece en Teams" → Puede tardar hasta 24h en propagarse
- "Mensajes no se envían" → Verificar que la app no esté bloqueada por políticas

### 3. HubSpot CRM
**Requisitos:** Plan Pro+, cuenta HubSpot (gratuita o de pago)
**Pasos:**
1. Panel > Integraciones > HubSpot > "Conectar"
2. Autorizar acceso a tu portal de HubSpot
3. Mapear campos: nombre → contact name, email → contact email, etc.
4. Configurar: crear contacto automáticamente al iniciar conversación
5. Activar sincronización bidireccional de notas
6. Probar: crear conversación de prueba y verificar en HubSpot

**Funcionalidades:**
- Auto-crear contactos en HubSpot desde el chat
- Ver historial de HubSpot dentro de Nova
- Crear deals/oportunidades desde conversaciones
- Sincronizar notas y tags

### 4. WhatsApp Business
**Requisitos:** Plan Pro+, cuenta de WhatsApp Business API (vía Meta)
**Pasos:**
1. Tener Facebook Business Manager configurado
2. Solicitar acceso a WhatsApp Business API (si no lo tienes)
3. Panel > Integraciones > WhatsApp > "Conectar"
4. Ingresar Phone Number ID y Access Token de Meta
5. Configurar templates de mensajes (requerido por Meta para iniciar conversaciones)
6. Verificar webhook URL proporcionada por Nova
7. Probar: enviar mensaje de prueba

**Notas importantes:**
- Meta cobra por conversación iniciada (ver precios en Meta Business)
- Templates deben ser aprobados por Meta antes de usarse
- Mensajes dentro de ventana de 24h no tienen costo adicional

### 5. Zapier / Make.com
**Requisitos:** Plan Pro+, cuenta en Zapier o Make
**Pasos:**
1. Panel > Configuración > API > Generar API Key
2. En Zapier/Make, buscar "Nova" en el catálogo de apps
3. Conectar usando la API Key generada
4. Crear zaps/scenarios: ej. "Nueva conversación → Crear ticket en Jira"

**Ejemplos de automatizaciones populares:**
- Nueva conversación → Notificar en Slack + crear registro en Google Sheets
- Escalamiento detectado → Crear ticket urgente en Jira/Asana
- Cliente satisfecho (NPS 9-10) → Enviar solicitud de reseña en Google
- Nueva venta cerrada → Actualizar CRM + notificar equipo de ventas`,
};

// ─── Context retrieval function for agents ─────────────────────

const AGENT_KB_MAP = {
  VENTAS: ['ventas', 'competidores', 'faq', 'onboarding'],
  SOPORTE: ['soporte', 'integraciones', 'faq', 'seguridad'],
  FACTURACION: ['facturacion', 'faq'],
  ESCALAMIENTO: ['general', 'soporte', 'facturacion'],
  GENERAL: ['general', 'faq', 'onboarding'],
};

const TOPIC_KEYWORDS = {
  ventas: ['plan', 'precio', 'costo', 'comprar', 'demo', 'trial', 'prueba'],
  soporte: ['error', 'problema', 'bug', 'falla', 'configurar', 'instalar'],
  facturacion: ['factura', 'cobro', 'pago', 'reembolso', 'cancelar', 'tarjeta'],
  competidores: ['zendesk', 'intercom', 'freshdesk', 'drift', 'competencia', 'comparar', 'diferencia', 'mejor que', 'vs'],
  onboarding: ['empezar', 'comenzar', 'configurar', 'primeros pasos', 'setup', 'onboarding', 'instalar widget'],
  seguridad: ['seguridad', 'soc2', 'soc 2', 'iso', 'gdpr', 'cifrado', 'compliance', 'certificación', 'privacidad', 'datos'],
  integraciones: ['slack', 'teams', 'hubspot', 'whatsapp', 'zapier', 'make', 'integración', 'conectar', 'integrar'],
  faq: ['pregunta', 'duda', 'cómo', 'como', 'puedo', 'qué es', 'que es'],
};

/**
 * Returns relevant KB context for a specific agent type and user message topic.
 * Prioritizes sections based on agent type, then boosts by topic keyword matching.
 */
export function getContextForAgent(agentType, topic = '') {
  const primarySections = AGENT_KB_MAP[agentType] || ['general', 'faq'];
  const normalizedTopic = topic.toLowerCase();

  // Score each KB section by topic relevance
  const scored = Object.keys(KNOWLEDGE_BASE).map((section) => {
    const keywords = TOPIC_KEYWORDS[section] || [];
    const isPrimary = primarySections.includes(section);
    let score = isPrimary ? 10 : 0;

    for (const kw of keywords) {
      if (normalizedTopic.includes(kw)) {
        score += 5;
      }
    }

    return { section, score };
  });

  // Sort by score descending, take top 3
  scored.sort((a, b) => b.score - a.score);
  const topSections = scored.slice(0, 3).filter((s) => s.score > 0);

  if (topSections.length === 0) {
    // Fallback: return primary sections for the agent
    return primarySections
      .slice(0, 2)
      .map((s) => KNOWLEDGE_BASE[s])
      .join('\n\n---\n\n');
  }

  return topSections.map((s) => KNOWLEDGE_BASE[s.section]).join('\n\n---\n\n');
}
