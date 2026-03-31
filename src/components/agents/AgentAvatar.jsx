import { AGENTS } from "../../constants/agents.js";

export default function AgentAvatar({ agentId, size = 32 }) {
  const a = AGENTS[agentId] || AGENTS.orion;
  const fs = size === 32 ? 11 : size === 42 ? 14 : 9;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size > 36 ? 14 : "50%",
      background: a.gradient,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: fs, fontWeight: 700, color: "#fff",
      fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em", flexShrink: 0,
      boxShadow: `0 0 ${size > 36 ? 24 : 14}px ${a.shadow}`,
      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      {a.mono}
    </div>
  );
}
