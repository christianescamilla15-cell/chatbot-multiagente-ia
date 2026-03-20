import { useState, useRef, useEffect, useCallback, memo } from "react";
import { KB, CONVERSATION_TREES, SOLUTION_INDEX } from "./knowledge-base.js";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 50;
const FETCH_TIMEOUT_MS = 15000;
const HEALTH_RETRY_INTERVAL_MS = 5000;

// ─── KNOWLEDGE-BASE POWERED DEMO ENGINE ─────────────────────────────────────

// Conversation state (persists across calls, reset on clearChat)
const kbState = {
  currentTree: null,       // "VENTAS" | "SOPORTE" | "FACTURACION" | "ESCALAMIENTO" | null
  currentNodeId: null,     // which node in the tree
  conversationHistory: [], // topics discussed
};

function resetKbState() {
  kbState.currentTree = null;
  kbState.currentNodeId = null;
  kbState.conversationHistory = [];
}

function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿¡!?.,:;()]/g, "").trim();
}

// Agent mapping per category
const CATEGORY_AGENT = {
  VENTAS: "Agente Ventas",
  SOPORTE: "Agente Soporte",
  FACTURACION: "Agente Facturaci\u00F3n",
  ESCALAMIENTO: "Agente Escalamiento",
};

// Main menu options shown after greetings
const MAIN_MENU_OPTIONS = [
  { label: "\uD83D\uDCB0 Planes y precios", _tree: "VENTAS", _nodeId: "ventas_root" },
  { label: "\uD83D\uDD27 Soporte t\u00E9cnico", _tree: "SOPORTE", _nodeId: "soporte_root" },
  { label: "\uD83D\uDCB3 Facturaci\u00F3n", _tree: "FACTURACION", _nodeId: "facturacion_root" },
  { label: "\uD83D\uDCDE Hablar con alguien", _tree: "ESCALAMIENTO", _nodeId: "escalamiento_root" },
];

// "Need anything else?" options shown after solutions
const POST_SOLUTION_OPTIONS = [
  { label: "S\u00ED, tengo otra duda", _action: "RESET" },
  { label: "No, gracias", _action: "FAREWELL" },
];

// Intent classification for free text (maps to tree entry)
const INTENT_KEYWORDS = {
  VENTAS: ["precio","plan","costo","cuanto","contratar","demo","prueba","comprar","cotizacion","paquete","licencia","descuento","oferta","promocion","gratis","free","mensual","anual","barato","economico","empezar","iniciar","probar","conocer"],
  SOPORTE: ["error","problema","funciona","ayuda","bug","falla","fallo","roto","lento","carga","configurar","configuracion","integracion","integrar","conectar","instalar","actualizar","crashea","no puedo","no me deja","se cayo","no carga","no sirve","no jala"],
  FACTURACION: ["factura","cobro","pago","reembolso","cancelar","suscripcion","tarjeta","recibo","cargo","devolucion","renovar","dinero","facturacion","datos fiscales","rfc","baja"],
  ESCALAMIENTO: ["queja","humano","persona","supervisor","gerente","urgente","inaceptable","terrible","pesimo","demanda","harto","hablar con alguien","hablar con humano"],
};

const GREETING_WORDS = ["hola","hey","buenas","buenos","saludos","hi","hello","oye","ola","buen dia","buenas tardes","buenas noches","que tal","que onda","como estas"];
const FAREWELL_WORDS = ["adios","bye","chao","hasta luego","nos vemos","es todo","eso es todo","nada mas"];
const THANKS_WORDS = ["gracias","thanks","thank you","muchas gracias","ok gracias","listo gracias","perfecto gracias","genial","excelente","perfecto","chido"];
const FRUSTRATED_WORDS = ["enojado","molesto","furioso","frustrado","harto","terrible","pesimo","inaceptable","peor","odio","basura"];

function detectFrustration(normalized) {
  return FRUSTRATED_WORDS.filter(w => normalized.includes(w)).length >= 1;
}

function isGreeting(normalized) {
  return GREETING_WORDS.some(w => normalized.includes(w));
}

function isFarewell(normalized) {
  return FAREWELL_WORDS.some(w => normalized.includes(w));
}

function isThanks(normalized) {
  return THANKS_WORDS.some(w => normalized.includes(w));
}

