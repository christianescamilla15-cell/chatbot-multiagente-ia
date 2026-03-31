import { memo } from "react";
import { motion } from "framer-motion";
import { AGENTS, agentRole } from "../../constants/agents.js";
import AgentAvatar from "./AgentAvatar.jsx";

function AgentSelectorInner({ agent, onSelect, lang }) {
  return (
    <div data-tour="agents" role="radiogroup" aria-label={lang === "en" ? "Select agent" : "Seleccionar agente"} style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", scrollbarWidth: "none" }}>
      {Object.entries(AGENTS).map(([id, ag], i) => {
        const isSelected = agent === id;
        return (
          <motion.button key={id} onClick={() => onSelect(id)}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${ag.name} - ${agentRole(id, lang)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{
              scale: 1.03,
              boxShadow: `0 0 20px ${ag.color}20`,
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
              borderRadius: 12,
              background: isSelected ? `${ag.color}20` : "rgba(255,255,255,0.03)",
              border: `1px solid ${isSelected ? ag.color + "40" : "rgba(255,255,255,0.06)"}`,
              backdropFilter: "blur(8px)",
              cursor: "pointer", flexShrink: 0,
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: isSelected ? `0 0 16px ${ag.color}15` : "none",
            }}
          >
            <AgentAvatar agentId={id} size={22} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? ag.color : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>{ag.name}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{agentRole(id, lang)}</div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

const AgentSelector = memo(AgentSelectorInner);
export default AgentSelector;
