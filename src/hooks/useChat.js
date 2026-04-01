// Chat state management hook — MultiAgente Resident Support System
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { timestamp, nextMsgId } from "../utils/messageFormatter.js";
import { sendResidentMessage, getSystemStats, resetSession } from "../services/chatApi.js";
import { AGENT_NAME_MAP } from "../constants/agents.js";

const WELCOME_MSG = "¡Hola! Soy el asistente de Residencial Las Palmas. Tengo agentes especializados para ayudarte con soporte técnico, mantenimiento, facturación e información general. ¿En qué puedo ayudarte?";

export function useChat() {
  const [messages, setMessages] = useState(() => {
    try { const s = localStorage.getItem("multiagente_msgs"); if (s) return JSON.parse(s); } catch {}
    return [{ id: nextMsgId(), role: "assistant", agent: "orion", content: WELCOME_MSG, timestamp: timestamp() }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState("orion");
  const [lang, setLang] = useState("es");
  const [verified, setVerified] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [phone, setPhone] = useState("+5215579605324");
  const [residentName, setResidentName] = useState("");
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState(() => { try { const s = localStorage.getItem("multiagente_ratings"); if (s) return JSON.parse(s); } catch {} return {}; });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { localStorage.setItem("multiagente_msgs", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("multiagente_ratings", JSON.stringify(ratings)); }, [ratings]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Load stats on mount
  useEffect(() => {
    getSystemStats().then(s => { if (s) setStats(s); });
  }, []);

  const handleRate = useCallback((id, val) => {
    setRatings(prev => { const n = { ...prev }; n[id] = prev[id] === val ? 0 : val; return n; });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, rating: ratings[id] === val ? 0 : val } : m));
  }, [ratings]);

  const clearChat = useCallback(() => {
    resetSession(phone);
    setMessages([{ id: nextMsgId(), role: "assistant", agent: "orion", content: WELCOME_MSG, timestamp: timestamp() }]);
    setRatings({}); setAgent("orion"); setVerified(false); setSessionId(""); setResidentName("");
    localStorage.removeItem("multiagente_msgs"); localStorage.removeItem("multiagente_ratings");
  }, [phone]);

  const exportChat = useCallback(() => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = `multiagente-chat-${Date.now()}.json`; a.click(); URL.revokeObjectURL(u);
  }, [messages]);

  const suggestions = useMemo(() => {
    if (messages.length <= 1) {
      return lang === "en"
        ? ["Pool hours?", "Check my balance", "Water leak in my bathroom", "My WiFi is slow", "Book party room"]
        : ["Horario de la alberca?", "Quiero saber mi saldo", "Fuga de agua en mi bano", "Mi internet no funciona", "Reservar salon de fiestas"];
    }
    if (verified) {
      return lang === "en"
        ? ["Account statement", "Payment receipt", "How much do I owe?", "Payment info"]
        : ["Estado de cuenta", "Recibo de pago", "Cuanto debo?", "Info de pago"];
    }
    // Show contextual suggestions based on last agent
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant" && m.agent);
    const lastAgent = lastAssistant?.agent || "orion";
    const agentSuggestions = {
      orion: lang === "en" ? ["Pool hours?", "Gym schedule?", "Pet rules?", "Book party room"] : ["Horario alberca?", "Horario gym?", "Reglas mascotas?", "Reservar salon"],
      nova: lang === "en" ? ["WiFi is slow", "Camera down", "Intercom broken", "Access app fails"] : ["WiFi lento", "Camara no graba", "Interfon no sirve", "App de acceso falla"],
      atlas: lang === "en" ? ["Water leak", "Elevator stuck", "Light out", "Garage door"] : ["Fuga de agua", "Elevador atorado", "Luz fundida", "Puerta garage"],
      aria: lang === "en" ? ["My balance?", "Need receipt", "Account statement", "Payment methods"] : ["Mi saldo?", "Necesito recibo", "Estado de cuenta", "Formas de pago"],
      sentinel: lang === "en" ? ["Enter verification code"] : ["Ingresar codigo de verificacion"],
      nexus: lang === "en" ? ["Talk to a person", "File complaint"] : ["Hablar con persona", "Poner queja"],
      closure: lang === "en" ? ["Is my issue resolved?", "Thank you"] : ["Se resolvio?", "Gracias"],
      router: lang === "en" ? ["Check balance", "Report problem"] : ["Consultar saldo", "Reportar problema"],
    };
    return agentSuggestions[lastAgent] || agentSuggestions.orion;
  }, [messages, verified, agent, lang]);

  const firstFromAgent = useMemo(() => {
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

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");
    setMessages(prev => [...prev, { id: nextMsgId(), role: "user", content, timestamp: timestamp() }]);
    setLoading(true);

    try {
      const result = await sendResidentMessage(content, phone);

      // Handle agent transfer animation
      const targetAgent = result.agent || "orion";
      const doTransfer = targetAgent !== agent;

      if (doTransfer) {
        setMessages(prev => [...prev, { id: nextMsgId(), role: "transfer", to: targetAgent }]);
        setAgent(targetAgent);
        await new Promise(r => setTimeout(r, 700));
      }

      // Update session state
      if (result.sessionId) setSessionId(result.sessionId);
      if (result.verified) setVerified(true);
      if (result.residentName) setResidentName(result.residentName);

      // Build metadata for the message
      const metadata = {};
      if (result.intent) metadata.intent = result.intent;
      if (result.confidence) metadata.confidence = result.confidence;
      if (result.agentPath?.length) metadata.agentPath = result.agentPath;
      if (result.latencyMs) metadata.latencyMs = result.latencyMs;
      if (result.provider) metadata.provider = result.provider;
      if (result.requiresVerification) metadata.requiresVerification = true;

      setMessages(prev => [...prev, {
        id: nextMsgId(),
        role: "assistant",
        agent: targetAgent,
        content: result.response,
        timestamp: timestamp(),
        metadata,
      }]);

    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: nextMsgId(),
        role: "assistant",
        agent: "orion",
        content: "Lo siento, hubo un error de conexión. Intenta de nuevo en unos segundos.",
        timestamp: timestamp(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, agent]);

  return {
    messages, input, setInput, loading, agent, setAgent,
    lang, setLang, ratings, handleRate, verified, sessionId, stats,
    phone, setPhone, residentName,
    clearChat, exportChat, suggestions, firstFromAgent,
    sendMessage, bottomRef, inputRef,
  };
}
