import { AGENTS, agentRole } from "../../constants/agents.js";
import { Icons } from "../../constants/icons.js";
import AgentAvatar from "../agents/AgentAvatar.jsx";

export default function Header({ agent, lang, setLang, showInfo, setShowInfo, showStats, setShowStats, showAgentStats, setShowAgentStats, exportChat, clearChat, messages, ratings, onStartTour }) {
  const ca = AGENTS[agent] || AGENTS.orion;

  const btnStyle = (active) => ({
    background: active ? `${ca.color}15` : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? `${ca.color}25` : "rgba(255,255,255,0.06)"}`,
    borderRadius: 8, padding: "6px 8px",
    color: active ? ca.color : "rgba(255,255,255,0.4)",
    cursor: "pointer", display: "flex", alignItems: "center",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    backdropFilter: "blur(8px)",
  });

  return (
    <div style={{
      padding: "16px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ animation: messages.length <= 1 ? "welcomePulse 0.5s ease" : "none" }}>
          <AgentAvatar agentId={agent} size={42} />
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#FAFAFA", letterSpacing: "-0.02em" }}>MultiAgente</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399" }} />
            <span style={{ fontSize: 10, color: ca.color, fontWeight: 500, transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>{ca.name} {"\u00B7"} {agentRole(agent, lang)}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <div role="group" aria-label={lang === "en" ? "Language selector" : "Selector de idioma"} style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setLang("es")} aria-label="Espanol" aria-pressed={lang === "es"} style={{ background: lang === "es" ? `${ca.color}20` : "rgba(255,255,255,0.03)", border: "none", padding: "5px 8px", fontSize: 10, fontWeight: 600, color: lang === "es" ? ca.color : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", letterSpacing: "0.02em" }}>ES</button>
          <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
          <button onClick={() => setLang("en")} aria-label="English" aria-pressed={lang === "en"} style={{ background: lang === "en" ? `${ca.color}20` : "rgba(255,255,255,0.03)", border: "none", padding: "5px 8px", fontSize: 10, fontWeight: 600, color: lang === "en" ? ca.color : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", letterSpacing: "0.02em" }}>EN</button>
        </div>
        <button onClick={() => { setShowInfo(v => !v); setShowStats(false); setShowAgentStats(false); }} aria-label={lang === "en" ? "Agent info" : "Info del agente"} aria-pressed={showInfo} title="Info" style={btnStyle(showInfo)}>{Icons.info}</button>
        <button data-tour="stats-btn" onClick={() => { setShowStats(v => !v); setShowInfo(false); setShowAgentStats(false); }} aria-label={lang === "en" ? "Analytics" : "Estadisticas"} aria-pressed={showStats} title="Analytics" style={btnStyle(showStats)}>{Icons.chart}</button>
        <button onClick={() => { setShowAgentStats(v => !v); setShowStats(false); setShowInfo(false); }} aria-label={lang === "en" ? "Agent performance" : "Rendimiento de agentes"} aria-pressed={showAgentStats} title={lang === "en" ? "Agent Stats" : "Stats Agentes"} style={{ ...btnStyle(showAgentStats), fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>AG</button>
        <button onClick={exportChat} aria-label={lang === "en" ? "Export chat" : "Exportar chat"} title={lang === "en" ? "Export" : "Exportar"} style={btnStyle(false)}>{Icons.download}</button>
        <button onClick={clearChat} aria-label={lang === "en" ? "Clear chat" : "Limpiar chat"} title={lang === "en" ? "Clear" : "Limpiar"} style={btnStyle(false)}>{Icons.trash}</button>
        <button onClick={onStartTour} aria-label={lang === "en" ? "Start tour" : "Iniciar tour"} title="Tour" style={{ ...btnStyle(false), fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", width: 30, height: 30, justifyContent: "center" }}>?</button>
      </div>
    </div>
  );
}
