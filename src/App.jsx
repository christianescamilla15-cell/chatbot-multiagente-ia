import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ─── ELEVENLABS VOICE WIDGET ────────────────────────────────────────────────
function useElevenLabsWidget() {
  useEffect(() => {
    if (document.querySelector('script[src*="elevenlabs"]')) return;
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    document.body.appendChild(script);
  }, []);
}

// ─── SVG ICONS ──────────────────────────────────────────────────────────────
const Icons = {
  chart: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
  download: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>,
  trash: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>,
  send: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>,
  thumbUp: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.228.22.442.39.624a2.996 2.996 0 002.206.976h.028A2.25 2.25 0 005.904 18.75z"/></svg>,
  thumbDown: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365-.183-.72-.32-1.063A4.5 4.5 0 0015 2.25h-.132a2.25 2.25 0 00-2.177 1.689l-.095.38a24.8 24.8 0 00-.6 4.02M15 15h-3.375c-1.294 0-2.532.313-3.627.906l-1.44.72A4.5 4.5 0 005.25 21h.628a2.25 2.25 0 002.149-1.586l.24-.798c.28-.93.876-1.74 1.67-2.28.59-.4 1.262-.627 1.957-.715"/></svg>,
  info: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>,
};

// ─── AGENTS ─────────────────────────────────────────────────────────────────
const AGENTS = {
  nova:  { name: "Nova",  mono: "NV", role: { es: "Ventas", en: "Sales" },           gradient: "linear-gradient(135deg, #0D9488, #6EE7C7)", color: "#6EE7C7", shadow: "rgba(110,231,199,0.3)" },
  atlas: { name: "Atlas", mono: "AT", role: { es: "Soporte Técnico", en: "Tech Support" },  gradient: "linear-gradient(135deg, #3B82F6, #93C5FD)", color: "#93C5FD", shadow: "rgba(147,197,253,0.3)" },
  aria:  { name: "Aria",  mono: "AR", role: { es: "Facturación", en: "Billing" },      gradient: "linear-gradient(135deg, #8B5CF6, #C4B5FD)", color: "#C4B5FD", shadow: "rgba(196,181,253,0.3)" },
  nexus: { name: "Nexus", mono: "NX", role: { es: "Escalamiento", en: "Escalation" },     gradient: "linear-gradient(135deg, #EF4444, #FCA5A5)", color: "#FCA5A5", shadow: "rgba(252,165,165,0.3)" },
  orion: { name: "Orion", mono: "OR", role: { es: "General", en: "General" },          gradient: "linear-gradient(135deg, #F59E0B, #FDE68A)", color: "#FDE68A", shadow: "rgba(253,230,138,0.3)" },
};

function agentRole(agentId, lang) {
  const a = AGENTS[agentId];
  if (!a) return "";
  return typeof a.role === "string" ? a.role : (a.role[lang] || a.role.es);
}

// ─── KNOWLEDGE BASE ─────────────────────────────────────────────────────────
const KB = {
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

  general: `## Empresa
- Fundada 2024, CDMX, 45+ personas, +2,000 clientes
- Certificaciones: SOC2 Type II, ISO 27001, GDPR
- Cifrado AES-256 + TLS 1.3, 2FA en todos los planes
- Servidores AWS México + Virginia
- Contacto: hola@empresa.com | (55) 1234-5678 | Lun-Vie 9-18 CDMX`,
};

// ─── INTENT CLASSIFIER ─────────────────────────────────────────────────────
const INTENT_RULES = [
  { agent: "nova", keys: ["plan", "precio", "costo", "comprar", "contratar", "prueba", "trial", "demo", "descuento", "upgrade", "enterprise", "pro", "basico", "básico", "anual", "comparar", "competencia", "roi", "caso de éxito", "funcionalidades", "price", "pricing", "cost", "buy", "purchase", "subscribe", "discount", "annual", "compare", "features", "free trial"] },
  { agent: "atlas", keys: ["error", "problema", "no funciona", "no carga", "bug", "falla", "ayuda técnica", "integración", "configurar", "instalar", "api", "token", "soporte", "429", "lento", "caído", "no conecta", "login", "contraseña", "password", "documentación", "problem", "not working", "broken", "help", "technical", "integration", "configure", "install", "slow", "down", "connect", "documentation", "setup"] },
  { agent: "aria", keys: ["factura", "cobro", "pago", "reembolso", "cancelar", "suscripción", "tarjeta", "cfdi", "devolución", "cargo", "recibo", "renovar", "cambiar plan", "downgrade", "oxxo", "spei", "transferencia", "precio", "invoice", "billing", "payment", "refund", "cancel", "subscription", "card", "charge", "receipt", "renew", "change plan"] },
  { agent: "nexus", keys: ["hablar con alguien", "agente humano", "persona real", "queja", "reclamo", "urgente", "inaceptable", "terrible", "pésimo", "enojado", "frustrado", "molesto", "no me resuelven", "supervisor", "gerente", "harto", "furioso", "talk to someone", "human agent", "real person", "complaint", "urgent", "unacceptable", "angry", "frustrated", "upset", "manager", "supervisor"] },
  { agent: "orion", keys: ["hola", "buenas", "qué hacen", "quiénes son", "horario", "contacto", "ubicación", "seguridad", "datos", "privacidad", "equipo", "empresa", "certificaciones", "gracias", "adiós", "cómo funciona", "hello", "hi", "hey", "who are you", "what do you do", "hours", "contact", "location", "security", "privacy", "team", "company", "thanks", "goodbye", "how does it work"] },
];