// Score a SOLUTION_INDEX entry against normalized text
function scoreSolutionEntry(entry, normalized) {
  let matched = 0;
  for (const kw of entry.keywords) {
    const normKw = normalizeText(kw);
    if (normalized.includes(normKw)) matched++;
  }
  return matched;
}

// Search SOLUTION_INDEX for best match
function searchSolutionIndex(normalized) {
  let best = null;
  let bestScore = 0;
  for (const entry of SOLUTION_INDEX) {
    const score = scoreSolutionEntry(entry, normalized);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return { entry: best, score: bestScore };
}

// Classify intent from free text
function classifyIntent(normalized) {
  let bestIntent = null;
  let bestScore = 0;
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (normalized.includes(normalizeText(kw))) score++;
    }
    // Boost if already in this tree
    if (kbState.currentTree === intent && score > 0) score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }
  return bestScore >= 1 ? bestIntent : null;
}

// Navigate to a tree node, return response object
function navigateToNode(treeName, nodeId) {
  const tree = CONVERSATION_TREES[treeName];
  if (!tree) return null;
  const node = tree[nodeId];
  if (!node) return null;

  kbState.currentTree = treeName;
  kbState.currentNodeId = nodeId;
  if (!kbState.conversationHistory.includes(treeName)) {
    kbState.conversationHistory.push(treeName);
  }

  const agent = CATEGORY_AGENT[treeName] || "Nova";
  const response = node.solution || node.text;
  const options = [];

  if (node.solution && node.options && node.options.length > 0) {
    // Has solution + more options — show them
    for (const opt of node.options) {
      options.push(opt);
    }
  } else if (node.solution && (!node.options || node.options.length === 0)) {
    // Final solution — no tree options, show post-solution options
    // (these get appended below)
  } else if (node.options && node.options.length > 0) {
    for (const opt of node.options) {
      options.push(opt);
    }
  }

  // If it's a terminal solution with no further options, add "need anything else?"
  const isFinalSolution = node.solution && (!node.options || node.options.length === 0);
  const postSolution = isFinalSolution;

  return {
    response,
    agent,
    options,
    postSolution,
    category: treeName,
    demo: true,
    typingDelay: Math.min(800 + response.length * 6, 3000),
  };
}

