import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { classifyIntent } from './agents/classifier.js';
import { handleSales } from './agents/sales.js';
import { handleSupport } from './agents/support.js';
import { handleBilling } from './agents/billing.js';
import { handleEscalation } from './agents/escalation.js';
import { handleGeneral } from './agents/general.js';

const app = express();
const PORT = process.env.PORT || 3010;
const START_TIME = Date.now();

// ─── Structured logging ──────────────────────────────────────
function log(level, msg, meta = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta,
  };
  console.log(JSON.stringify(entry));
}

// ─── CORS with preflight ────────────────────────────────────
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  credentials: true,
}));
app.options('*', cors());

app.use(express.json({ limit: '10kb' }));

// ─── Rate limiting (in-memory, per IP) ──────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { windowStart: now, count: 0 };
    rateLimitMap.set(ip, entry);
  }

  entry.count++;
  return {
    allowed: entry.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetAt: entry.windowStart + RATE_LIMIT_WINDOW_MS,
  };
}

// Periodic cleanup of stale rate limit entries (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 300_000);

// Rate limit middleware
app.use('/api/chat', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  res.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
  res.set('X-RateLimit-Remaining', String(remaining));
  res.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

  if (!allowed) {
    log('warn', 'Rate limit exceeded', { ip });
    return res.status(429).json({
      error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterMs: resetAt - Date.now(),
    });
  }
  next();
});

// ─── Agent config ───────────────────────────────────────────
const AGENT_HANDLERS = {
  VENTAS: handleSales,
  SOPORTE: handleSupport,
  FACTURACION: handleBilling,
  ESCALAMIENTO: handleEscalation,
  GENERAL: handleGeneral,
};

const AGENT_LABELS = {
  VENTAS: 'Agente Ventas',
  SOPORTE: 'Agente Soporte',
  FACTURACION: 'Agente Facturación',
  ESCALAMIENTO: 'Agente Escalamiento',
  GENERAL: 'Agente General',
};

// ─── Stats tracking ─────────────────────────────────────────
const stats = {
  totalMessages: 0,
  byAgent: { VENTAS: 0, SOPORTE: 0, FACTURACION: 0, ESCALAMIENTO: 0, GENERAL: 0 },
  errors: 0,
  demoMessages: 0,
  liveMessages: 0,
};

// ─── Session conversation context (in-memory) ──────────────
const sessionStore = new Map();
const SESSION_MAX_MESSAGES = 50;
const SESSION_TTL_MS = 30 * 60_000; // 30 minutes

function getSession(sessionId) {
  if (!sessionId) return null;
  let session = sessionStore.get(sessionId);
  if (!session) {
    session = { messages: [], createdAt: Date.now(), lastActivity: Date.now() };
    sessionStore.set(sessionId, session);
  }
  session.lastActivity = Date.now();
  return session;
}

function addToSession(sessionId, role, content) {
  const session = getSession(sessionId);
  if (!session) return;
  session.messages.push({ role, content, ts: Date.now() });
  if (session.messages.length > SESSION_MAX_MESSAGES) {
    session.messages = session.messages.slice(-SESSION_MAX_MESSAGES);
  }
}

// Periodic cleanup of expired sessions (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessionStore) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessionStore.delete(id);
    }
  }
}, 300_000);

// ─── Anthropic client ───────────────────────────────────────
let client = null;
function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('TU_CLAVE')) {
      return null;
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const uptimeMs = Date.now() - START_TIME;
  const uptimeMin = Math.floor(uptimeMs / 60_000);
  const hasKey = !!getClient();

  res.json({
    status: 'ok',
    uptime: `${uptimeMin}m`,
    uptimeMs,
    mode: hasKey ? 'live' : 'demo',
    agents: Object.entries(AGENT_LABELS).map(([key, label]) => ({
      id: key,
      label,
      status: 'active',
    })),
    hasApiKey: hasKey,
    activeSessions: sessionStore.size,
    timestamp: new Date().toISOString(),
  });
});

// ─── Stats endpoint ─────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const uptimeMs = Date.now() - START_TIME;
  res.json({
    uptime: `${Math.floor(uptimeMs / 60_000)}m`,
    totalMessages: stats.totalMessages,
    byAgent: { ...stats.byAgent },
    errors: stats.errors,
    demoMessages: stats.demoMessages,
    liveMessages: stats.liveMessages,
    activeSessions: sessionStore.size,
    topAgent: Object.entries(stats.byAgent).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
  });
});

