// Chat state management hook — MultiAgente Resident Support System
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { timestamp, nextMsgId } from "../utils/messageFormatter.js";
import { sendResidentMessage, getSystemStats } from "../services/chatApi.js";
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
  const [residentName, setResidentName] = useState("Christian Hernandez Escamilla");
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
    setMessages([{ id: nextMsgId(), role: "assistant", agent: "orion", content: WELCOME_MSG, timestamp: timestamp() }]);
    setRatings({}); setAgent("orion"); setVerified(false); setSessionId("");
    localStorage.removeItem("multiagente_msgs"); localStorage.removeItem("multiagente_ratings");
  }, []);

  const exportChat = useCallback(() => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = `multiagente-chat-${Date.now()}.json`; a.click(); URL.revokeObjectURL(u);
  }, [messages]);

  const suggestions = useMemo(() => {
    if (messages.length <= 1) {
      return [
        "¿Cuál es el horario de la alberca?",
        "Quiero saber mi saldo pendiente",
        "Hay una fuga de agua en mi baño",
        "Mi internet no funciona",
        "Quiero reservar el salón de fiestas",
      ];
    }
    if (verified) {
      return ["¿Cuál es mi estado de cuenta?", "Necesito un recibo de pago", "¿Cuánto debo?"];
    }
    return [];
  }, [messages.length, verified]);

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
