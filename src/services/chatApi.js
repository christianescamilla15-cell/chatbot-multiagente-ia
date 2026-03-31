// Chat API service — connects to MultiAgente Resident Support backend
import { AGENT_NAME_MAP } from "../constants/agents.js";

const API_URL = import.meta.env.VITE_API_URL || "https://multiagente-api.onrender.com";
const DEFAULT_PHONE = import.meta.env.VITE_PHONE || "+5215579605324";

/**
 * Send message to MultiAgente backend and get agent response.
 */
export async function sendResidentMessage(message, phone = DEFAULT_PHONE) {
  try {
    const res = await fetch(`${API_URL}/api/residents/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, phone }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const agentId = AGENT_NAME_MAP[data.agent] || "orion";

    return {
      response: data.text,
      agent: agentId,
      agentName: data.agent,
      role: data.role || "",
      intent: data.intent || "",
      confidence: data.confidence || 0,
      agentPath: data.agent_path || [],
      sessionId: data.session_id || "",
      verified: data.verified || false,
      requiresVerification: data.requires_verification || false,
      tokens: data.tokens || 0,
      provider: data.provider || "unknown",
      latencyMs: data.latency_ms || 0,
      runId: data.run_id || "",
      residentName: data.resident_name || "",
    };
  } catch (err) {
    console.error("MultiAgente API error:", err);
    return getDemoResponse(message);
  }
}

/**
 * Get system stats from backend.
 */
export async function getSystemStats() {
  try {
    const res = await fetch(`${API_URL}/api/residents/stats`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Stats API error:", err);
    return null;
  }
}

/**
 * Reset session (expire verification) for a phone number.
 */
export async function resetSession(phone = DEFAULT_PHONE) {
  try {
    await fetch(`${API_URL}/api/residents/reset-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
  } catch {}
}

/**
 * Lookup resident by phone.
 */
export async function lookupResident(phone) {
  try {
    const res = await fetch(`${API_URL}/api/residents/lookup/${encodeURIComponent(phone)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Demo fallback when backend is unreachable.
 */
function getDemoResponse(message) {
  const msg = message.toLowerCase();

  if (msg.match(/pago|saldo|factura|recibo|adeudo|cobro/)) {
    return { response: "Para consultar información de facturación necesito verificar tu identidad. Por favor espera mientras te envío un código de verificación.", agent: "sentinel", intent: "billing", requiresVerification: true };
  }
  if (msg.match(/internet|wifi|señal|cámara|interfón/)) {
    return { response: "Entiendo que tienes un problema técnico. ¿Podrías describir el problema con más detalle? Mientras tanto, intenta reiniciar tu router.", agent: "nova", intent: "technical_support" };
  }
  if (msg.match(/fuga|elevador|luz|puerta|tubería|mantenimiento/)) {
    return { response: "Voy a registrar tu reporte de mantenimiento. ¿Podrías indicarme la ubicación exacta del problema?", agent: "atlas", intent: "maintenance" };
  }
  if (msg.match(/queja|hablar con|administrador|no resuelto/)) {
    return { response: "Lamento los inconvenientes. Voy a escalar tu caso para que reciba atención prioritaria.", agent: "nexus", intent: "escalation" };
  }
  if (msg.match(/alberca|gimnasio|horario|reglamento|mascota/)) {
    return { response: "La alberca está abierta de Lun-Dom 07:00-21:00. El gimnasio Lun-Sáb 06:00-22:00. ¿Necesitas información sobre otra amenidad?", agent: "orion", intent: "general" };
  }

  return { response: "¡Hola! Soy tu asistente de Residencial Las Palmas. Puedo ayudarte con soporte técnico, mantenimiento, facturación o información general. ¿En qué te puedo ayudar?", agent: "orion", intent: "general" };
}

// Legacy exports for backward compatibility
export function getAgenticDemoResponse(message, lang) {
  const result = getDemoResponse(message);
  return { response: result.response, agent: result.agent, intents: [result.intent], sentiment: "neutral" };
}

export { getDemoResponse };