// ─── Main chat endpoint ─────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  // Request validation
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Body inválido', code: 'INVALID_BODY' });
  }

  const { message, messages = [], userName = 'Usuario', sessionId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Se requiere un campo "message" de tipo string', code: 'MISSING_MESSAGE' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'El mensaje excede el límite de 2000 caracteres', code: 'MESSAGE_TOO_LONG' });
  }

  const sid = sessionId || 'default';
  stats.totalMessages++;

  const anthropic = getClient();

  // Demo mode: respond without API key using simple pattern matching
  if (!anthropic) {
    stats.demoMessages++;
    const demoResponse = getDemoResponse(message, userName, messages);
    addToSession(sid, 'user', message);
    addToSession(sid, 'assistant', demoResponse.response);
    return res.json(demoResponse);
  }

  // ─── Live mode (Claude API) ───────────────────────────────
  try {
    stats.liveMessages++;
    const startMs = Date.now();

    // Step 1: Classify intent (now returns { agent, confidence, reasoning, secondary })
    const classification = await classifyIntent(anthropic, message);

    log('info', 'Intent classified', {
      agent: classification.agent,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      secondary: classification.secondary?.agent || null,
      sessionId: sid,
    });

    // Step 2: Build conversation history for the agent
    // Merge session history with frontend-provided messages
    const session = getSession(sid);
    const sessionHistory = session ? session.messages.map((m) => ({ role: m.role, content: m.content })) : [];
    const frontendHistory = messages.map((m) => ({ role: m.role, content: m.content }));

    // Prefer frontend history if provided, otherwise use session
    const baseHistory = frontendHistory.length > 0 ? frontendHistory : sessionHistory;
    const history = [
      ...baseHistory,
      { role: 'user', content: message },
    ];

    // Step 3: Route to the correct agent
    const category = classification.agent;
    const handler = AGENT_HANDLERS[category];
    const response = await handler(anthropic, message, history, userName);

    const durationMs = Date.now() - startMs;
    stats.byAgent[category] = (stats.byAgent[category] || 0) + 1;

    // Store in session
    addToSession(sid, 'user', message);
    addToSession(sid, 'assistant', response);

    log('info', 'Response sent', {
      agent: category,
      confidence: classification.confidence,
      durationMs,
      sessionId: sid,
    });

    // Step 4: Return response
    res.json({
      response,
      agent: AGENT_LABELS[category],
      category,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      secondary: classification.secondary
        ? { agent: AGENT_LABELS[classification.secondary.agent], confidence: classification.secondary.confidence }
        : null,
    });
  } catch (error) {
    stats.errors++;
    log('error', 'Chat processing failed', {
      error: error.message,
      status: error.status,
      sessionId: sid,
    });

    if (error.status === 401) {
      return res.json(getDemoResponse(message, userName, messages));
    }

    if (error.status === 429) {
      return res.status(503).json({
        error: 'El servicio está temporalmente saturado. Intenta en unos segundos.',
        code: 'API_RATE_LIMITED',
        response: 'Estoy recibiendo muchas consultas en este momento. ¿Puedes intentar en unos segundos?',
        agent: 'Sistema',
        category: 'ERROR',
      });
    }

    res.status(500).json({
      error: 'Error procesando el mensaje',
      code: 'INTERNAL_ERROR',
      response: 'Tuve un problema procesando tu consulta. Por favor intenta de nuevo.',
      agent: 'Sistema',
      category: 'ERROR',
    });
  }
});

// ─── Demo mode (no API key) ─────────────────────────────────

// Conversation context store (in-memory, keyed by simple session)
const conversationContext = new Map();

function getSessionContext(sessionId = 'default') {
  if (!conversationContext.has(sessionId)) {
    conversationContext.set(sessionId, {
      lastCategory: null,
      messageCount: 0,
      topicsDiscussed: [],
      lastResponseIndex: {},
      userName: 'Usuario',
      sentiment: 'neutral', // neutral, positive, negative, frustrated
    });
  }
  return conversationContext.get(sessionId);
}

