import { AGENTS } from "../../constants/agents.js";

export default function StatsPanel({ messages, ratings, lang }) {
  const total = messages.filter(m => m.role === "user").length;
  const agentCounts = {};
  messages.filter(m => m.agent).forEach(m => { agentCounts[m.agent] = (agentCounts[m.agent] || 0) + 1; });
  const up = Object.values(ratings).filter(r => r === 1).length;
  const down = Object.values(ratings).filter(r => r === -1).length;
  const sat = up + down > 0 ? Math.round((up / (up + down)) * 100) : 0;
  const t = lang === "en"
    ? { messages: "Messages", satisfaction: "Satisfaction", distribution: "Distribution", rateHint: "Rate responses below" }
    : { messages: "Mensajes", satisfaction: "Satisfacci\u00F3n", distribution: "Distribuci\u00F3n", rateHint: "Califica respuestas abajo" };

  return (
    <div style={{
      padding: "14px 20px",
      background: "rgba(255,255,255,0.02)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.messages}</span>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: "#FAFAFA" }}>{total}</p>
        </div>
        <div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.satisfaction}</span>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: sat >= 70 ? "#6EE7C7" : sat >= 40 ? "#FDE68A" : up + down === 0 ? "rgba(255,255,255,0.15)" : "#FCA5A5" }}>
            {up + down > 0 ? `${sat}%` : "\u2014"}
          </p>
          {up + down === 0 && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.15)" }}>{t.rateHint}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.distribution}</span>
          <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            {Object.entries(agentCounts).map(([id, count]) => {
              const ag = AGENTS[id];
              return ag ? <span key={id} style={{ fontSize: 9, color: ag.color, background: `${ag.color}12`, border: `1px solid ${ag.color}20`, borderRadius: 10, padding: "2px 8px", fontWeight: 500, backdropFilter: "blur(8px)" }}>{ag.mono} {count}</span> : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