function classifyIntent(text) {
  const norm = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const frustration = ["no funciona", "terrible", "pesimo", "enojado", "frustrado", "molesto", "inaceptable", "harto", "furioso", "queja", "not working", "angry", "frustrated", "upset", "unacceptable", "furious", "complaint"];
  if (frustration.some(w => norm.includes(w.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) return { agent: "nexus", confidence: 0.95 };

  let best = "orion", bestScore = 0, totalKeys = 0;
  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const key of rule.keys) {
      if (norm.includes(key.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) score++;
    }
    totalKeys += rule.keys.length;
    if (score > bestScore) { bestScore = score; best = rule.agent; }
  }
  const confidence = bestScore > 0 ? Math.min(0.5 + bestScore * 0.2, 0.98) : 0.3;
  return { agent: confidence >= 0.4 ? best : "orion", confidence };
}

// ─── AGENT SYSTEM PROMPTS ───────────────────────────────────────────────────
function getSystemPrompt(agentId) {
  const a = AGENTS[agentId];
  const kbMap = { nova: "ventas", atlas: "soporte", aria: "facturacion", nexus: null, orion: "general" };
  const kbContent = kbMap[agentId] ? KB[kbMap[agentId]] : "";

  if (agentId === "nexus") return `Eres ${a.name}, agente de escalamiento empático. 1) Empatiza genuinamente, 2) Reconoce el problema sin excusas, 3) Ofrece escalar a agente humano, 4) Da contacto: soporte@empresa.com, (55) 1234-5678, 5) Máximo 30 min respuesta humana. Español, max 4 líneas.`;

  return `Eres ${a.name}, agente de ${a.role} de una empresa SaaS.\n\nBase de conocimiento:\n${kbContent}\n${KB.general}\n\nReglas:\n- Español, claro, conciso, profesional\n- Usa datos específicos de la KB (precios, tiempos, pasos)\n- Si no sabes, di que escalarás\n- Nunca inventes\n- Max 4-5 líneas\n- Incluye datos concretos cuando sea relevante`;
}

// ─── DEMO RESPONSES ─────────────────────────────────────────────────────────
const DEMO = {
  nova: {
    default: "Tenemos 3 planes: Básico ($99/mes, 3 usuarios), Pro ($199/mes, 10 usuarios + soporte prioritario) y Enterprise (personalizado, usuarios ilimitados + SLA 99.9%). Todos incluyen 14 días de prueba gratuita. ¿Cuál se ajusta a tus necesidades?",
    patterns: [
      { k: ["precio", "costo", "cuanto", "plan"], r: "Nuestros planes: Básico $99/mes, Pro $199/mes, Enterprise personalizado. Con pago anual obtienes 20% de descuento. 14 días gratis sin tarjeta. ¿Cuál te interesa?" },
      { k: ["prueba", "trial", "gratis"], r: "Ofrecemos 14 días de prueba completamente gratis, sin tarjeta de crédito. Acceso completo al Plan Pro. ¿Te ayudo a activarla?" },
      { k: ["enterprise", "corporativo"], r: "Enterprise incluye: usuarios ilimitados, SLA 99.9%, onboarding dedicado, soporte 4h, SSO/SAML y account manager. Precio según necesidades. ¿Te conecto con ventas?" },
      { k: ["descuento", "anual"], r: "Con pago anual: Básico $79/mes (ahorro $240/año) y Pro $159/mes (ahorro $480/año). ¿Te interesa?" },
      { k: ["competencia", "zendesk", "intercom"], r: "Somos 40% más económicos que Zendesk, con setup en 15 min. A diferencia de Intercom, nuestra IA está incluida sin costo extra por resolución. ¿Quieres una demo?" },
    ],
  },
  atlas: {
    default: "Para ayudarte mejor, ¿podrías describir el error? Si es acceso, ve a login > '¿Olvidaste tu contraseña?'. Soporte disponible Lun-Vie 9am-7pm CDMX.",
    patterns: [
      { k: ["login", "contraseña", "acceso", "entrar", "puedo"], r: "Para restablecer: 1) Pantalla de login > '¿Olvidaste tu contraseña?', 2) Ingresa tu email, 3) Link de recuperación en máximo 5 minutos. Revisa spam si no llega." },
      { k: ["integración", "conectar", "api", "falla"], r: "Verifica: 1) Token API vigente (Panel > API > Tokens), 2) Permisos correctos, 3) Firewall no bloquee nuestros servidores. Docs completos en docs.empresa.com" },
      { k: ["lento", "429", "error"], r: "Error 429 = límite de requests alcanzado. Espera 60 segundos o considera upgrade para mayor capacidad. Si persiste, limpia caché y prueba en incógnito." },
      { k: ["hablar", "soporte", "humano", "persona"], r: "Nuestro soporte humano está disponible Lun-Vie 9am-7pm CDMX. Puedes contactarnos en soporte@empresa.com o (55) 1234-5678. Tiempo de respuesta: Básico 48h, Pro 24h, Enterprise 4h. ¿Quieres que escale tu caso?" },
    ],
  },
  aria: {
    default: "Puedo ayudarte con facturación. Aceptamos tarjetas, SPEI y OXXO Pay. Facturas CFDI automáticas el día 1. ¿Cuál es tu consulta?",
    patterns: [
      { k: ["cancelar", "baja"], r: "Para cancelar: Configuración > Suscripción > Cancelar. Efectiva al final del ciclo actual. Tus datos se conservan 90 días. ¿Algo más?" },
      { k: ["reembolso", "devolución", "devolver"], r: "Reembolso completo dentro de los primeros 30 días. Escribe a facturacion@empresa.com con tu número de cuenta. Procesamos en 5-7 días hábiles." },
      { k: ["factura", "cfdi", "comprobante"], r: "Facturas CFDI se generan el día 1 y se envían al email registrado. Para refacturación, escribe a facturacion@empresa.com con RFC y razón social." },
      { k: ["oxxo", "spei", "transferencia", "pago", "metodo"], r: "Aceptamos: tarjetas (Visa, MC, Amex), SPEI, OXXO Pay y transferencia bancaria. OXXO genera una referencia de pago con vigencia de 24h. SPEI se acredita en minutos. ¿Necesitas cambiar tu método de pago?" },
      { k: ["cambiar", "upgrade", "downgrade", "plan"], r: "Upgrade: se aplica inmediatamente con prorrateo. Downgrade: al inicio del siguiente ciclo. Ambos desde Configuración > Suscripción. Enterprise requiere contactar a tu account manager." },
    ],
  },
  nexus: {
    default: "Lamento mucho tu experiencia. Entiendo la frustración y quiero resolverlo. Estoy escalando tu caso ahora:\n\n📧 soporte@empresa.com\n📞 (55) 1234-5678\n\nUn agente humano te contactará en máximo 30 minutos. Ref: #ESC-" + Math.floor(Math.random() * 9000 + 1000),
    patterns: [],
  },
  orion: {
    default: "Puedo ayudarte con información sobre planes, soporte técnico, facturación o datos de la empresa. ¿Sobre qué tema necesitas información?",
    patterns: [
      { k: ["hola", "buenas", "hey", "que tal"], r: "¡Hola! Bienvenido a Synapse. Puedo ayudarte con planes y precios, soporte técnico, o facturación. ¿Sobre qué necesitas información?" },
      { k: ["ubicad", "donde", "dónde", "oficina", "dirección", "direccion"], r: "Nuestra sede principal está en Ciudad de México. Operamos con un equipo de 45+ personas en 3 países (MX, CO, AR). Servidores en AWS México (principal) + AWS Virginia (respaldo). Contacto: hola@empresa.com | (55) 1234-5678" },
      { k: ["contacto", "teléfono", "telefono", "email", "correo", "llamar"], r: "Contacto: hola@empresa.com | (55) 1234-5678. Horario de oficina: Lun-Vie 9:00-18:00 CDMX. Soporte técnico extiende hasta las 7pm. Enterprise tiene soporte 24/7." },
      { k: ["horario", "hora", "atienden", "abierto"], r: "Horario de atención: Lun-Vie 9:00-18:00 CDMX. Soporte técnico: hasta las 7pm. Enterprise: 24/7 con línea directa. Los fines de semana solo atendemos emergencias Enterprise." },
      { k: ["empresa", "quienes", "quiénes", "que hacen", "qué hacen"], r: "Somos Synapse, plataforma SaaS de chatbots IA fundada en 2024. +2,000 empresas clientes, 45+ personas en 3 países. Ofrecemos chatbots multiagente con IA para atención al cliente, ventas y soporte." },
      { k: ["seguridad", "datos", "privacidad", "cifrado", "certificacion"], r: "Seguridad es prioridad: cifrado AES-256 + TLS 1.3, certificaciones SOC2 Type II e ISO 27001, GDPR compliant. Servidores en AWS México con respaldo en Virginia. 2FA en todos los planes." },
      { k: ["integracion", "integración", "conectar", "herramienta"], r: "Contamos con 50+ integraciones nativas: Slack, Teams, WhatsApp, HubSpot, Salesforce, Shopify, Zapier, n8n, Make.com, Stripe, MercadoPago y muchas más. Disponibles desde el Plan Pro." },
      { k: ["gracias", "excelente", "perfecto", "genial"], r: "¡Con mucho gusto! Si necesitas algo más, aquí estaré. Que tengas un excelente día." },
      { k: ["adios", "adiós", "bye", "hasta luego", "chao"], r: "¡Hasta pronto! Fue un gusto atenderte. Si necesitas algo en el futuro, aquí estaremos. ¡Éxito!" },
    ],
  },
};

const DEMO_EN = {
  nova: {
    default: "We have 3 plans: Basic ($99/mo, 3 users), Pro ($199/mo, 10 users + priority support) and Enterprise (custom, unlimited users + 99.9% SLA). All include a 14-day free trial. Which one fits your needs?",
    patterns: [
      { k: ["price", "cost", "how much", "plan"], r: "Our plans: Basic $99/mo, Pro $199/mo, Enterprise custom. Annual billing gives you 20% off. 14 days free, no credit card. Which one interests you?" },
      { k: ["trial", "free", "test"], r: "We offer a 14-day free trial, no credit card required. Full access to the Pro plan. Want me to help you get started?" },
      { k: ["enterprise", "corporate"], r: "Enterprise includes: unlimited users, 99.9% SLA, dedicated onboarding, 4h support, SSO/SAML and account manager. Custom pricing. Shall I connect you with sales?" },
      { k: ["discount", "annual"], r: "With annual billing: Basic $79/mo (save $240/yr) and Pro $159/mo (save $480/yr). Interested?" },
      { k: ["competition", "zendesk", "intercom"], r: "We're 40% cheaper than Zendesk, with setup in 15 min. Unlike Intercom, our AI is included at no extra cost per resolution. Want a demo?" },
    ],
  },
  atlas: {
    default: "To help you better, could you describe the error? For access issues, go to login > 'Forgot password?'. Support available Mon-Fri 9am-7pm CDMX.",
    patterns: [
      { k: ["login", "password", "access", "sign in", "can't"], r: "To reset: 1) Login screen > 'Forgot password?', 2) Enter your email, 3) Recovery link arrives in max 5 minutes. Check spam if it doesn't arrive." },
      { k: ["integration", "connect", "api", "fail"], r: "Check: 1) API token is valid (Panel > API > Tokens), 2) Correct permissions, 3) Firewall isn't blocking our servers. Full docs at docs.empresa.com" },
      { k: ["slow", "429", "error"], r: "Error 429 = request limit reached. Wait 60 seconds or consider upgrading for more capacity. If it persists, clear cache and try incognito mode." },
      { k: ["talk", "support", "human", "person"], r: "Our human support is available Mon-Fri 9am-7pm CDMX. Contact us at soporte@empresa.com or (55) 1234-5678. Response time: Basic 48h, Pro 24h, Enterprise 4h. Want me to escalate?" },
    ],
  },
  aria: {
    default: "I can help you with billing. We accept cards, SPEI and OXXO Pay. CFDI invoices generated automatically on the 1st. What's your question?",
    patterns: [
      { k: ["cancel", "unsubscribe"], r: "To cancel: Settings > Subscription > Cancel. Effective at end of current cycle. Your data is retained for 90 days. Anything else?" },
      { k: ["refund", "money back", "return"], r: "Full refund within the first 30 days. Email facturacion@empresa.com with your account number. Processed in 5-7 business days." },
      { k: ["invoice", "receipt", "cfdi"], r: "CFDI invoices are generated on the 1st and sent to your registered email. For re-invoicing, email facturacion@empresa.com with RFC and business name." },
      { k: ["oxxo", "spei", "transfer", "payment", "method"], r: "We accept: cards (Visa, MC, Amex), SPEI, OXXO Pay and bank transfer. OXXO generates a payment reference valid for 24h. SPEI processes in minutes. Need to change your payment method?" },
      { k: ["change", "upgrade", "downgrade", "plan"], r: "Upgrade: applied immediately with proration. Downgrade: at the start of the next cycle. Both from Settings > Subscription. Enterprise requires contacting your account manager." },
    ],
  },
  nexus: {
    default: "I'm sorry about your experience. I understand the frustration and want to resolve this. I'm escalating your case now:\n\nsoporte@empresa.com\n(55) 1234-5678\n\nA human agent will contact you within 30 minutes. Ref: #ESC-" + Math.floor(Math.random() * 9000 + 1000),
    patterns: [],
  },
  orion: {
    default: "I can help you with information about plans, tech support, billing or company details. What topic do you need help with?",
    patterns: [
      { k: ["hello", "hi", "hey", "what's up"], r: "Hello! Welcome to Synapse. I can help you with plans and pricing, technical support, or billing. What do you need?" },
      { k: ["location", "where", "office", "address"], r: "Our headquarters is in Mexico City. We operate with a team of 45+ people in 3 countries (MX, CO, AR). Servers on AWS Mexico (primary) + AWS Virginia (backup). Contact: hola@empresa.com | (55) 1234-5678" },
      { k: ["contact", "phone", "email", "call"], r: "Contact: hola@empresa.com | (55) 1234-5678. Office hours: Mon-Fri 9:00-18:00 CDMX. Tech support extends to 7pm. Enterprise has 24/7 support." },
      { k: ["hours", "schedule", "open", "available"], r: "Business hours: Mon-Fri 9:00-18:00 CDMX. Tech support: until 7pm. Enterprise: 24/7 with direct line. Weekends only for Enterprise emergencies." },
      { k: ["company", "who", "what do"], r: "We are Synapse, an AI chatbot SaaS platform founded in 2024. 2,000+ business clients, 45+ people in 3 countries. We offer multi-agent AI chatbots for customer service, sales and support." },
      { k: ["security", "data", "privacy", "encryption", "certification"], r: "Security is a priority: AES-256 + TLS 1.3 encryption, SOC2 Type II and ISO 27001 certifications, GDPR compliant. AWS servers in Mexico with Virginia backup. 2FA on all plans." },
      { k: ["integration", "connect", "tool"], r: "We have 50+ native integrations: Slack, Teams, WhatsApp, HubSpot, Salesforce, Shopify, Zapier, n8n, Make.com, Stripe, MercadoPago and more. Available from the Pro plan." },
      { k: ["thanks", "great", "perfect", "awesome"], r: "My pleasure! If you need anything else, I'm here. Have a great day!" },
      { k: ["bye", "goodbye", "see you", "later"], r: "Goodbye! It was great helping you. If you need anything in the future, we'll be here. Take care!" },
    ],
  },
};

function getDemoResponse(agentId, text, lang) {
  const demoSet = lang === "en" ? DEMO_EN : DEMO;
  const a = demoSet[agentId]; if (!a) return lang === "en" ? "How can I help you?" : "¿En qué puedo ayudarte?";
  const norm = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const p of a.patterns) { if (p.k.some(k => norm.includes(k))) return p.r; }
  return a.default;
}

