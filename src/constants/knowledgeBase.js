// Client-side knowledge base for demo mode

export const KB = {
  ventas: `## Planes y Precios
- Plan Básico: $99/mes — 3 usuarios, soporte por email, integraciones básicas (Slack, Email)
- Plan Pro: $199/mes — 10 usuarios, soporte prioritario (24h), todas las integraciones, analytics avanzados, API access
- Plan Enterprise: Precio personalizado — usuarios ilimitados, SLA 99.9%, onboarding dedicado, soporte 4h, SSO/SAML
- Todos incluyen 14 días de prueba gratuita sin tarjeta de crédito
- Pago anual: 20% de descuento ($79/mes Básico, $159/mes Pro)
- Upgrade/downgrade disponible en cualquier momento sin penalización

## Comparativa vs Competencia
- vs Zendesk: 40% más económico, setup en 15 min vs 2 semanas
- vs Intercom: IA nativa sin costo extra (competidores cobran $0.99/resolución)
- vs Freshdesk: 50+ integraciones nativas vs 30 en plan equivalente

## Casos de Éxito
- RetailMX: Redujo tickets 65% en 3 meses
- FinanzasPlus: ROI de 340% en primer año
- LogísticaPro: Resolución de 48h a 4h promedio`,

  soporte: `## Soporte Técnico
- Horario: Lun-Vie 9am-7pm CDMX, Enterprise 24/7
- Tiempo de respuesta: Básico 48h, Pro 24h, Enterprise 4h
- Base de conocimiento: docs.empresa.com (200+ artículos)

## Problemas Comunes
- "No puedo iniciar sesión" → login > "¿Olvidaste tu contraseña?" > email en 5 min
- "Integración no conecta" → 1) Token API vigente, 2) Permisos correctos, 3) Firewall
- "Chatbot no responde" → 1) Suscripción activa, 2) Límite no alcanzado, 3) API key válida
- "Error 429" → Rate limit, esperar 60s o upgrade plan

## Integraciones (50+)
- Comunicación: Slack, Teams, Discord, Zoom, WhatsApp, Telegram
- CRM: Salesforce, HubSpot, Pipedrive, Zoho, Monday.com
- Automatización: Zapier, n8n, Make.com, Power Automate
- eCommerce: Shopify, WooCommerce, MercadoLibre
- Pagos: Stripe, MercadoPago, Conekta, OpenPay`,

  facturacion: `## Facturación
- Métodos: Tarjetas (Visa, MC, Amex), SPEI, OXXO Pay, transferencia bancaria
- Facturas CFDI automáticas el día 1 de cada mes
- Moneda: MXN por defecto, USD/EUR para Enterprise

## Cancelación y Reembolsos
- Cancelar: Configuración > Suscripción > Cancelar (efecto al final del ciclo)
- Reembolso completo: primeros 30 días, sin preguntas
- Datos post-cancelación: 90 días de retención
- Contacto: facturacion@empresa.com

## Cambio de Plan
- Upgrade: inmediato, prorrateo del ciclo
- Downgrade: al inicio del siguiente ciclo`,

  integraciones: `## Integraciones (50+)
- Comunicación: Slack, Teams, Discord, Zoom, WhatsApp, Telegram
- CRM: Salesforce, HubSpot, Pipedrive, Zoho, Monday.com
- Automatización: Zapier, n8n, Make.com, Power Automate
- eCommerce: Shopify, WooCommerce, MercadoLibre
- Pagos: Stripe, MercadoPago, Conekta, OpenPay
- API REST disponible desde Plan Pro, webhooks en todos los planes
- Documentación completa en docs.empresa.com/integrations`,

  seguridad: `## Seguridad y Privacidad
- Cifrado AES-256 en reposo + TLS 1.3 en tránsito
- Certificaciones: SOC2 Type II, ISO 27001, GDPR compliant
- 2FA obligatorio en todos los planes
- Servidores AWS México (principal) + AWS Virginia (respaldo)
- Auditorías de seguridad trimestrales por firma externa
- Retención de datos configurable, eliminación bajo demanda
- Cumplimiento con Ley Federal de Protección de Datos Personales (México)`,

  general: `## Empresa
- Fundada 2024, CDMX, 45+ personas, +2,000 clientes
- Certificaciones: SOC2 Type II, ISO 27001, GDPR
- Cifrado AES-256 + TLS 1.3, 2FA en todos los planes
- Servidores AWS México + Virginia
- Contacto: hola@empresa.com | (55) 1234-5678 | Lun-Vie 9-18 CDMX`,
};
