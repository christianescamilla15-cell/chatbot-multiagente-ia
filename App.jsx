import { useState, useRef, useEffect } from "react";

// ─── KNOWLEDGE BASE (simula Notion) ──────────────────────────────────────────
const KNOWLEDGE_BASE = `
# Base de Conocimiento — Empresa Demo

## Productos y Servicios
- Ofrecemos planes Básico ($99/mes), Pro ($199/mes) y Enterprise (precio personalizado).
- El plan Pro incluye soporte prioritario, acceso a todas las integraciones y hasta 10 usuarios.
- El plan Enterprise incluye SLA garantizado, onboarding dedicado y usuarios ilimitados.
- Todos los planes incluyen 14 días de prueba gratuita sin tarjeta de crédito.

## Facturación y Pagos
- Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex) y transferencia bancaria.
- La facturación es mensual o anual (con 20% de descuento en pago anual).
- Las facturas se envían automáticamente al correo registrado el día 1 de cada mes.
- Para cancelar, ingresa a Configuración > Suscripción > Cancelar plan.

## Soporte Técnico
- El soporte está disponible de lunes a viernes de 9am a 7pm (horario CDMX).
- Tiempo de respuesta: Plan Básico 48h, Plan Pro 24h, Enterprise 4h.
- Para incidencias críticas en Enterprise, usar la línea directa disponible en el panel.

## Integraciones
- Conectamos con Slack, Notion, HubSpot, Zapier, Make.com y más de 50 herramientas.
- Las integraciones están disponibles desde el Plan Pro en adelante.
- La documentación de la API está disponible en docs.empresa.com

## Cuenta y Seguridad
- Puedes restablecer tu contraseña desde la pantalla de login > "¿Olvidaste tu contraseña?".
- La autenticación de dos factores (2FA) está disponible en todos los planes.
- Los datos se almacenan en servidores en México y EU con cifrado AES-256.

## Devoluciones
- Ofrecemos reembolso completo dentro de los primeros 30 días si no estás satisfecho.
- Después de 30 días no se realizan reembolsos parciales.
- Para solicitar un reembolso, escribe a facturacion@empresa.com
`;

const SYSTEM_PROMPT = `Eres un agente de atención al cliente inteligente y empático. Tu nombre es Nova.

Tu base de conocimiento es la siguiente:
${KNOWLEDGE_BASE}

Reglas:
- Responde SIEMPRE en español, de forma clara, concisa y amigable.
- Si la respuesta está en tu base de conocimiento, úsala directamente.
- Si no tienes la información, di honestamente que escalarás el caso a un agente humano.
- Nunca inventes información que no esté en tu base de conocimiento.
- Sé empático si el usuario expresa frustración.
- Mantén un tono profesional pero cercano.
- Respuestas cortas y directas — máximo 3-4 líneas salvo que sea necesario más detalle.`;

// ─── SUGERENCIAS RÁPIDAS ──────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  "¿Cuáles son los planes disponibles?",
  "¿Cómo cancelo mi suscripción?",
  "¿Qué integraciones tienen?",
  "Quiero un reembolso",
];

// ─── COMPONENTES ──────────────────────────────────────────────────────────────
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

function Message({ msg }) {
  const isUser = msg.role === "user";
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
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #0D9488, #6EE7C7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0, boxShadow: "0 0 12px rgba(110,231,199,0.3)",
        }}>
          ✦
        </div>
      )}
      <div style={{
        maxWidth: "72%",
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
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>
          👤
        </div>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function ChatbotAtencionCliente() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy Nova, tu asistente de atención al cliente. Estoy entrenada con toda la base de conocimiento de la empresa y puedo ayudarte al instante. ¿En qué te puedo ayudar hoy?",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role: "user", content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Lo siento, hubo un error. Por favor intenta de nuevo.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Tuve un problema de conexión. Por favor intenta de nuevo en un momento.",
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
              ✦
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
                  background: "#34D399",
                  boxShadow: "0 0 6px #34D399",
                }} />
                <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
                  Activa · Responde al instante
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowInfo(v => !v)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "6px 12px",
              color: "#9CA3AF", fontSize: 12, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
          >
            {showInfo ? "Ocultar" : "¿Cómo funciona?"}
          </button>
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
              <strong>Arquitectura:</strong> Chatbot entrenado con base de conocimiento en <strong>Notion</strong>, 
              orquestado via <strong>n8n / Make.com</strong> y potenciado por <strong>Claude API</strong>. 
              Desplegable en Web, WhatsApp o Telegram. Resuelve ~80% de dudas frecuentes sin intervención humana.
            </p>
          </div>
        )}

        {/* MESSAGES */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px 20px 8px",
        }}>
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          {loading && (
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16,
              animation: "msgIn 0.3s ease",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #0D9488, #6EE7C7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0,
              }}>✦</div>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "18px 18px 18px 4px",
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        {messages.length <= 1 && (
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
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu pregunta..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1, background: "transparent",
                border: "none", color: "#F9FAFB",
                fontSize: 14, lineHeight: 1.5,
                fontFamily: "'DM Sans', sans-serif",
                minHeight: 22, maxHeight: 100,
                overflowY: "auto",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
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
              ↑
            </button>
          </div>
          <p style={{
            margin: "8px 0 0", textAlign: "center",
            fontSize: 10, color: "rgba(255,255,255,0.15)",
            letterSpacing: "0.05em",
          }}>
            POWERED BY CLAUDE API · KNOWLEDGE BASE EN NOTION · ORQUESTADO CON N8N
          </p>
        </div>
      </div>
    </div>
  );
}