// ─── SUGGESTIONS ────────────────────────────────────────────────────────────
function getSuggestions(agentId, msgCount, lang) {
  if (lang === "en") {
    if (msgCount <= 1) return ["What are the plans?", "I have a technical issue", "I need my invoice", "What integrations do you have?"];
    return {
      nova: ["Free trial?", "Annual discount", "vs Zendesk", "Enterprise plan"],
      atlas: ["Can't sign in", "Error 429", "Integration fails", "Talk to support"],
      aria: ["I want to cancel", "Need a refund", "Change plan", "Do you accept OXXO?"],
      nexus: ["Talk to a person", "I need a solution now"],
      orion: ["Is my data secure?", "See plans", "Where are you located?"],
    }[agentId] || ["How can I help?"];
  }
  if (msgCount <= 1) return ["¿Cuáles son los planes?", "Tengo un problema técnico", "Necesito mi factura", "¿Qué integraciones tienen?"];
  return {
    nova: ["¿Prueba gratis?", "Descuento anual", "vs Zendesk", "Plan Enterprise"],
    atlas: ["No puedo entrar", "Error 429", "Integración falla", "Hablar con soporte"],
    aria: ["Quiero cancelar", "Necesito reembolso", "Cambiar de plan", "¿Aceptan OXXO?"],
    nexus: ["Hablar con una persona", "Necesito solución ya"],
    orion: ["¿Son seguros mis datos?", "Ver planes", "¿Dónde están ubicados?"],
  }[agentId] || ["¿En qué puedo ayudar?"];
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function AgentAvatar({ agentId, size = 32 }) {
  const a = AGENTS[agentId] || AGENTS.orion;
  const fs = size === 32 ? 11 : size === 42 ? 14 : 9;
  return (
    <div style={{ width: size, height: size, borderRadius: size > 36 ? 14 : "50%", background: a.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em", flexShrink: 0, boxShadow: `0 0 ${size > 36 ? 20 : 12}px ${a.shadow}`, transition: "all 0.3s ease" }}>
      {a.mono}
    </div>
  );
}

function UserAvatar({ lang }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
      {lang === "en" ? "YOU" : "TÚ"}
    </div>
  );
}

function TypingDots({ agent, lang }) {
  const a = AGENTS[agent] || AGENTS.orion;
  const text = lang === "en" ? `${a.name} is analyzing...` : `${a.name} está analizando...`;
  return (
    <div style={{ display: "flex", gap: 5, padding: "14px 18px", alignItems: "center" }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: a.color, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 6, fontStyle: "italic" }}>{text}</span>
    </div>
  );
}

function Message({ msg, onRate, isFirstFromAgent, lang }) {
  const isUser = msg.role === "user";
  const a = AGENTS[msg.agent] || AGENTS.orion;
  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-end", gap: 10, marginBottom: 16, animation: "msgIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
      {!isUser && <AgentAvatar agentId={msg.agent} />}
      <div style={{ maxWidth: "72%" }}>
        {!isUser && isFirstFromAgent && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: a.color, fontWeight: 600 }}>{a.name}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>· {agentRole(msg.agent, lang)}</span>
          </div>
        )}
        <div style={{
          background: isUser ? "linear-gradient(135deg, #1E3A5F, #1a3354)" : "#161E2E",
          border: isUser ? "1px solid rgba(99,179,237,0.2)" : `1px solid ${a.color}12`,
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px", fontSize: 14, lineHeight: 1.65,
          color: isUser ? "#E2F4FF" : "#D1D5DB", whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
        {!isUser && msg.id && (
          <div style={{ display: "flex", gap: 4, marginTop: 5, marginLeft: 2, alignItems: "center" }}>
            <button onClick={() => onRate(msg.id, 1)} style={{ background: msg.rating === 1 ? "rgba(16,185,129,0.2)" : "transparent", border: `1px solid ${msg.rating === 1 ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: msg.rating === 1 ? "#6EE7C7" : "#4B5563", display: "flex", alignItems: "center", transition: "all 0.15s" }}>{Icons.thumbUp}</button>
            <button onClick={() => onRate(msg.id, -1)} style={{ background: msg.rating === -1 ? "rgba(239,68,68,0.2)" : "transparent", border: `1px solid ${msg.rating === -1 ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: msg.rating === -1 ? "#FCA5A5" : "#4B5563", display: "flex", alignItems: "center", transition: "all 0.15s" }}>{Icons.thumbDown}</button>
            {msg.timestamp && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>{msg.timestamp}</span>}
          </div>
        )}
      </div>
      {isUser && <UserAvatar lang={lang} />}
    </div>
  );
}

function TransferIndicator({ to, lang }) {
  const a = AGENTS[to];
  const label = lang === "en" ? `Transferred to ${a?.name}` : `Transferido a ${a?.name}`;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 0", animation: "transferFlash 0.6s ease" }}>
      <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${a?.color}30)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: `${a?.color}10`, border: `1px solid ${a?.color}20` }}>
        <AgentAvatar agentId={to} size={18} />
        <span style={{ fontSize: 10, color: a?.color, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>· {agentRole(to, lang)}</span>
      </div>
      <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${a?.color}30)` }} />
    </div>
  );
}

function StatsPanel({ messages, ratings, lang }) {
  const total = messages.filter(m => m.role === "user").length;
  const agentCounts = {};
  messages.filter(m => m.agent).forEach(m => { agentCounts[m.agent] = (agentCounts[m.agent] || 0) + 1; });
  const up = Object.values(ratings).filter(r => r === 1).length;
  const down = Object.values(ratings).filter(r => r === -1).length;
  const sat = up + down > 0 ? Math.round((up / (up + down)) * 100) : 0;
  const t = lang === "en"
    ? { messages: "Messages", satisfaction: "Satisfaction", distribution: "Distribution", rateHint: "Rate responses below" }
    : { messages: "Mensajes", satisfaction: "Satisfacción", distribution: "Distribución", rateHint: "Califica respuestas abajo" };

  return (
    <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", animation: "slideDown 0.25s ease" }}>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.messages}</span>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: "#F9FAFB" }}>{total}</p>
        </div>
        <div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.satisfaction}</span>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: sat >= 70 ? "#6EE7C7" : sat >= 40 ? "#FDE68A" : up + down === 0 ? "rgba(255,255,255,0.15)" : "#FCA5A5" }}>
            {up + down > 0 ? `${sat}%` : "—"}
          </p>
          {up + down === 0 && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.15)" }}>{t.rateHint}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.distribution}</span>
          <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            {Object.entries(agentCounts).map(([id, count]) => {
              const ag = AGENTS[id];
              return ag ? <span key={id} style={{ fontSize: 9, color: ag.color, background: `${ag.color}12`, border: `1px solid ${ag.color}20`, borderRadius: 10, padding: "2px 8px", fontWeight: 500 }}>{ag.mono} {count}</span> : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANGUAGE DETECTION ──────────────────────────────────────────────────────
const EN_WORDS = new Set(["the","is","are","was","were","have","has","had","will","would","can","could","do","does","did","i","you","he","she","it","we","they","my","your","this","that","what","how","why","when","where","who","which","not","no","yes","with","from","for","about","but","and","or","if","then","so","all","any","some","need","want","help","please","thanks","thank","hello","hi","hey"]);
const ES_WORDS = new Set(["el","la","los","las","es","son","fue","era","han","tiene","haber","será","puede","puedo","hacer","hace","hizo","yo","tú","él","ella","nosotros","ellos","mi","tu","este","ese","qué","cómo","por","dónde","cuándo","quién","cuál","no","sí","con","de","para","sobre","pero","que","si","entonces","todo","algún","necesito","quiero","ayuda","gracias","hola","buenas"]);

function detectLang(text) {
  const words = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/);
  let en = 0, es = 0;
  for (const w of words) {
    if (EN_WORDS.has(w)) en++;
    if (ES_WORDS.has(w)) es++;
  }
  if (en === 0 && es === 0) return null;
  if (en > es) return "en";
  if (es > en) return "es";
  return null;
}

// ─── TOUR ────────────────────────────────────────────────────────────────────
const TOUR_TEXTS = {
  0: {
    title: { en: "Synapse — Multi-Agent AI Chatbot", es: "Synapse — Chatbot IA Multiagente" },
    text: {
      en: "This customer service system uses 5 specialized AI agents that automatically route your messages to the right specialist. Nova handles sales, Atlas handles support, Aria handles billing, Nexus handles escalation, and Orion handles general queries. No manual routing — the AI decides. Let me show you how it works!",
      es: "Este sistema de atención al cliente usa 5 agentes IA especializados que rutean tus mensajes automáticamente al especialista correcto. Nova maneja ventas, Atlas soporte, Aria facturación, Nexus escalamiento, y Orion consultas generales. Sin ruteo manual — la IA decide. ¡Déjame mostrarte cómo funciona!",
    },
  },
  1: {
    en: "These are the 5 AI agents. Each specializes in a different area: Nova (Sales), Atlas (Support), Aria (Billing), Nexus (Escalation), Orion (General). The system automatically routes messages to the right agent.",
    es: "Estos son los 5 agentes IA. Cada uno se especializa en un área: Nova (Ventas), Atlas (Soporte), Aria (Facturación), Nexus (Escalamiento), Orion (General). El sistema rutea mensajes automáticamente al agente correcto.",
  },
  2: {
    en: "This is where you type your messages. The AI analyzes your intent and routes it to the best agent automatically.",
    es: "Aquí es donde escribes tus mensajes. La IA analiza tu intención y lo rutea al mejor agente automáticamente.",
  },
  3: {
    en: "The agent responded with info from the knowledge base. Notice how the system detected the intent and routed to the right specialist automatically!",
    es: "El agente respondió con información de la base de conocimiento. ¡Observa cómo el sistema detectó la intención y ruteó al especialista correcto automáticamente!",
  },
  4: {
    en: "The analytics panel tracks message distribution, satisfaction ratings, and agent usage in real-time.",
    es: "El panel de analíticas rastrea distribución de mensajes, calificaciones de satisfacción, y uso de agentes en tiempo real.",
  },
  5: {
    en: "You can also interact by voice using the ElevenLabs widget in the bottom-left corner. Tour complete! You've seen all 5 agents, intent routing, and analytics.",
    es: "También puedes interactuar por voz usando el widget de ElevenLabs en la esquina inferior izquierda. ¡Tour completo! Has visto los 5 agentes, ruteo de intención, y analíticas.",
  },
};

function renderBoldText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: "#fff" }}>{part}</strong> : part);
}

function TourOverlay({ step, lang, onSkip, onNext, onTryChat, onTryStats, onFinish, setLang }) {
  const [spotlightRect, setSpotlightRect] = useState(null);

  const recalcSpotlight = useCallback(() => {
    if (step === 0) { setSpotlightRect(null); return; }
    const selectors = { 1: '[data-tour="agents"]', 2: '[data-tour="input"]', 3: '[data-tour="messages"]', 4: '[data-tour="stats-btn"]', 5: '[data-tour="voice"]' };
    const sel = selectors[step];
    if (!sel) { setSpotlightRect(null); return; }
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else { setSpotlightRect(null); }
  }, [step]);

  useEffect(() => { recalcSpotlight(); }, [recalcSpotlight]);

  useEffect(() => {
    window.addEventListener("resize", recalcSpotlight);
    return () => window.removeEventListener("resize", recalcSpotlight);
  }, [recalcSpotlight]);

  if (step === null || step === undefined) return null;

  const btnPrimary = { background: "linear-gradient(135deg, #6EE7C7, #3B82F6)", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
  const btnGhost = { background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
  const skipLink = { background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif", padding: 0 };

  // Step 0 — welcome modal with language selector
  if (step === 0) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", animation: "fadeIn 0.3s ease" }}>
        <div style={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 32px", maxWidth: 420, width: "90%", textAlign: "center", animation: "welcomePulse 0.4s ease" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #6EE7C7, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>S</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#F9FAFB", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{TOUR_TEXTS[0].title[lang]}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, marginBottom: 4 }}>
            <button onClick={() => setLang('es')} style={{
              padding: '6px 16px', borderRadius: 6,
              border: lang === 'es' ? '2px solid #6EE7C7' : '1px solid #475569',
              background: lang === 'es' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: lang === 'es' ? '#a5b4fc' : '#64748b',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: lang === 'es' ? 700 : 400,
            }}>Espa\u00f1ol</button>
            <button onClick={() => setLang('en')} style={{
              padding: '6px 16px', borderRadius: 6,
              border: lang === 'en' ? '2px solid #6EE7C7' : '1px solid #475569',
              background: lang === 'en' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: lang === 'en' ? '#a5b4fc' : '#64748b',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: lang === 'en' ? 700 : 400,
            }}>English</button>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", margin: "12px 0 24px" }}>{TOUR_TEXTS[0].text[lang]}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={onSkip} style={btnGhost}>{lang === "en" ? "Skip" : "Saltar"}</button>
            <button onClick={() => onNext(1)} style={btnPrimary}>{lang === "en" ? "Start Tour \u2192" : "Iniciar Tour \u2192"}</button>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1-5 — spotlight + tooltip with Next/Try buttons
  const tooltipBelow = step === 1 || step === 4;
  const tooltipStyle = spotlightRect ? {
    position: "fixed",
    zIndex: 10003,
    left: Math.max(12, Math.min(spotlightRect.left, window.innerWidth - 320)),
    top: tooltipBelow ? spotlightRect.top + spotlightRect.height + 16 : spotlightRect.top - 16,
    transform: tooltipBelow ? "none" : "translateY(-100%)",
    width: 300,
    background: "#1A2236",
    border: "1px solid rgba(110,231,199,0.25)",
    borderRadius: 14,
    padding: "16px 18px",
    animation: "slideDown 0.3s ease",
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  } : { position: "fixed", zIndex: 10003, top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 300, background: "#1A2236", border: "1px solid rgba(110,231,199,0.25)", borderRadius: 14, padding: "16px 18px" };

  const text = TOUR_TEXTS[step]?.[lang] || "";

  // Determine button label and action per step
  let btnLabel, btnAction;
  if (step === 1) { btnLabel = lang === "en" ? "Next \u2192" : "Siguiente \u2192"; btnAction = () => onNext(2); }
  else if (step === 2) { btnLabel = lang === "en" ? "Try it \u2192" : "Probar \u2192"; btnAction = () => onTryChat(); }
  else if (step === 3) { btnLabel = lang === "en" ? "Next \u2192" : "Siguiente \u2192"; btnAction = () => onNext(4); }
  else if (step === 4) { btnLabel = lang === "en" ? "Try it \u2192" : "Probar \u2192"; btnAction = () => onTryStats(); }
  else if (step === 5) { btnLabel = lang === "en" ? "Finish Tour \u2713" : "Terminar Tour \u2713"; btnAction = () => onFinish(); }

  return (
    <>
      {/* Backdrop with spotlight cutout via clip-path */}
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", pointerEvents: "none", transition: "all 0.3s ease",
        clipPath: spotlightRect ? `polygon(0% 0%, 0% 100%, ${spotlightRect.left - 8}px 100%, ${spotlightRect.left - 8}px ${spotlightRect.top - 8}px, ${spotlightRect.left + spotlightRect.width + 8}px ${spotlightRect.top - 8}px, ${spotlightRect.left + spotlightRect.width + 8}px ${spotlightRect.top + spotlightRect.height + 8}px, ${spotlightRect.left - 8}px ${spotlightRect.top + spotlightRect.height + 8}px, ${spotlightRect.left - 8}px 100%, 100% 100%, 100% 0%)` : undefined,
      }} />
      {/* Pulsing ring around spotlight */}
      {spotlightRect && (
        <div style={{ position: "fixed", zIndex: 10001, top: spotlightRect.top - 8, left: spotlightRect.left - 8, width: spotlightRect.width + 16, height: spotlightRect.height + 16, borderRadius: 12, border: "2px solid rgba(110,231,199,0.5)", animation: "tourPulse 1.5s ease-in-out infinite", pointerEvents: "none" }} />
      )}
      {/* Clickthrough zone over spotlighted element */}
      {spotlightRect && (
        <div style={{ position: "fixed", zIndex: 10002, top: spotlightRect.top, left: spotlightRect.left, width: spotlightRect.width, height: spotlightRect.height, pointerEvents: "none" }} />
      )}
      {/* Tooltip */}
      <div style={tooltipStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: "rgba(110,231,199,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {lang === "en" ? `Step ${step} of 6` : `Paso ${step} de 6`}
          </span>
          <button onClick={onSkip} style={skipLink}>{lang === "en" ? "Skip Tour" : "Saltar Tour"}</button>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", margin: "0 0 14px" }}>{renderBoldText(text)}</p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={btnAction} style={btnPrimary}>{btnLabel}</button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
let msgId = 0;
const ts = () => new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

export default function SynapseAssistant() {
  useElevenLabsWidget();

  const [messages, setMessages] = useState(() => {
    try { const s = localStorage.getItem("synapse_msgs"); if (s) return JSON.parse(s); } catch {}
    return [{ id: ++msgId, role: "assistant", agent: "orion", content: "¡Hola! Soy el asistente de Synapse. Tengo agentes especializados que te ayudarán al instante. Describe tu consulta y te conectaré con el más indicado.", timestamp: ts() }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState("orion");
  const [showStats, setShowStats] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [lang, setLang] = useState("es");
  const [ratings, setRatings] = useState(() => { try { const s = localStorage.getItem("synapse_ratings"); if (s) return JSON.parse(s); } catch {} return {}; });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ─── TOUR STATE ───
  const [tourStep, setTourStep] = useState(0);
  const tourActive = tourStep !== null;

  useEffect(() => { localStorage.setItem("synapse_msgs", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("synapse_ratings", JSON.stringify(ratings)); }, [ratings]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleRate = useCallback((id, val) => {
    setRatings(prev => { const n = { ...prev }; n[id] = prev[id] === val ? 0 : val; return n; });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, rating: ratings[id] === val ? 0 : val } : m));
  }, [ratings]);

  const clearChat = useCallback(() => {
    const resetMsg = lang === "en" ? "Conversation reset. How can I help you?" : "Conversación reiniciada. ¿En qué te ayudo?";
    setMessages([{ id: ++msgId, role: "assistant", agent: "orion", content: resetMsg, timestamp: ts() }]);
    setRatings({}); setAgent("orion");
    localStorage.removeItem("synapse_msgs"); localStorage.removeItem("synapse_ratings");
  }, [lang]);

  const exportChat = useCallback(() => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = `synapse-chat-${Date.now()}.json`; a.click(); URL.revokeObjectURL(u);
  }, [messages]);

  const suggestions = useMemo(() => getSuggestions(agent, messages.length, lang), [agent, messages.length, lang]);

  // Track which messages are first from their agent
  const firstFromAgent = useMemo(() => {
    const seen = new Set();
    const result = {};
    let lastAgent = null;
    for (const m of messages) {
      if (m.role === "assistant" && m.agent) {
        result[m.id] = m.agent !== lastAgent;
        lastAgent = m.agent;
      }
    }
    return result;
  }, [messages]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");

    // Auto-detect language from user input
    const detected = detectLang(content);
    if (detected) setLang(detected);

    setMessages(prev => [...prev, { id: ++msgId, role: "user", content, timestamp: ts() }]);
    setLoading(true);

    const { agent: target, confidence } = classifyIntent(content);
    const doTransfer = target !== agent;
    if (doTransfer) {
      setMessages(prev => [...prev, { id: ++msgId, role: "transfer", to: target }]);
      setAgent(target);
      await new Promise(r => setTimeout(r, 700));
    }

    // Typing delay varies by agent personality
    const delays = { nova: 900, atlas: 700, aria: 800, nexus: 500, orion: 600 };

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 800,
          system: getSystemPrompt(target),
          messages: messages.filter(m => m.role === "user" || m.role === "assistant").slice(-10).concat([{ role: "user", content }]).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const effectiveLang = detected || lang;
      const reply = data.content?.[0]?.text || getDemoResponse(target, content, effectiveLang);
      setMessages(prev => [...prev, { id: ++msgId, role: "assistant", agent: target, content: reply, timestamp: ts() }]);
    } catch {
      const effectiveLang = detected || lang;
      await new Promise(r => setTimeout(r, delays[target] || 700));
      setMessages(prev => [...prev, { id: ++msgId, role: "assistant", agent: target, content: getDemoResponse(target, content, effectiveLang), timestamp: ts() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const ca = AGENTS[agent];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
        @keyframes msgIn { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes transferFlash { 0%{opacity:0;transform:scaleX(0.8)} 50%{opacity:1} 100%{transform:scaleX(1)} }
        @keyframes welcomePulse { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes tourPulse { 0%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
        *{box-sizing:border-box} textarea:focus{outline:none} textarea{resize:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>

      {/* ElevenLabs Voice Agent */}
      <div data-tour="voice" style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9999 }}
        dangerouslySetInnerHTML={{ __html: '<elevenlabs-convai agent-id="agent_5601kmfx9vnzeb691cj64x2khmm0"></elevenlabs-convai>' }}
      />

      {/* Subtle background glow */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, background: `radial-gradient(circle, ${ca.shadow?.replace("0.3", "0.04")} 0%, transparent 70%)`, pointerEvents: "none", transition: "background 1s ease" }} />

      <div style={{ width: "100%", maxWidth: 520, height: "min(780px, 92vh)", background: "#0F1624", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px ${ca.color}08`, position: "relative", zIndex: 1, transition: "box-shadow 0.5s ease" }}>

        {/* HEADER */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ animation: messages.length <= 1 ? "welcomePulse 0.5s ease" : "none" }}>
              <AgentAvatar agentId={agent} size={42} />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#F9FAFB", letterSpacing: "-0.02em" }}>Synapse</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px #34D399" }} />
                <span style={{ fontSize: 10, color: ca.color, fontWeight: 500, transition: "color 0.3s" }}>{ca.name} · {agentRole(agent, lang)}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setLang("es")} style={{ background: lang === "es" ? `${ca.color}20` : "rgba(255,255,255,0.04)", border: "none", padding: "5px 8px", fontSize: 10, fontWeight: 600, color: lang === "es" ? ca.color : "#6B7280", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", letterSpacing: "0.02em" }}>ES</button>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <button onClick={() => setLang("en")} style={{ background: lang === "en" ? `${ca.color}20` : "rgba(255,255,255,0.04)", border: "none", padding: "5px 8px", fontSize: 10, fontWeight: 600, color: lang === "en" ? ca.color : "#6B7280", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", letterSpacing: "0.02em" }}>EN</button>
            </div>
            <button onClick={() => { setShowInfo(v => !v); setShowStats(false); }} title="Info" style={{ background: showInfo ? `${ca.color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${showInfo ? `${ca.color}25` : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "6px 8px", color: showInfo ? ca.color : "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}>{Icons.info}</button>
            <button data-tour="stats-btn" onClick={() => { setShowStats(v => !v); setShowInfo(false); }} title="Analytics" style={{ background: showStats ? `${ca.color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${showStats ? `${ca.color}25` : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "6px 8px", color: showStats ? ca.color : "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}>{Icons.chart}</button>
            <button onClick={exportChat} title={lang === "en" ? "Export" : "Exportar"} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 8px", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center" }}>{Icons.download}</button>
            <button onClick={clearChat} title={lang === "en" ? "Clear" : "Limpiar"} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 8px", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center" }}>{Icons.trash}</button>
            <button onClick={() => { setTourStep(0); }} title={lang === "en" ? "Tour" : "Tour"} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 8px", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", width: 30, height: 30, justifyContent: "center" }}>?</button>
          </div>
        </div>

        {/* AGENT BAR */}
        <div data-tour="agents" style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", scrollbarWidth: "none" }}>
          {Object.entries(AGENTS).map(([id, ag]) => (
            <button key={id} onClick={() => { setAgent(id); }}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10,
                background: agent === id ? `${ag.color}15` : "rgba(255,255,255,0.03)",
                border: `1px solid ${agent === id ? `${ag.color}30` : "rgba(255,255,255,0.07)"}`,
                cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
              }}
            >
              <AgentAvatar agentId={id} size={22} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: agent === id ? ag.color : "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }}>{ag.name}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{agentRole(id, lang)}</div>
              </div>
            </button>
          ))}
        </div>

        {/* INFO PANEL */}
        {showInfo && (
          <div style={{ padding: "12px 20px", background: `${ca.color}06`, borderBottom: `1px solid ${ca.color}15`, animation: "slideDown 0.25s ease" }}>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              {lang === "en" ? (
                <><strong style={{ color: ca.color }}>5 AI agents</strong> with intent classification, sentiment detection and automatic routing. Each agent has its own personality, knowledge base and tone. Powered by <strong>Claude API</strong>, orchestrated with <strong>n8n</strong>.</>
              ) : (
                <><strong style={{ color: ca.color }}>5 agentes IA</strong> con clasificación de intención, detección de sentimiento y enrutamiento automático. Cada agente tiene personalidad, base de conocimiento y tono propio. Powered by <strong>Claude API</strong>, orquestado con <strong>n8n</strong>.</>
              )}
            </p>
          </div>
        )}

        {/* STATS */}
        {showStats && <StatsPanel messages={messages} ratings={ratings} lang={lang} />}

        {/* MESSAGES */}
        <div data-tour="messages" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
          {messages.map(msg =>
            msg.role === "transfer" ? <TransferIndicator key={msg.id} to={msg.to} lang={lang} /> : <Message key={msg.id} msg={msg} onRate={handleRate} isFirstFromAgent={firstFromAgent[msg.id]} lang={lang} />
          )}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16, animation: "msgIn 0.3s ease" }}>
              <AgentAvatar agentId={agent} />
              <div style={{ background: "#161E2E", border: `1px solid ${ca.color}12`, borderRadius: "18px 18px 18px 4px" }}><TypingDots agent={agent} lang={lang} /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* SUGGESTIONS — single row horizontal scroll */}
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 6, overflowX: "auto", flexWrap: "nowrap", animation: "fadeIn 0.5s ease", scrollbarWidth: "none" }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} disabled={loading} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#9CA3AF",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}
              onMouseEnter={e => { e.target.style.borderColor = `${ca.color}40`; e.target.style.color = ca.color; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.color = "#9CA3AF"; }}
            >{s}</button>
          ))}
        </div>

        {/* INPUT */}
        <div data-tour="input" style={{ padding: "10px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, padding: "10px 14px", transition: "all 0.3s", boxShadow: `0 0 0 1px ${ca.color}08` }}
            onFocus={e => { e.currentTarget.style.borderColor = `${ca.color}35`; e.currentTarget.style.boxShadow = `0 0 0 1px ${ca.color}15`; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = `0 0 0 1px ${ca.color}08`; }}
          >
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={lang === "en" ? "Type your message..." : "Escribe tu consulta..."} rows={1} disabled={loading}
              style={{ flex: 1, background: "transparent", border: "none", color: "#F9FAFB", fontSize: 14, lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: 22, maxHeight: 100, overflowY: "auto" }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
              width: 34, height: 34, borderRadius: 10, background: input.trim() && !loading ? ca.gradient : "rgba(255,255,255,0.06)",
              border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s",
              boxShadow: input.trim() && !loading ? `0 0 12px ${ca.shadow}` : "none", color: "#fff",
            }}>{Icons.send}</button>
          </div>
        </div>
      </div>

      {/* TOUR OVERLAY */}
      {tourActive && (
        <TourOverlay
          step={tourStep}
          lang={lang}
          setLang={setLang}
          onSkip={() => { setTourStep(null); }}
          onNext={(next) => { setTourStep(next); }}
          onTryChat={() => {
            setInput("\u00bfCu\u00e1nto cuesta el plan Pro?");
            setTourStep(null);
            setTimeout(() => {
              sendMessage("\u00bfCu\u00e1nto cuesta el plan Pro?");
              setTimeout(() => setTourStep(3), 1800);
            }, 300);
          }}
          onTryStats={() => {
            setShowStats(true);
            setShowInfo(false);
            setTourStep(5);
          }}
          onFinish={() => { setTourStep(null); }}
        />
      )}
    </div>
  );
}