// Main demo response function
function getDemoResponse(message) {
  const normalized = normalizeText(message);

  // Edge case: empty or very short
  if (normalized.length === 0) return null;
  if (normalized.length <= 2 && !isGreeting(normalized)) {
    return {
      response: "\u00BFPodr\u00EDas darme m\u00E1s detalle? As\u00ED te ayudo mejor.",
      agent: "Nova",
      options: [],
      demo: true,
      typingDelay: 800,
    };
  }

  // Frustration detection — offer escalation immediately
  if (detectFrustration(normalized)) {
    const result = navigateToNode("ESCALAMIENTO", "escalamiento_root");
    if (result) {
      result.response = "Entiendo tu frustraci\u00F3n y lamento mucho la experiencia. \uD83D\uDE4F Voy a conectarte con alguien que pueda ayudarte de inmediato.\n\n" + result.response;
      return result;
    }
  }

  // Farewell detection
  if (isFarewell(normalized) && !isThanks(normalized)) {
    resetKbState();
    return {
      response: "\u00A1Hasta luego! Fue un placer ayudarte. \uD83D\uDC4B Si necesitas algo m\u00E1s, aqu\u00ED estar\u00E9.",
      agent: "Nova",
      options: [],
      demo: true,
      typingDelay: 1000,
    };
  }

  // Thanks detection
  if (isThanks(normalized) && !isGreeting(normalized)) {
    resetKbState();
    return {
      response: "\u00A1Con mucho gusto! Me da gusto haberte ayudado. \uD83D\uDE0A\n\n\u00BFNecesitas algo m\u00E1s?",
      agent: "Nova",
      options: MAIN_MENU_OPTIONS,
      demo: true,
      typingDelay: 1000,
    };
  }

  // Greeting detection
  if (isGreeting(normalized) && normalized.length < 40) {
    resetKbState();
    return {
      response: "\u00A1Hola! \u00BFC\u00F3mo est\u00E1s? Soy Nova, tu asistente de Nova AI. \uD83D\uDE0A \u00BFEn qu\u00E9 te puedo ayudar?",
      agent: "Nova",
      options: MAIN_MENU_OPTIONS,
      demo: true,
      typingDelay: 1200,
    };
  }

  // --- Mode B: Free-text matching (intelligent) ---
  // First, try SOLUTION_INDEX for a direct answer
  const { entry: bestMatch, score: matchScore } = searchSolutionIndex(normalized);

  if (bestMatch && matchScore >= 2) {
    // Strong match — return specific solution directly
    const agent = CATEGORY_AGENT[bestMatch.category] || "Nova";
    if (!kbState.conversationHistory.includes(bestMatch.category)) {
      kbState.conversationHistory.push(bestMatch.category);
    }
    kbState.currentTree = bestMatch.category;
    kbState.currentNodeId = bestMatch.nodeId;

    // Check if the matched node has further options in the tree
    const tree = CONVERSATION_TREES[bestMatch.category];
    const node = tree ? tree[bestMatch.nodeId] : null;
    const nodeOptions = (node && node.options) ? node.options : [];

    return {
      response: bestMatch.solution,
      agent,
      options: nodeOptions.length > 0 ? nodeOptions : [],
      postSolution: nodeOptions.length === 0,
      category: bestMatch.category,
      demo: true,
      typingDelay: Math.min(800 + bestMatch.solution.length * 6, 3000),
    };
  }

  if (bestMatch && matchScore === 1) {
    // Weak match — return solution but ask for confirmation
    const agent = CATEGORY_AGENT[bestMatch.category] || "Nova";
    if (!kbState.conversationHistory.includes(bestMatch.category)) {
      kbState.conversationHistory.push(bestMatch.category);
    }
    kbState.currentTree = bestMatch.category;
    kbState.currentNodeId = bestMatch.nodeId;

    const tree = CONVERSATION_TREES[bestMatch.category];
    const node = tree ? tree[bestMatch.nodeId] : null;
    const nodeOptions = (node && node.options) ? node.options : [];

    return {
      response: bestMatch.solution + "\n\n\u00BFEsto responde tu pregunta?",
      agent,
      options: nodeOptions.length > 0 ? nodeOptions : [],
      postSolution: nodeOptions.length === 0,
      category: bestMatch.category,
      demo: true,
      typingDelay: Math.min(800 + bestMatch.solution.length * 6, 3000),
    };
  }

  // No match in SOLUTION_INDEX — try intent classification to enter a tree
  const intent = classifyIntent(normalized);
  if (intent) {
    const rootId = {
      VENTAS: "ventas_root",
      SOPORTE: "soporte_root",
      FACTURACION: "facturacion_root",
      ESCALAMIENTO: "escalamiento_root",
    }[intent];
    const result = navigateToNode(intent, rootId);
    if (result) return result;
  }

  // Context-aware: if already in a tree, try searching within that tree's solutions
  if (kbState.currentTree) {
    const treeSolutions = SOLUTION_INDEX.filter(e => e.category === kbState.currentTree);
    let best = null;
    let bestS = 0;
    for (const entry of treeSolutions) {
      const s = scoreSolutionEntry(entry, normalized);
      if (s > bestS) { bestS = s; best = entry; }
    }
    if (best && bestS >= 1) {
      const agent = CATEGORY_AGENT[best.category] || "Nova";
      const tree = CONVERSATION_TREES[best.category];
      const node = tree ? tree[best.nodeId] : null;
      const nodeOptions = (node && node.options) ? node.options : [];
      return {
        response: best.solution,
        agent,
        options: nodeOptions.length > 0 ? nodeOptions : [],
        postSolution: nodeOptions.length === 0,
        category: best.category,
        demo: true,
        typingDelay: Math.min(800 + best.solution.length * 6, 3000),
      };
    }
  }

  // Absolute fallback — show main menu
  return {
    response: "Quiero darte la mejor respuesta. \u00BFTu consulta es sobre alguno de estos temas?",
    agent: "Nova",
    options: MAIN_MENU_OPTIONS,
    demo: true,
    typingDelay: 1000,
  };
}