// ─── Intent patterns with keywords, phrases, and contextual clues ───
const INTENT_PATTERNS = {
  VENTAS: {
    keywords: ['precio', 'plan', 'costo', 'cuanto', 'cuánto', 'contratar', 'demo', 'prueba', 'comprar', 'adquirir', 'cotización', 'cotizacion', 'paquete', 'licencia', 'descuento', 'oferta', 'promoción', 'promocion', 'gratis', 'free', 'trial', 'mensual', 'anual', 'barato', 'económico', 'economico', 'inversión', 'inversion'],
    phrases: ['cuanto cuesta', 'cuanto vale', 'que planes', 'qué planes', 'tienen planes', 'quiero comprar', 'me interesa', 'quiero contratar', 'puedo probar', 'hay descuento', 'version gratuita', 'versión gratuita', 'quiero saber mas', 'quiero saber más', 'info de precios', 'como empiezo', 'cómo empiezo', 'que incluye', 'qué incluye', 'cual es el precio', 'cuál es el precio', 'tienen algun plan', 'tienen algún plan', 'cuanto sale', 'cuánto sale', 'que ofrecen', 'qué ofrecen', 'cual recomiendan', 'cuál recomiendan', 'hay prueba gratis', 'periodo de prueba', 'como contrato', 'cómo contrato', 'y el enterprise', 'y el pro', 'y el basico', 'y el básico'],
    contextual: ['empezar', 'iniciar', 'probar', 'ver', 'conocer', 'explorar', 'interesante', 'suena bien'],
    weight: 1.0,
  },
  SOPORTE: {
    keywords: ['error', 'problema', 'funciona', 'ayuda', 'bug', 'falla', 'fallo', 'roto', 'lento', 'carga', 'configurar', 'configuración', 'configuracion', 'integración', 'integracion', 'integrar', 'conectar', 'instalar', 'actualizar', 'crashea', 'crasheo', 'tronó', 'trono', 'descompuso'],
    phrases: ['no funciona', 'no puedo', 'no me deja', 'se cayo', 'se cayó', 'no carga', 'esta roto', 'está roto', 'tengo un problema', 'necesito ayuda', 'como configuro', 'cómo configuro', 'no se como', 'no sé como', 'no sé cómo', 'me sale error', 'no abre', 'se traba', 'se congela', 'pantalla blanca', 'no responde', 'se queda cargando', 'no me aparece', 'sale mal', 'no conecta', 'no jala', 'no sirve', 'truena', 'esta lento', 'está lento', 'como hago para', 'cómo hago para', 'no encuentro', 'donde esta', 'dónde está'],
    contextual: ['intenté', 'intente', 'probé', 'probe', 'reinicié', 'reinicie', 'actualicé', 'actualice', 'antes funcionaba', 'ya no'],
    weight: 1.0,
  },
  FACTURACION: {
    keywords: ['factura', 'cobro', 'pago', 'reembolso', 'cancelar', 'suscripción', 'suscripcion', 'tarjeta', 'recibo', 'cargo', 'devolucion', 'devolución', 'renovar', 'renovación', 'renovacion', 'vencimiento', 'dinero', 'cuenta', 'facturación', 'facturacion'],
    phrases: ['me cobraron', 'quiero cancelar', 'doble cobro', 'cargo no reconocido', 'quiero mi dinero', 'devolver el dinero', 'no autoricé', 'no autorice', 'cambiar tarjeta', 'actualizar pago', 'cuando vence', 'cuándo vence', 'descargar factura', 'necesito factura', 'datos fiscales', 'me llegó un cobro', 'me llego un cobro', 'quiero un recibo', 'como pago', 'cómo pago', 'metodos de pago', 'métodos de pago', 'aceptan tarjeta', 'aceptan transferencia', 'quiero cambiar de plan', 'subir de plan', 'bajar de plan', 'cancelar mi cuenta', 'dar de baja'],
    contextual: ['banco', 'transferencia', 'efectivo', 'paypal', 'stripe', 'oxxo', 'spei'],
    weight: 1.0,
  },
  ESCALAMIENTO: {
    keywords: ['queja', 'humano', 'persona', 'supervisor', 'gerente', 'jefe', 'urgente', 'inaceptable', 'terrible', 'pésimo', 'pesimo', 'demanda', 'abogado', 'legal', 'harto', 'colmo'],
    phrases: ['hablar con alguien', 'hablar con humano', 'quiero hablar con', 'esto es inaceptable', 'estoy harto', 'me voy', 'cancelo todo', 'voy a denunciar', 'peor servicio', 'mala experiencia', 'ya no aguanto', 'llevo mucho tiempo', 'nadie me ayuda', 'necesito hablar con una persona real', 'quiero poner una queja', 'no me resuelven', 'es una burla', 'esto es un robo', 'ya me cansé', 'ya me canse', 'los voy a reportar', 'pásame con alguien', 'pasame con alguien', 'quiero a tu supervisor', 'esto es urgente'],
    contextual: ['enojado', 'molesto', 'furioso', 'frustrado', 'decepcionado', 'harta', 'hartos', 'indignado', 'indignada'],
    weight: 1.2, // slightly higher weight — escalation is important to catch
  },
  GREETING: {
    keywords: ['hola', 'hey', 'buenas', 'buenos', 'saludos', 'hi', 'hello', 'ey', 'oye', 'ola'],
    phrases: ['buen día', 'buen dia', 'buenas tardes', 'buenas noches', 'como estas', 'cómo estás', 'que tal', 'qué tal', 'que onda', 'qué onda', 'que hay', 'qué hay', 'que hubo', 'qué hubo', 'que pedo', 'como te va', 'cómo te va', 'como andas', 'cómo andas'],
    contextual: [],
    weight: 0.8,
  },
  FAREWELL: {
    keywords: ['adiós', 'adios', 'bye', 'chao', 'chau', 'gracias', 'vale', 'ok'],
    phrases: ['muchas gracias', 'hasta luego', 'nos vemos', 'que tengas buen día', 'que tengas buen dia', 'es todo', 'eso es todo', 'ya no necesito nada', 'era todo', 'solo eso', 'nada más', 'nada mas', 'ok gracias', 'listo gracias', 'perfecto gracias', 'con eso me queda claro', 'gracias por tu ayuda', 'muchas gracias por la info', 'te agradezco'],
    contextual: ['genial', 'perfecto', 'excelente', 'bueno', 'sale', 'va'],
    weight: 0.9,
  },
  GENERAL: {
    keywords: ['horario', 'contacto', 'teléfono', 'telefono', 'email', 'correo', 'dirección', 'direccion', 'ubicación', 'ubicacion', 'quienes', 'quiénes', 'empresa', 'servicio', 'servicios'],
    phrases: ['donde están', 'dónde están', 'quienes son', 'quiénes son', 'que hacen', 'qué hacen', 'a que se dedican', 'a qué se dedican', 'como los contacto', 'cómo los contacto', 'tienen teléfono', 'tienen telefono', 'tienen whatsapp', 'tienen redes', 'como funciona', 'cómo funciona', 'que es esto', 'qué es esto', 'para que sirve', 'para qué sirve'],
    contextual: ['info', 'información', 'informacion', 'saber', 'dudas'],
    weight: 0.6, // lower weight — acts as fallback
  },
};

// ─── Scoring engine ─────────────────────────────────────────
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents for fuzzy matching
    .replace(/[¿¡!?.,:;()]/g, '')
    .trim();
}

function scoreIntent(message, intentKey, ctx) {
  const pattern = INTENT_PATTERNS[intentKey];
  const normalized = normalizeText(message);
  let score = 0;

  // Exact keyword matches (each hit = 2 points)
  for (const kw of pattern.keywords) {
    const normalizedKw = normalizeText(kw);
    if (normalized.includes(normalizedKw)) {
      score += 2;
    }
  }

  // Phrase matches (each hit = 4 points — more specific)
  for (const phrase of pattern.phrases) {
    const normalizedPhrase = normalizeText(phrase);
    if (normalized.includes(normalizedPhrase)) {
      score += 4;
    }
  }

  // Contextual matches (each hit = 1 point)
  for (const cw of pattern.contextual) {
    const normalizedCw = normalizeText(cw);
    if (normalized.includes(normalizedCw)) {
      score += 1;
    }
  }

  // Context bonus: if last conversation was same category, boost score
  if (ctx.lastCategory === intentKey && score > 0) {
    score += 2;
  }

  // Apply weight
  score *= pattern.weight;

  return score;
}

