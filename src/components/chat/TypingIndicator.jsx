import { motion } from "framer-motion";
import { AGENTS } from "../../constants/agents.js";

export default function TypingIndicator({ agent, lang }) {
  const a = AGENTS[agent] || AGENTS.orion;
  const text = lang === "en" ? `${a.name} is analyzing...` : `${a.name} est\u00E1 analizando...`;
  return (
    <div style={{ display: "flex", gap: 5, padding: "14px 18px", alignItems: "center" }}>
      <motion.div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, boxShadow: `0 0 8px ${a.color}40` }}
          />
        ))}
      </motion.div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 6, fontStyle: "italic" }}>{text}</span>
    </div>
  );
}
