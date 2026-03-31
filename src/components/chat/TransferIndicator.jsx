import { AGENTS, agentRole } from "../../constants/agents.js";
import AgentAvatar from "../agents/AgentAvatar.jsx";

export default function TransferIndicator({ to, lang }) {
  const a = AGENTS[to];
  const label = lang === "en" ? `Transferred to ${a?.name}` : `Transferido a ${a?.name}`;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 0" }}>
      <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${a?.color}30)` }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20,
        background: `${a?.color}10`,
        border: `1px solid ${a?.color}20`,
        backdropFilter: "blur(8px)",
      }}>
        <AgentAvatar agentId={to} size={18} />
        <span style={{ fontSize: 10, color: a?.color, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{"\u00B7"} {agentRole(to, lang)}</span>
      </div>
      <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${a?.color}30)` }} />
    </div>
  );
}