function classifyDemoIntent(message, ctx) {
  const scores = {};
  let maxScore = 0;
  let bestIntent = 'GENERAL';

  for (const intentKey of Object.keys(INTENT_PATTERNS)) {
    scores[intentKey] = scoreIntent(message, intentKey, ctx);
    if (scores[intentKey] > maxScore) {
      maxScore = scores[intentKey];
      bestIntent = intentKey;
    }
  }

  // If no strong match found, check for edge cases
  if (maxScore < 1) {
    const trimmed = message.trim();
    if (trimmed === '?' || trimmed === '??') return 'CONFUSED';
    if (trimmed.length <= 2) return 'CONFUSED';
    if (/^[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]+$/.test(trimmed)) return 'GIBBERISH';
    return 'CATCHALL';
  }

  return bestIntent;
}

// ─── Detect sentiment ────────────────────────────────────────
function detectSentiment(message) {
  const normalized = normalizeText(message);
  const negativeWords = ['enojado', 'molesto', 'furioso', 'frustrado', 'harto', 'harta', 'terrible', 'pesimo', 'inaceptable', 'peor', 'odio', 'asco', 'basura', 'mierda', 'chingada', 'pinche', 'pendejo', 'idiota', 'estupido', 'inutil', 'porqueria'];
  const positiveWords = ['genial', 'excelente', 'perfecto', 'increible', 'gracias', 'padre', 'chido', 'buenisimo', 'fantastico', 'maravilloso', 'encanta', 'amo', 'super', 'wow'];

  let neg = 0, pos = 0;
  for (const w of negativeWords) { if (normalized.includes(w)) neg++; }
  for (const w of positiveWords) { if (normalized.includes(w)) pos++; }

  if (neg >= 2) return 'frustrated';
  if (neg >= 1) return 'negative';
  if (pos >= 1) return 'positive';
  return 'neutral';
}

// ─── Response pools ──────────────────────────────────────────
function nameInsert(userName) {
  return userName && userName !== 'Usuario' ? ` ${userName}` : '';
}

function pickResponse(responses, intentKey, ctx) {
  // Rotate through responses to avoid repetition
  if (!ctx.lastResponseIndex[intentKey]) {
    ctx.lastResponseIndex[intentKey] = 0;
  }
  const idx = ctx.lastResponseIndex[intentKey] % responses.length;
  ctx.lastResponseIndex[intentKey] = idx + 1;
  return responses[idx];
}

