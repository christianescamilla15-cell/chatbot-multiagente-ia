import { useMemo } from "react";
import { motion } from "framer-motion";
import { AGENTS } from "../../constants/agents.js";
import { calculateAgentStats } from "../../utils/statsCalculator.js";

const INTENT_LABELS = {
  nova: { es: "Ventas", en: "Sales" },
  atlas: { es: "Soporte", en: "Support" },
  aria: { es: "Facturacion", en: "Billing" },
  nexus: { es: "Escalamiento", en: "Escalation" },
  orion: { es: "General", en: "General" },
};

export default function AgentStats({ messages, ratings, lang }) {
  const stats = useMemo(() => calculateAgentStats(messages, ratings), [messages, ratings]);

  const maxCount = Math.max(1, ...Object.values(stats).map(s => s.messageCount));
  const activeAgents = Object.values(stats).filter(s => s.messageCount > 0);

  const t = lang === "en"
    ? { title: "Agent Performance", msgs: "msgs", rating: "rating", intents: "top intents", noData: "No messages yet. Start chatting to see agent stats." }
    : { title: "Rendimiento de Agentes", msgs: "msgs", rating: "rating", intents: "intenciones", noData: "Sin mensajes aun. Inicia una conversacion para ver estadisticas." };

  return (
    <div
      role="region"
      aria-label={t.title}
      style={{
        padding: "14px 20px",
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        maxHeight: 260, overflowY: "auto",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
        {t.title}
      </div>

      {activeAgents.length === 0 ? (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>{t.noData}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeAgents.map((entry, i) => {
            const ag = AGENTS[entry.agentId];
            const barWidth = Math.round((entry.messageCount / maxCount) * 100);
            const intentLabel = entry.topIntents.length > 0
              ? entry.topIntents.map(intent => {
                  const label = INTENT_LABELS[intent.name]?.[lang] || intent.name;
                  return `${label} (${intent.count})`;
                }).join(", ")
              : null;

            return (
              <motion.div key={entry.agentId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                {/* Agent name + count */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: ag.color }}>{ag.name}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      {entry.messageCount} {t.msgs}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {entry.totalRated > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: entry.avgRating >= 70 ? "#6EE7C7" : entry.avgRating >= 40 ? "#FDE68A" : "#FCA5A5",
                      }}>
                        {entry.avgRating}% {t.rating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar chart */}
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                  <motion.div
                    role="progressbar"
                    aria-valuenow={entry.messageCount}
                    aria-valuemin={0}
                    aria-valuemax={maxCount}
                    aria-label={`${ag.name}: ${entry.messageCount} ${t.msgs}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      height: "100%", borderRadius: 3,
                      background: ag.gradient,
                      boxShadow: `0 0 8px ${ag.shadow}`,
                    }}
                  />
                </div>

                {/* Top intents */}
                {intentLabel && (
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                    {t.intents}: {intentLabel}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