// Handle a clicked option (from tree navigation)
function handleOptionNavigation(opt) {
  // Special actions
  if (opt._action === "RESET") {
    resetKbState();
    return {
      response: "\u00A1Claro! \u00BFEn qu\u00E9 m\u00E1s te puedo ayudar?",
      agent: "Nova",
      options: MAIN_MENU_OPTIONS,
      demo: true,
      typingDelay: 800,
    };
  }
  if (opt._action === "FAREWELL") {
    resetKbState();
    return {
      response: "\u00A1Perfecto! Fue un gusto ayudarte. \uD83D\uDE0A Si necesitas algo en el futuro, aqu\u00ED estar\u00E9. \u00A1Que tengas un excelente d\u00EDa!",
      agent: "Nova",
      options: [],
      demo: true,
      typingDelay: 1000,
    };
  }

  // Main menu options (have _tree and _nodeId)
  if (opt._tree && opt._nodeId) {
    return navigateToNode(opt._tree, opt._nodeId);
  }

  // Regular tree option (has nextId)
  if (opt.nextId) {
    // Find which tree has this node
    const treeName = kbState.currentTree;
    if (treeName) {
      // Check current tree first
      const tree = CONVERSATION_TREES[treeName];
      if (tree && tree[opt.nextId]) {
        return navigateToNode(treeName, opt.nextId);
      }
    }
    // Search all trees for this nodeId
    for (const [tName, tNodes] of Object.entries(CONVERSATION_TREES)) {
      if (tNodes[opt.nextId]) {
        return navigateToNode(tName, opt.nextId);
      }
    }
  }

  // Fallback
  return getDemoResponse(opt.label);
}

const QUICK_SUGGESTIONS = [
  "\u00BFQu\u00E9 planes tienen?",
  "\u00BFCu\u00E1nto cuesta el plan Pro?",
  "Necesito configurar Slack",
  "Tengo un problema t\u00E9cnico",
  "\u00BFC\u00F3mo cancelo mi suscripci\u00F3n?",
  "Quiero hablar con alguien",
];

const AGENT_COLORS = {
  "Agente Ventas": { bg: "rgba(16,185,129,0.12)", text: "#6EE7B7", icon: "\u{1F4BC}" },
  "Agente Soporte": { bg: "rgba(59,130,246,0.12)", text: "#93C5FD", icon: "\u{1F527}" },
  "Agente Facturación": { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", icon: "\u{1F4B3}" },
  "Agente Escalamiento": { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", icon: "\u{1F6A8}" },
  "Agente General": { bg: "rgba(139,92,246,0.12)", text: "#C4B5FD", icon: "\u{1F4AC}" },
  "Nova": { bg: "rgba(110,231,199,0.12)", text: "#6EE7C7", icon: "\u2726" },
};

// ─── UTILITIES ──────────────────────────────────────────────────────────────
function sanitizeText(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `hace ${m} min`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `hace ${h}h`;
  }
  const d = Math.floor(diff / 86400);
  return `hace ${d}d`;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "14px 18px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#6EE7C7",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function AgentBadge({ agent }) {
  const style = AGENT_COLORS[agent] || AGENT_COLORS["Agente General"];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: style.bg, color: style.text,
      borderRadius: 12, padding: "2px 8px",
      fontSize: 10, fontWeight: 500,
      marginBottom: 4,
    }}>
      {style.icon} {agent}
    </div>
  );
}