const RESPONSE_POOLS = {
  GREETING: (ctx) => {
    const name = nameInsert(ctx.userName);
    const responses = [
      `¡Hola${name}! ¿Cómo estás? Soy Nova 😊 ¿En qué te puedo echar la mano hoy?`,
      `¡Hey${name}! Qué gusto saludarte 👋 Soy Nova, cuéntame, ¿en qué te ayudo?`,
      `¡Buenas${name}! Soy Nova, estoy aquí para lo que necesites 😊 ¿Qué se te ofrece?`,
      `¡Hola${name}! ¿Qué tal? Aquí Nova, lista para ayudarte. ¿En qué puedo apoyarte?`,
    ];
    return { response: pickResponse(responses, 'GREETING', ctx), agent: 'Nova', category: 'GENERAL' };
  },

  FAREWELL: (ctx) => {
    const name = nameInsert(ctx.userName);
    let responses;

    if (normalizeText(ctx.lastMessage || '').match(/gracia/)) {
      responses = [
        `¡De nada${name}! Fue un gusto ayudarte 😊 Si necesitas algo más, aquí estaré.`,
        `¡Con mucho gusto${name}! No dudes en regresar si surge algo más, ¿sale? 👋`,
        `¡Para eso estamos${name}! Que te vaya increíble. Aquí me tienes cuando quieras 😄`,
      ];
    } else {
      responses = [
        `¡Hasta luego${name}! Fue un placer. Aquí estaré si necesitas algo 👋`,
        `¡Nos vemos${name}! Que tengas un excelente día 😊`,
        `¡Sale${name}! Cualquier cosa, sabes que aquí andamos. ¡Cuídate! ✨`,
      ];
    }
    return { response: pickResponse(responses, 'FAREWELL', ctx), agent: 'Nova', category: 'GENERAL' };
  },

  VENTAS: (ctx) => {
    const name = nameInsert(ctx.userName);
    const normalized = normalizeText(ctx.lastMessage || '');

    // Context-aware: if they already asked about plans and now ask about a specific one
    if (ctx.topicsDiscussed.includes('VENTAS')) {
      if (normalized.match(/enterprise|empresarial|ilimitado/)) {
        const responses = [
          `¡El plan Enterprise es nuestro más completo${name}! 🏢\n\n• **Usuarios ilimitados** para todo tu equipo\n• **SLA garantizado** con soporte prioritario 24/7\n• **Integraciones custom** (Salesforce, SAP, etc.)\n• **Manager de cuenta dedicado**\n• **Onboarding personalizado** con tu equipo\n\nEl precio se ajusta a tu empresa. ¿Te gustaría que agendemos una llamada para cotizarte? Solo toma 15 min 📞`,
          `¡Claro! Enterprise es para equipos que van en serio${name} 💪\n\n• Sin límite de usuarios ni consultas\n• Soporte prioritario con SLA\n• Integraciones a la medida\n• Tu propio account manager\n\nComo es personalizado, lo ideal es agendar una llamada rápida para entender tus necesidades. ¿Te late? 🤝`,
        ];
        return { response: pickResponse(responses, 'VENTAS_ENTERPRISE', ctx), agent: 'Agente Ventas', category: 'VENTAS' };
      }
      if (normalized.match(/pro|profesional|medio/)) {
        const responses = [
          `¡El plan Pro es nuestro más popular${name}! 🌟\n\n• **Hasta 10 usuarios**\n• **Todas las integraciones** (Slack, Teams, Notion, etc.)\n• **Reportes avanzados** y analytics\n• **Soporte prioritario** por chat y email\n• **API access** para automatizaciones\n\nTodo esto por **$199/mes**. Y con pago anual te ahorras 2 meses 🎉 ¿Quieres activar tu prueba gratuita?`,
        ];
        return { response: pickResponse(responses, 'VENTAS_PRO', ctx), agent: 'Agente Ventas', category: 'VENTAS' };
      }
      if (normalized.match(/basic|basico|básico|barato|económico|economico|sencill/)) {
        const responses = [
          `¡El plan Básico es perfecto para empezar${name}! ✨\n\n• **Hasta 3 usuarios**\n• **Chat ilimitado** con IA\n• **Integraciones básicas** (email, web widget)\n• **Reportes mensuales**\n• **Soporte por email**\n\nPor solo **$99/mes**. Y la prueba de 14 días es sin compromiso, ni tarjeta 😊 ¿Le entramos?`,
        ];
        return { response: pickResponse(responses, 'VENTAS_BASIC', ctx), agent: 'Agente Ventas', category: 'VENTAS' };
      }
      // Follow-up about pricing in general
      const followUp = [
        `¿Te quedó alguna duda sobre los planes${name}? Con gusto te aclaro lo que necesites 😊\n\nPor cierto, todos incluyen **14 días de prueba gratis** sin meter tarjeta. Es la mejor forma de probar.`,
        `¿Hay algo específico que quieras saber sobre algún plan en particular${name}? Puedo darte todos los detalles que necesites 👍`,
      ];
      return { response: pickResponse(followUp, 'VENTAS_FOLLOWUP', ctx), agent: 'Agente Ventas', category: 'VENTAS' };
    }

    // First time asking about sales
    const responses = [
      `¡Me da gusto que te interese${name}! 😊 Te cuento sobre nuestros planes:\n\n• **Básico** — $99/mes (hasta 3 usuarios, ideal para empezar)\n• **Pro** — $199/mes (hasta 10 usuarios + todas las integraciones) ⭐ *Más popular*\n• **Enterprise** — Precio a la medida (sin límites + SLA + soporte dedicado)\n\nTodos incluyen **14 días de prueba gratuita** sin tarjeta. ¿Cuál te llama la atención? 🤔`,
      `¡Claro que sí${name}! Déjame explicarte las opciones:\n\n📦 **Básico** — $99/mes\n→ 3 usuarios, chat IA ilimitado, integraciones básicas\n\n🚀 **Pro** — $199/mes *(el favorito)*\n→ 10 usuarios, todas las integraciones, reportes avanzados\n\n🏢 **Enterprise** — Precio personalizado\n→ Sin límites, SLA, account manager dedicado\n\n¿Quieres que te cuente más de alguno en particular? Todos tienen prueba gratis de 14 días 🎉`,
      `¡Perfecto${name}! Justo tenemos opciones que se adaptan a diferentes necesidades:\n\n| Plan | Precio | Usuarios | Lo mejor |\n|------|--------|----------|----------|\n| Básico | $99/mes | 3 | Para arrancar |\n| Pro | $199/mes | 10 | El más completo |\n| Enterprise | Custom | ∞ | Para grandes equipos |\n\n¿Alguno te llama la atención? Con gusto te doy más detalles 😊`,
    ];
    return { response: pickResponse(responses, 'VENTAS', ctx), agent: 'Agente Ventas', category: 'VENTAS' };
  },

  SOPORTE: (ctx) => {
    const name = nameInsert(ctx.userName);
    const normalized = normalizeText(ctx.lastMessage || '');

    // Check for specific issues
    if (normalized.match(/lento|tarda|demora|carga|cargando/)) {
      const responses = [
        `Entiendo la frustración${name}, nadie quiere que las cosas vayan lento 😅\n\nVamos a resolverlo. ¿Podrías intentar estos pasos?\n\n1. **Limpia el caché** de tu navegador (Ctrl+Shift+Supr)\n2. **Prueba en modo incógnito** para descartar extensiones\n3. **Revisa tu conexión** — a veces es el WiFi 📶\n\nSi sigue lento después de eso, puede ser algo de nuestro lado y lo escalamos. ¿Cómo te fue?`,
        `¡Uy, qué molesto cuando pasa eso${name}! 😤 Vamos a solucionarlo.\n\nPrimero, ¿desde cuándo notas la lentitud? ¿Es en alguna sección específica o en todo?\n\nMientras tanto, prueba:\n• Limpiar caché del navegador\n• Probar desde otro navegador\n• Verificar que no tengas muchas pestañas abiertas\n\nCuéntame qué pasa y lo vemos juntos 💪`,
      ];
      return { response: pickResponse(responses, 'SOPORTE_LENTO', ctx), agent: 'Agente Soporte', category: 'SOPORTE' };
    }

    if (normalized.match(/error|falla|fallo|crashe|trono|truena|bug/)) {
      const responses = [
        `¡Ay no${name}! Vamos a arreglarlo 🔧\n\n¿Me podrías compartir estos datos para diagnosticar más rápido?\n\n1. **¿Qué error aparece?** (si hay un mensaje o código)\n2. **¿En qué sección** estabas cuando pasó?\n3. **¿Qué navegador** usas? (Chrome, Firefox, Safari...)\n4. **¿Es la primera vez** que pasa o ya es recurrente?\n\nCon eso puedo guiarte mejor. Mientras tanto, intenta recargar la página con Ctrl+F5 😊`,
        `¡Vamos a resolverlo${name}! Los errores son molestos pero casi siempre tienen solución rápida 💪\n\n¿Puedes contarme un poquito más? Por ejemplo:\n• ¿Qué estabas haciendo cuando apareció el error?\n• ¿Ves algún mensaje en pantalla?\n• ¿En qué dispositivo estás?\n\nAsí te puedo dar una solución más precisa 🎯`,
      ];
      return { response: pickResponse(responses, 'SOPORTE_ERROR', ctx), agent: 'Agente Soporte', category: 'SOPORTE' };
    }

    if (normalized.match(/configur|integr|conectar|instalar/)) {
      const responses = [
        `¡Claro${name}! Las integraciones son súper útiles 🔌\n\nTenemos guías paso a paso para las más populares:\n\n• **Slack** — Se conecta en 2 clics desde Panel > Integraciones\n• **Teams** — Necesitas permisos de admin en Microsoft 365\n• **Notion** — Token de integración desde Notion > Settings\n• **Zapier/n8n** — Usa nuestra API key desde Panel > API\n\n¿Cuál quieres configurar? Te guío paso a paso 🚀`,
        `¡Con gusto te ayudo con la configuración${name}! 🛠️\n\n¿Qué es lo que necesitas configurar o integrar? Te puedo guiar con:\n\n• Integraciones con herramientas (Slack, Teams, etc.)\n• Configuración inicial de tu cuenta\n• Personalización del chat widget\n• Conexión con tu CRM\n\nCuéntame y vamos paso a paso 😊`,
      ];
      return { response: pickResponse(responses, 'SOPORTE_CONFIG', ctx), agent: 'Agente Soporte', category: 'SOPORTE' };
    }

    // Generic support
    const responses = [
      `Entiendo que tienes un tema técnico${name}. ¡Aquí estoy para ayudarte! 🔧\n\nPara darte la mejor solución, cuéntame:\n• ¿Qué es lo que está pasando exactamente?\n• ¿Desde cuándo lo notas?\n• ¿Ya intentaste algo para resolverlo?\n\nEntre más detalles me des, más rápido lo resolvemos juntos 💪`,
      `¡No te preocupes${name}! Vamos a solucionarlo 😊\n\nDescríbeme lo que pasa con el mayor detalle posible:\n• ¿Qué esperabas que pasara?\n• ¿Qué pasó en realidad?\n• ¿Hay algún mensaje de error?\n\nTambién puedes mandarnos capturas a soporte@empresa.com si es más fácil. ¡Estamos para ayudarte!`,
      `¡Cuenta conmigo${name}! 🙌 Nuestro horario de soporte es lunes a viernes, 9am-7pm (CDMX), pero ahorita mismo te puedo orientar.\n\n¿Me cuentas qué problema tienes? Con gusto te doy los pasos para resolverlo o lo escalo con el equipo técnico.`,
    ];
    return { response: pickResponse(responses, 'SOPORTE', ctx), agent: 'Agente Soporte', category: 'SOPORTE' };
  },

  FACTURACION: (ctx) => {
    const name = nameInsert(ctx.userName);
    const normalized = normalizeText(ctx.lastMessage || '');

    if (normalized.match(/cancelar|baja|dar de baja/)) {
      const responses = [
        `Entiendo${name}, antes de cancelar me gustaría entender qué pasó 🥺\n\n¿Hay algo que podamos mejorar? A veces podemos:\n• **Pausar** tu suscripción en vez de cancelar\n• **Ajustar tu plan** a uno que se adapte mejor\n• **Resolver** algún problema que esté causando la insatisfacción\n\nSi de todas formas prefieres cancelar, puedes hacerlo desde **Panel > Configuración > Suscripción > Cancelar plan**. El reembolso aplica si llevas menos de 30 días.`,
        `Me da pena escuchar eso${name} 😔 ¿Puedo preguntar qué te llevó a querer cancelar?\n\nSi es un tema de precio, funcionalidad o servicio, tal vez pueda ayudarte antes. Y si ya lo decidiste, respeto tu decisión:\n\n📍 **Panel > Configuración > Suscripción > Cancelar**\n\nEl reembolso completo aplica dentro de los primeros 30 días.`,
      ];
      return { response: pickResponse(responses, 'FACTURACION_CANCEL', ctx), agent: 'Agente Facturación', category: 'FACTURACION' };
    }

    if (normalized.match(/reembolso|devol|devolver|dinero/)) {
      const responses = [
        `¡Claro${name}! Tu satisfacción es lo más importante 💚\n\nNuestra política de reembolso:\n\n• **Primeros 30 días** → Reembolso completo, sin preguntas\n• **Después de 30 días** → Reembolso proporcional según caso\n• **Cobros duplicados** → Reembolso inmediato + disculpas 😅\n\nPara solicitarlo, ve a **Panel > Configuración > Historial de pagos > Solicitar reembolso**, o respóndeme aquí con tu email de cuenta y lo proceso yo.`,
      ];
      return { response: pickResponse(responses, 'FACTURACION_REEMBOLSO', ctx), agent: 'Agente Facturación', category: 'FACTURACION' };
    }

    if (normalized.match(/cobr|cargo|duplicado|doble|no autorice/)) {
      const responses = [
        `¡Uy${name}! Si hay un cobro que no reconoces, lo revisamos de inmediato 🔍\n\n¿Podrías decirme?\n• **Monto** del cobro\n• **Fecha** aproximada\n• **Email** de tu cuenta\n\nSi es un cobro duplicado, te lo reembolsamos de volada. Nunca queremos que pagues de más 😊`,
      ];
      return { response: pickResponse(responses, 'FACTURACION_COBRO', ctx), agent: 'Agente Facturación', category: 'FACTURACION' };
    }

    // Generic billing
    const responses = [
      `¡Con gusto te ayudo con tu consulta de facturación${name}! 💳\n\nTe comparto info útil:\n\n• 📄 **Facturas** → Panel > Configuración > Historial de pagos\n• 💳 **Cambiar tarjeta** → Panel > Configuración > Método de pago\n• 🔄 **Cambiar plan** → Panel > Configuración > Suscripción\n• 📧 **Datos fiscales** → Panel > Configuración > Facturación\n\n¿Cuál es tu situación? Cuéntame y te oriento 😊`,
      `¡Claro${name}! ¿Qué necesitas sobre tu facturación? Puedo ayudarte con:\n\n• Descargar facturas y recibos\n• Actualizar método de pago\n• Solicitar reembolsos\n• Cambiar o cancelar tu plan\n• Datos fiscales\n\n¿Qué se te ofrece? 😊`,
      `¡Aquí estoy para lo de facturación${name}! 📋\n\nCuéntame qué necesitas. Los temas más comunes que resolvemos rápido:\n\n✅ Facturas y recibos\n✅ Cobros no reconocidos\n✅ Cambios de plan\n✅ Reembolsos\n✅ Métodos de pago\n\n¿En cuál te echo la mano?`,
    ];
    return { response: pickResponse(responses, 'FACTURACION', ctx), agent: 'Agente Facturación', category: 'FACTURACION' };
  },

  ESCALAMIENTO: (ctx) => {
    const name = nameInsert(ctx.userName);
    const sentiment = ctx.sentiment;

    if (sentiment === 'frustrated') {
      const responses = [
        `${name ? name + ', ' : ''}entiendo perfectamente tu frustración y tienes toda la razón en estar molesto/a 🙏\n\nLo que voy a hacer es:\n\n1. **Escalar tu caso ahora mismo** a un supervisor\n2. Te contactarán en **menos de 15 minutos** por el canal que prefieras\n3. Tu caso queda registrado con **prioridad alta**\n\nMientras tanto, si necesitas atención inmediata:\n📞 **+52 55 1234 5678** (directo a supervisores)\n📧 **escalaciones@empresa.com**\n\nDe verdad lamento mucho la experiencia. Vamos a resolverlo.`,
      ];
      return { response: pickResponse(responses, 'ESCALAMIENTO_FRUSTRATED', ctx), agent: 'Agente Escalamiento', category: 'ESCALAMIENTO' };
    }

    const responses = [
      `Entiendo${name}, a veces es necesario hablar con una persona directamente 🤝\n\nYa notifiqué a nuestro equipo humano. Te van a contactar en **menos de 30 minutos**.\n\nSi lo prefieres más rápido:\n📞 **+52 55 1234 5678** (Lun-Vie, 9am-7pm CDMX)\n📧 **soporte@empresa.com**\n💬 **WhatsApp:** +52 55 9876 5432\n\n¿Hay algo que pueda hacer mientras tanto?`,
      `¡Claro${name}! Completamente entendible 😊\n\nVoy a pasar tu caso a una persona de nuestro equipo. Te contactarán pronto:\n\n⏱️ **Tiempo estimado:** menos de 30 minutos\n📞 **Si es urgente:** +52 55 1234 5678\n📧 **Email directo:** soporte@empresa.com\n\nTu solicitud ya está registrada. ¿Hay algo que quieras que le comunique al equipo?`,
      `${name ? name + ', ' : ''}con mucho gusto te conecto con alguien de nuestro equipo 🙌\n\nYa están notificados y se pondrán en contacto contigo. Para que sea más rápido:\n\n• ¿Podrías darme tu **email** o **teléfono** de contacto?\n• ¿Sobre qué tema necesitas hablar?\n\nAsí le paso el contexto y no tienes que repetir todo desde cero 😊`,
    ];
    return { response: pickResponse(responses, 'ESCALAMIENTO', ctx), agent: 'Agente Escalamiento', category: 'ESCALAMIENTO' };
  },

  GENERAL: (ctx) => {
    const name = nameInsert(ctx.userName);
    const normalized = normalizeText(ctx.lastMessage || '');

    if (normalized.match(/horario|hora|cuando abren|cuando cierran|atencion/)) {
      return {
        response: `¡Claro${name}! Nuestros horarios de atención:\n\n🕐 **Lunes a Viernes:** 9:00 am - 7:00 pm (CDMX)\n🕐 **Sábados:** 10:00 am - 2:00 pm\n🚫 **Domingos:** Descansamos\n\nPero este chat con IA está disponible **24/7** 😊 ¿En qué más te puedo ayudar?`,
        agent: 'Agente General',
        category: 'GENERAL',
      };
    }

    if (normalized.match(/contacto|telefono|email|correo|whatsapp|redes/)) {
      return {
        response: `¡Aquí tienes nuestros datos de contacto${name}! 📇\n\n📞 **Teléfono:** +52 55 1234 5678\n📧 **Email:** contacto@empresa.com\n💬 **WhatsApp:** +52 55 9876 5432\n🌐 **Web:** www.empresa.com\n📱 **Redes:** @empresa en Twitter, Instagram y LinkedIn\n\n¿Hay algo específico que necesites?`,
        agent: 'Agente General',
        category: 'GENERAL',
      };
    }

    if (normalized.match(/quienes son|que hacen|que es esto|a que se dedican|para que sirve|como funciona/)) {
      return {
        response: `¡Con gusto te cuento${name}! 😊\n\nSomos una plataforma de **atención al cliente potenciada con IA**. Ayudamos a empresas a:\n\n🤖 **Automatizar** su atención al cliente con chatbots inteligentes\n📊 **Analizar** conversaciones para mejorar el servicio\n🔗 **Integrar** con sus herramientas favoritas (Slack, Teams, WhatsApp...)\n⚡ **Responder más rápido** sin sacrificar calidad\n\nPiensa en nosotros como tu equipo de atención al cliente, pero que nunca duerme 😄 ¿Te interesa saber más sobre algún plan?`,
        agent: 'Agente General',
        category: 'GENERAL',
      };
    }

    const responses = [
      `¡Hola${name}! ¿En qué te puedo ayudar? 😊 Puedo orientarte con:\n\n• 💰 **Planes y precios** — encuentra el ideal para ti\n• 🔧 **Soporte técnico** — resolvemos cualquier problema\n• 💳 **Facturación** — pagos, facturas, reembolsos\n• 📞 **Contacto humano** — te conecto con el equipo\n\nSolo dime qué necesitas y con gusto te ayudo.`,
      `¿Qué se te ofrece${name}? Estoy aquí para lo que necesites 🙌\n\nPuedes preguntarme sobre nuestros servicios, precios, soporte técnico, facturación... ¡lo que sea! ¿Por dónde empezamos?`,
    ];
    return { response: pickResponse(responses, 'GENERAL', ctx), agent: 'Agente General', category: 'GENERAL' };
  },

  CONFUSED: (ctx) => {
    const responses = [
      `¿Tienes alguna duda? Estoy aquí para ayudarte 😊 Puedes preguntarme lo que sea.`,
      `¿En qué te puedo echar la mano? No te quedes con la duda, pregunta con confianza 💪`,
    ];
    return { response: pickResponse(responses, 'CONFUSED', ctx), agent: 'Nova', category: 'GENERAL' };
  },

  GIBBERISH: (ctx) => {
    const responses = [
      `Hmm, no estoy segura de entender 😅 ¿Me podrías dar más detalle sobre lo que necesitas?`,
      `¡Ups! Creo que no capté bien tu mensaje. ¿Podrías reformularlo? Estoy aquí para ayudarte 😊`,
      `No logré entender tu mensaje. ¿Podrías escribirlo de otra forma? Prometo hacer mi mejor esfuerzo 💪`,
    ];
    return { response: pickResponse(responses, 'GIBBERISH', ctx), agent: 'Nova', category: 'GENERAL' };
  },

  CATCHALL: (ctx) => {
    const name = nameInsert(ctx.userName);
    const normalized = normalizeText(ctx.lastMessage || '');

    // If they said something short/casual, be casual back
    if (normalized.length < 15) {
      const responses = [
        `¡Cuéntame más${name}! ¿En qué te puedo ayudar? 😊`,
        `¡Claro${name}! Dime, ¿qué necesitas? Estoy aquí para lo que sea.`,
        `¿Sí${name}? Te escucho, cuéntame qué se te ofrece 👂`,
      ];
      return { response: pickResponse(responses, 'CATCHALL_SHORT', ctx), agent: 'Nova', category: 'GENERAL' };
    }

    // For longer messages we don't understand, acknowledge and redirect
    const responses = [
      `Gracias por compartirme eso${name} 😊 Para asegurarme de darte la mejor respuesta, ¿podrías decirme si tu consulta es sobre:\n\n• 💰 Planes y precios\n• 🔧 Un problema técnico\n• 💳 Facturación o pagos\n• 📞 Hablar con alguien del equipo\n\nAsí te canalizo con el agente correcto.`,
      `¡Interesante${name}! Quiero asegurarme de entenderte bien. ¿Tu pregunta va más por el lado de ventas, soporte técnico, o facturación? Así te doy la mejor atención 🎯`,
    ];
    return { response: pickResponse(responses, 'CATCHALL', ctx), agent: 'Nova', category: 'GENERAL' };
  },
};

