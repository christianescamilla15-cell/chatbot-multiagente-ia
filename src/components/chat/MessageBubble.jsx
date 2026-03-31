import { memo } from "react";
import { AGENTS, agentRole } from "../../constants/agents.js";
import { Icons } from "../../constants/icons.js";
import AgentAvatar from "../agents/AgentAvatar.jsx";

function UserAvatar({ lang }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, backdropFilter: "blur(8px)" }}>
      {lang === "en" ? "YOU" : "T\u00DA"}
    </div>
  );
}

function MessageBubbleInner({ msg, onRate, isFirstFromAgent, lang }) {
  const isUser = msg.role === "user";
  const a = AGENTS[msg.agent] || AGENTS.orion;
  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-end", gap: 10, marginBottom: 16 }}>
      {!isUser && <AgentAvatar agentId={msg.agent} />}
      <div style={{ maxWidth: "72%" }}>
        {!isUser && isFirstFromAgent && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: a.color, fontWeight: 600 }}>{a.name}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{"\u00B7"} {agentRole(msg.agent, lang)}</span>
          </div>
        )}
        <div style={{
          background: isUser ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
          border: isUser ? "1px solid rgba(99,102,241,0.2)" : `1px solid ${a.color}12`,
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px", fontSize: 14, lineHeight: 1.65,
          color: isUser ? "#FAFAFA" : "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap", wordBreak: "break-word",
          backdropFilter: "blur(12px)",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {msg.content}
        </div>
        {!isUser && msg.id && (
          <div style={{ display: "flex", gap: 4, marginTop: 5, marginLeft: 2, alignItems: "center" }}>
            <button onClick={() => onRate(msg.id, 1)} aria-label={lang === "en" ? "Rate positive" : "Calificar positivo"} style={{ background: msg.rating === 1 ? "rgba(16,185,129,0.2)" : "transparent", border: `1px solid ${msg.rating === 1 ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: msg.rating === 1 ? "#6EE7C7" : "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>{Icons.thumbUp}</button>
            <button onClick={() => onRate(msg.id, -1)} aria-label={lang === "en" ? "Rate negative" : "Calificar negativo"} style={{ background: msg.rating === -1 ? "rgba(239,68,68,0.2)" : "transparent", border: `1px solid ${msg.rating === -1 ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: msg.rating === -1 ? "#FCA5A5" : "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>{Icons.thumbDown}</button>
            {msg.timestamp && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>{msg.timestamp}</span>}
          </div>
        )}
      </div>
      {isUser && <UserAvatar lang={lang} />}
    </div>
  );
}

const MessageBubble = memo(MessageBubbleInner);
export default MessageBubble;
