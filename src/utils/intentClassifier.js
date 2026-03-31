// Client-side intent classification for routing and demo mode
import { AGENTS } from "../constants/agents.js";
import { KB } from "../constants/knowledgeBase.js";

// ─── SIMPLE INTENT RULES ─────────────────────────────────────────────────
const INTENT_RULES = [
  { agent: "nova", keys: ["plan", "precio", "costo", "comprar", "contratar", "prueba", "trial", "demo", "descuento", "upgrade", "enterprise", "pro", "basico", "básico", "anual", "comparar", "competencia", "roi", "caso de éxito", "funcionalidades", "price", "pricing", "cost", "buy", "purchase", "subscribe", "discount", "annual", "compare", "features", "free trial"] },
  { agent: "atlas", keys: ["error", "problema", "no funciona", "no carga", "bug", "falla", "ayuda técnica", "integración", "configurar", "instalar", "api", "token", "soporte", "429", "lento", "caído", "no conecta", "login", "contraseña", "password", "documentación", "problem", "not working", "broken", "help", "technical", "integration", "configure", "install", "slow", "down", "connect", "documentation", "setup"] },
  { agent: "aria", keys: ["factura", "cobro", "pago", "reembolso", "cancelar", "suscripción", "tarjeta", "cfdi", "devolución", "cargo", "recibo", "renovar", "cambiar plan", "downgrade", "oxxo", "spei", "transferencia", "precio", "invoice", "billing", "payment", "refund", "cancel", "subscription", "card", "charge", "receipt", "renew", "change plan"] },
  { agent: "nexus", keys: ["hablar con alguien", "agente humano", "persona real", "queja", "reclamo", "urgente", "inaceptable", "terrible", "pésimo", "enojado", "frustrado", "molesto", "no me resuelven", "supervisor", "gerente", "harto", "furioso", "talk to someone", "human agent", "real person", "complaint", "urgent", "unacceptable", "angry", "frustrated", "upset", "manager", "supervisor"] },
  { agent: "orion", keys: ["hola", "buenas", "qué hacen", "quiénes son", "horario", "contacto", "ubicación", "seguridad", "datos", "privacidad", "equipo", "empresa", "certificaciones", "gracias", "adiós", "cómo funciona", "hello", "hi", "hey", "who are you", "what do you do", "hours", "contact", "location", "security", "privacy", "team", "company", "thanks", "goodbye", "how does it work"] },
];

export function classifyIntent(text) {
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

// ─── AGENTIC INTENT CLASSIFIER (multi-intent + sentiment) ─────────────

export function classifyIntents(message, lang) {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const intents = [];

  const intentPatterns = {
    pricing: {
      keywords: ['precio','costo','plan','cuanto','tarifa','price','cost','how much','pricing','rate','subscription','descuento','discount','anual','annual','enterprise','pro','basico','comprar','contratar','buy','purchase'],
      weight: 0,
    },
    support: {
      keywords: ['error','problema','no funciona','ayuda','bug','falla','broken','issue','help','not working','crash','slow','lento','429','no carga','login','contrasena','password','configurar','instalar'],
      weight: 0,
    },
    billing: {
      keywords: ['factura','cobro','pago','cancelar','reembolso','invoice','payment','cancel','refund','charge','billing','cfdi','oxxo','spei','transferencia','tarjeta','card','suscripcion','subscription'],
      weight: 0,
    },
    integration: {
      keywords: ['integrar','conectar','api','webhook','slack','whatsapp','zapier','n8n','integrate','connect','teams','hubspot','salesforce','shopify','stripe'],
      weight: 0,
    },
    security: {
      keywords: ['seguro','seguridad','datos','privacidad','cifrado','security','secure','data','privacy','encryption','gdpr','compliance','soc2','iso','certificacion','2fa'],
      weight: 0,
    },
    general: {
      keywords: ['hola','hello','hi','info','informacion','quien','who','que','what','como','how','donde','where','empresa','company','contacto','contact','horario','hours'],
      weight: 0,
    },
  };

  for (const [intent, config] of Object.entries(intentPatterns)) {
    config.weight = config.keywords.filter(k => lower.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))).length;
    if (config.weight > 0) intents.push({ intent, weight: config.weight });
  }

  intents.sort((a, b) => b.weight - a.weight);
  if (intents.length === 0) intents.push({ intent: 'general', weight: 1 });

  return intents;
}

export function analyzeSentiment(message) {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const frustrated = ['frustrado','harto','terrible','molesto','enojado','angry','frustrated','annoyed','awful','worst','hate','furious','disappointed','inaceptable','unacceptable','pesimo','queja','complaint'];
  const urgent = ['urgente','ahora','ya','inmediato','urgent','now','immediately','asap','emergency'];
  const positive = ['gracias','excelente','genial','thanks','great','awesome','love','perfect','perfecto'];

  const norm = (w) => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const frustrationScore = frustrated.filter(w => lower.includes(norm(w))).length;
  const urgencyScore = urgent.filter(w => lower.includes(norm(w))).length;
  const positiveScore = positive.filter(w => lower.includes(norm(w))).length;

  if (frustrationScore >= 2) return { sentiment: 'frustrated', escalate: true };
  if (frustrationScore >= 1 || urgencyScore >= 1) return { sentiment: 'urgent', escalate: false };
  if (positiveScore >= 1) return { sentiment: 'positive', escalate: false };
  return { sentiment: 'neutral', escalate: false };
}

export function buildContext(intents, lang) {
  const intentToKB = {
    pricing: 'ventas',
    support: 'soporte',
    billing: 'facturacion',
    integration: 'integraciones',
    security: 'seguridad',
    general: 'general',
  };

  const context = [];
  intents.forEach(({ intent }) => {
    const kbKey = intentToKB[intent];
    if (kbKey && KB[kbKey]) {
      context.push({ topic: intent, data: KB[kbKey] });
    }
  });
  return context;
}

export function routeToAgent(intents, sentiment) {
  if (sentiment.escalate) return 'nexus';
  const primary = intents[0]?.intent || 'general';
  const agentMap = { pricing: 'nova', support: 'atlas', billing: 'aria', integration: 'atlas', security: 'orion', general: 'orion' };
  return agentMap[primary] || 'orion';
}