// ─── Main demo response function ─────────────────────────────
function getDemoResponse(message, userName, conversationMessages = []) {
  const ctx = getSessionContext('default');
  ctx.userName = userName;
  ctx.messageCount++;
  ctx.lastMessage = message;
  ctx.sentiment = detectSentiment(message);

  // Classify intent
  const intent = classifyDemoIntent(message, ctx);

  // Get response from pool
  const responsePool = RESPONSE_POOLS[intent] || RESPONSE_POOLS.CATCHALL;
  const result = responsePool(ctx);

  // Update context
  if (!['GREETING', 'FAREWELL', 'CONFUSED', 'GIBBERISH', 'CATCHALL'].includes(intent)) {
    ctx.lastCategory = intent;
    if (!ctx.topicsDiscussed.includes(intent)) {
      ctx.topicsDiscussed.push(intent);
    }
  }

  // Calculate simulated typing delay (for frontend use)
  const typingDelay = Math.min(800 + result.response.length * 8, 3000);

  return {
    response: result.response,
    agent: result.agent,
    category: result.category,
    demo: true,
    typingDelay,
  };
}

app.listen(PORT, () => {
  const hasKey = !!getClient();
  log('info', 'Server started', { port: PORT, mode: hasKey ? 'live' : 'demo' });
  console.log(`\n  Nova Chatbot API running on http://localhost:${PORT}`);
  console.log(`  Mode: ${hasKey ? 'Claude API (live)' : 'Demo (sin API key)'}`);
  console.log(`  Agents: ${Object.values(AGENT_LABELS).join(', ')}`);
  console.log(`  Endpoints:`);
  console.log(`    POST /api/chat   — Send messages`);
  console.log(`    GET  /api/health — Health check`);
  console.log(`    GET  /api/stats  — Usage statistics\n`);
});