const MessageBubble = memo(function MessageBubble({ msg, onOptionClick }) {
  const isUser = msg.role === "user";
  const [relativeTime, setRelativeTime] = useState(() => timeAgo(msg.timestamp));

  useEffect(() => {
    if (!msg.timestamp) return;
    const interval = setInterval(() => {
      setRelativeTime(timeAgo(msg.timestamp));
    }, 30000);
    return () => clearInterval(interval);
  }, [msg.timestamp]);

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end",
      gap: 10,
      marginBottom: 16,
      animation: "msgIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      {!isUser && (
        <div aria-hidden="true" style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #0D9488, #6EE7C7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0, boxShadow: "0 0 12px rgba(110,231,199,0.3)",
        }}>
          {"\u2726"}
        </div>
      )}
      <div style={{ maxWidth: "72%" }}>
        {!isUser && msg.agent && <AgentBadge agent={msg.agent} />}
        <div style={{
          background: isUser
            ? "linear-gradient(135deg, #1E3A5F, #1a3354)"
            : "rgba(255,255,255,0.04)",
          border: isUser
            ? "1px solid rgba(99,179,237,0.2)"
            : "1px solid rgba(255,255,255,0.07)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px",
          fontSize: 14,
          lineHeight: 1.65,
          color: isUser ? "#E2F4FF" : "#D1D5DB",
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.content}
          {msg.options && msg.options.length > 0 && onOptionClick && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {msg.options.map((opt, i) => (
                <button key={i} onClick={() => onOptionClick(opt)} style={{
                  background: "rgba(110,231,199,0.1)",
                  border: "1px solid rgba(110,231,199,0.3)",
                  borderRadius: 20, padding: "6px 14px",
                  fontSize: 12, color: "#6EE7C7",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.target.style.background = "rgba(110,231,199,0.2)";
                  e.target.style.borderColor = "rgba(110,231,199,0.5)";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "rgba(110,231,199,0.1)";
                  e.target.style.borderColor = "rgba(110,231,199,0.3)";
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {msg.timestamp && (
          <div style={{
            fontSize: 9, color: "rgba(255,255,255,0.2)",
            marginTop: 3,
            textAlign: isUser ? "right" : "left",
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
          }}>
            {relativeTime}
          </div>
        )}
      </div>
      {isUser && (
        <div aria-hidden="true" style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>
          {"\u{1F464}"}
        </div>
      )}
    </div>
  );
});

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: 16,
      animation: "msgIn 0.3s ease",
    }}>
      <div aria-hidden="true" style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0,
      }}>
        {"\u26A0"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 16px",
          fontSize: 13,
          lineHeight: 1.6,
          color: "#FCA5A5",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {message}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={onRetry}
              aria-label="Reintentar enviar mensaje"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                padding: "5px 14px",
                color: "#FCA5A5",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgba(239,68,68,0.25)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(239,68,68,0.15)";
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonShimmer() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "40px 20px", gap: 16,
      animation: "fadeIn 0.5s ease",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 16,
        background: "linear-gradient(135deg, #0D9488, #6EE7C7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, boxShadow: "0 0 24px rgba(110,231,199,0.2)",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }}>
        {"\u2726"}
      </div>
      <div style={{
        fontSize: 13, color: "#6B7280",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Conectando con Nova...
      </div>
      {[180, 140, 100].map((w, i) => (
        <div key={i} style={{
          width: w, height: 12, borderRadius: 6,
          background: "rgba(255,255,255,0.04)",
          animation: `skeletonPulse 1.5s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "50px 24px", gap: 12,
      animation: "fadeIn 0.6s ease",
      textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(110,231,199,0.1))",
        border: "1px solid rgba(110,231,199,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
      }}>
        {"\u2726"}
      </div>
      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700, fontSize: 18,
        color: "#F9FAFB", letterSpacing: "-0.02em",
        marginTop: 4,
      }}>
        Bienvenido a Nova
      </div>
      <div style={{
        fontSize: 13, color: "#6B7280", lineHeight: 1.6,
        maxWidth: 280,
      }}>
        Tu asistente con 5 agentes IA especializados.
        Pregunta sobre ventas, soporte, facturaci&oacute;n o lo que necesites.
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ──────────────────────────────────────────────────────────
export default function ChatbotAtencionCliente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [sendingRef] = useState({ current: false });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const healthRetryRef = useRef(null);
  const abortRef = useRef(null);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Auto-resize textarea
  const adjustTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "22px";
    const maxH = 22 * 4; // ~4 lines
    el.style.height = Math.min(el.scrollHeight, maxH) + "px";
  }, []);

  useEffect(() => {
    adjustTextarea();
  }, [input, adjustTextarea]);

  // Health check — falls back to demo mode if no backend (e.g. Vercel deploy)
  const demoModeRef = useRef(false);

  const initWelcome = useCallback(() => {
    resetKbState();
    setMessages(prev => {
      if (prev.length === 0) {
        return [{
          role: "assistant",
          content: "\u00A1Hola! Soy Nova, tu asistente de Nova AI. \uD83D\uDE0A \u00BFEn qu\u00E9 te puedo ayudar hoy?",
          agent: "Nova",
          timestamp: Date.now(),
          options: MAIN_MENU_OPTIONS,
        }];
      }
      return prev;
    });
  }, []);

  const checkHealth = useCallback(() => {
    fetch("/api/health", { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(data => {
        setApiStatus(data);
        setInitializing(false);
        demoModeRef.current = false;
        if (healthRetryRef.current) { clearInterval(healthRetryRef.current); healthRetryRef.current = null; }
        initWelcome();
      })
      .catch(() => {
        // No backend available — activate client-side demo mode
        demoModeRef.current = true;
        setApiStatus({ status: "ok", hasApiKey: false, demo: true });
        setInitializing(false);
        initWelcome();
        // No retry needed — demo mode works fully client-side
        if (healthRetryRef.current) { clearInterval(healthRetryRef.current); healthRetryRef.current = null; }
      });
  }, [initWelcome]);

  useEffect(() => {
    checkHealth();
    return () => {
      if (healthRetryRef.current) clearInterval(healthRetryRef.current);
    };
  }, [checkHealth]);

  // Trim messages to prevent memory leak
  const addMessage = useCallback((msg) => {
    setMessages(prev => {
      const next = [...prev, msg];
      if (next.length > MAX_MESSAGES) {
        return next.slice(next.length - MAX_MESSAGES);
      }
      return next;
    });
  }, []);

  const sendMessage = useCallback(async (text) => {
    const content = sanitizeText((text || input).trim());
    if (!content || loading || sendingRef.current) return;
    if (content.length > MAX_MESSAGE_LENGTH) return;

    sendingRef.current = true;
    setInput("");
    setLastFailedMessage(null);

    const userMsg = { role: "user", content, timestamp: Date.now() };
    setMessages(prev => {
      const next = [...prev, userMsg];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
    setLoading(true);

    // Client-side demo mode (no backend needed)
    if (demoModeRef.current) {
      try {
        const demoResult = getDemoResponse(content);
        if (!demoResult) {
          setLoading(false);
          sendingRef.current = false;
          return;
        }
        await new Promise(r => setTimeout(r, demoResult.typingDelay || 1200));
        const assistantMsg = {
          role: "assistant",
          content: demoResult.response,
          agent: demoResult.agent || "Nova",
          timestamp: Date.now(),
          options: demoResult.options || [],
        };
        // If postSolution, append post-solution options
        if (demoResult.postSolution) {
          assistantMsg.options = [...(assistantMsg.options || []), ...POST_SOLUTION_OPTIONS];
        }
        addMessage(assistantMsg);
        setLastFailedMessage(null);
      } catch {
        addMessage({ role: "error", content: "Error en modo demo.", timestamp: Date.now() });
      } finally {
        setLoading(false);
        sendingRef.current = false;
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return;
    }

    // Server mode — Abort controller with timeout
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          messages: messages
            .concat([userMsg])
            .filter(m => m.role !== "system")
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content })),
          userName: "Usuario",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      addMessage({
        role: "assistant",
        content: data.response || "Lo siento, hubo un error. Por favor intenta de nuevo.",
        agent: data.agent || "Sistema",
        timestamp: Date.now(),
      });
      setLastFailedMessage(null);
    } catch (err) {
      clearTimeout(timeoutId);
      // If server fetch fails, fallback to demo mode
      demoModeRef.current = true;
      const demoResult = getDemoResponse(content);
      if (demoResult) {
        await new Promise(r => setTimeout(r, demoResult.typingDelay || 1200));
        const assistantMsg = {
          role: "assistant",
          content: demoResult.response,
          agent: demoResult.agent || "Nova",
          timestamp: Date.now(),
          options: demoResult.options || [],
        };
        if (demoResult.postSolution) {
          assistantMsg.options = [...(assistantMsg.options || []), ...POST_SOLUTION_OPTIONS];
        }
        addMessage(assistantMsg);
      }
      setLastFailedMessage(null);
    } finally {
      setLoading(false);
      sendingRef.current = false;
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages, addMessage, sendingRef]);

  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      // Remove the last error message
      setMessages(prev => {
        const cleaned = [...prev];
        for (let i = cleaned.length - 1; i >= 0; i--) {
          if (cleaned[i].role === "error") {
            cleaned.splice(i, 1);
            break;
          }
        }
        // Also remove the last user message that failed
        for (let i = cleaned.length - 1; i >= 0; i--) {
          if (cleaned[i].role === "user" && cleaned[i].content === lastFailedMessage) {
            cleaned.splice(i, 1);
            break;
          }
        }
        return cleaned;
      });
      sendMessage(lastFailedMessage);
    }
  }, [lastFailedMessage, sendMessage]);

  const clearChat = useCallback(() => {
    resetKbState();
    setMessages([{
      role: "assistant",
      content: "\u00A1Hola! Soy Nova, tu asistente de Nova AI. \uD83D\uDE0A \u00BFEn qu\u00E9 te puedo ayudar hoy?",
      agent: "Nova",
      timestamp: Date.now(),
      options: MAIN_MENU_OPTIONS,
    }]);
    setLastFailedMessage(null);
    setInput("");
    inputRef.current?.focus();
  }, []);

  // Handle clicking an option button inside a message bubble
  const handleOptionClick = useCallback(async (opt) => {
    if (loading || sendingRef.current) return;
    sendingRef.current = true;

    // Show the clicked option as a user message
    const userMsg = { role: "user", content: opt.label, timestamp: Date.now() };
    setMessages(prev => {
      // Remove options from the last assistant message to prevent re-clicking
      const updated = prev.map((m, i) => {
        if (i === prev.length - 1 && m.role === "assistant" && m.options) {
          return { ...m, options: [] };
        }
        return m;
      });
      const next = [...updated, userMsg];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
    setLoading(true);

    try {
      const result = handleOptionNavigation(opt);
      if (!result) {
        // Fallback to free-text
        const demoResult = getDemoResponse(opt.label);
        if (demoResult) {
          await new Promise(r => setTimeout(r, demoResult.typingDelay || 1200));
          const assistantMsg = {
            role: "assistant",
            content: demoResult.response,
            agent: demoResult.agent || "Nova",
            timestamp: Date.now(),
            options: demoResult.options || [],
          };
          if (demoResult.postSolution) {
            assistantMsg.options = [...(assistantMsg.options || []), ...POST_SOLUTION_OPTIONS];
          }
          addMessage(assistantMsg);
        }
      } else {
        await new Promise(r => setTimeout(r, result.typingDelay || 1200));
        const assistantMsg = {
          role: "assistant",
          content: result.response,
          agent: result.agent || "Nova",
          timestamp: Date.now(),
          options: result.options || [],
        };
        if (result.postSolution) {
          assistantMsg.options = [...(assistantMsg.options || []), ...POST_SOLUTION_OPTIONS];
        }
        addMessage(assistantMsg);
      }
    } catch {
      addMessage({ role: "error", content: "Error procesando tu solicitud.", timestamp: Date.now() });
    } finally {
      setLoading(false);
      sendingRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [loading, addMessage, sendingRef]);

  const handleInput = useCallback((e) => {
    const val = e.target.value;
    if (val.length <= MAX_MESSAGE_LENGTH) {
      setInput(val);
    }
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const isReconnecting = apiStatus?.status === "offline";
  const charsLeft = MAX_MESSAGE_LENGTH - input.length;
  const showCharCount = charsLeft <= 80;
  const hasOnlyWelcome = messages.length <= 1 && messages[0]?.role === "assistant";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0F1A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 480,
        height: "min(720px, 90vh)",
        background: "#0F1624",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,231,199,0.05)",
      }}>

        {/* HEADER */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "linear-gradient(135deg, #0D9488, #6EE7C7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 0 20px rgba(110,231,199,0.25)",
            }}>
              {"\u2726"}
            </div>
            <div>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#F9FAFB", letterSpacing: "-0.02em",
              }}>
                Nova
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: apiStatus?.status === "ok" ? "#34D399" : apiStatus?.status === "offline" ? "#EF4444" : "#F59E0B",
                  boxShadow: `0 0 6px ${apiStatus?.status === "ok" ? "#34D399" : apiStatus?.status === "offline" ? "#EF4444" : "#F59E0B"}`,
                  animation: isReconnecting ? "pulse 1.5s ease-in-out infinite" : "none",
                }} />
                <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
                  {apiStatus?.status === "ok"
                    ? (apiStatus.hasApiKey ? "5 agentes activos" : "Modo demo")
                    : isReconnecting
                    ? "Reconectando..."
                    : "Conectando..."}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                aria-label="Limpiar historial de chat"
                title="Limpiar chat"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "6px 10px",
                  color: "#9CA3AF", fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 4,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                  e.currentTarget.style.color = "#FCA5A5";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#9CA3AF";
                }}
              >
                Limpiar
              </button>
            )}
            <button
              onClick={() => setShowInfo(v => !v)}
              aria-label={showInfo ? "Ocultar panel de arquitectura" : "Mostrar panel de arquitectura"}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "6px 12px",
                color: "#9CA3AF", fontSize: 12, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {showInfo ? "Ocultar" : "Arquitectura"}
            </button>
          </div>
        </div>

        {/* INFO PANEL */}
        {showInfo && (
          <div style={{
            padding: "14px 24px",
            background: "rgba(13,148,136,0.06)",
            borderBottom: "1px solid rgba(13,148,136,0.15)",
            animation: "slideDown 0.25s ease",
          }}>
            <p style={{ margin: 0, fontSize: 12, color: "#6EE7C7", lineHeight: 1.7 }}>
              <strong>Flujo:</strong> Mensaje → <strong>Clasificador IA</strong> (detecta intención) →
              Router → <strong>Agente Especializado</strong> (Ventas/Soporte/Facturación/Escalamiento/General) → Respuesta.
              <br /><br />
              <strong>Stack:</strong> React · Express · Claude API (Haiku) · Orquestable via n8n.
              Base de conocimiento en Notion. Desplegable en Web, WhatsApp y Telegram.
            </p>
          </div>
        )}

        {/* MESSAGES */}
        <div role="log" aria-label="Historial de mensajes" aria-live="polite" style={{
          flex: 1, overflowY: "auto",
          padding: "20px 20px 8px",
        }}>
          {initializing ? (
            <SkeletonShimmer />
          ) : (
            <>
              {hasOnlyWelcome && <EmptyState />}
              {messages.map((msg, i) =>
                msg.role === "error" ? (
                  <ErrorBanner
                    key={i}
                    message={msg.content}
                    onRetry={handleRetry}
                  />
                ) : (
                  <MessageBubble key={i} msg={msg} onOptionClick={handleOptionClick} />
                )
              )}
              {loading && (
                <div style={{
                  display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16,
                  animation: "msgIn 0.3s ease",
                }}>
                  <div aria-hidden="true" style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, #0D9488, #6EE7C7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0,
                  }}>{"\u2726"}</div>
                  <div>
                    <div style={{
                      fontSize: 10, color: "#6EE7C7", marginBottom: 4,
                      fontWeight: 500, opacity: 0.8,
                      animation: "fadeIn 0.3s ease",
                    }}>
                      Nova está escribiendo...
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "18px 18px 18px 4px",
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        {hasOnlyWelcome && !initializing && (
          <div style={{
            padding: "0 20px 12px",
            display: "flex", gap: 8, flexWrap: "wrap",
            animation: "fadeIn 0.5s ease",
          }}>
            {QUICK_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                disabled={loading}
                aria-label={`Sugerencia: ${s}`}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 20, padding: "6px 12px",
                  fontSize: 12, color: "#9CA3AF",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  e.target.style.borderColor = "rgba(110,231,199,0.3)";
                  e.target.style.color = "#6EE7C7";
                }}
                onMouseLeave={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.09)";
                  e.target.style.color = "#9CA3AF";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT */}
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
        }}>
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "10px 14px",
            transition: "border-color 0.2s",
          }}
            onFocus={e => e.currentTarget.style.borderColor = "rgba(110,231,199,0.3)"}
            onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <textarea
              ref={el => { inputRef.current = el; textareaRef.current = el; }}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKey}
              placeholder="Escribe tu pregunta..."
              rows={1}
              disabled={loading}
              maxLength={MAX_MESSAGE_LENGTH}
              aria-label="Escribe tu mensaje"
              style={{
                flex: 1, background: "transparent",
                border: "none", color: "#F9FAFB",
                fontSize: 14, lineHeight: 1.5,
                fontFamily: "'DM Sans', sans-serif",
                minHeight: 22, maxHeight: 88,
                overflowY: "auto",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #0D9488, #6EE7C7)"
                  : "rgba(255,255,255,0.06)",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
                transition: "all 0.2s",
                boxShadow: input.trim() && !loading ? "0 0 12px rgba(110,231,199,0.3)" : "none",
              }}
            >
              {"\u2191"}
            </button>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            margin: "8px 0 0", padding: "0 4px",
          }}>
            <p style={{
              margin: 0,
              fontSize: 10, color: "rgba(255,255,255,0.15)",
              letterSpacing: "0.05em",
            }}>
              5 AGENTES IA · CLAUDE API · KNOWLEDGE BASE EN NOTION · ORQUESTADO CON N8N
            </p>
            {showCharCount && (
              <span style={{
                fontSize: 10,
                color: charsLeft <= 20 ? "#EF4444" : "rgba(255,255,255,0.25)",
                fontVariantNumeric: "tabular-nums",
                transition: "color 0.2s",
                flexShrink: 0,
                marginLeft: 8,
              }}>
                {charsLeft}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
