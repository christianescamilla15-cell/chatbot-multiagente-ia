import { memo } from "react";
import { motion } from "framer-motion";
import { AGENTS } from "../../constants/agents.js";

function QuickActionsInner({ suggestions, loading, agent, onSend }) {
  const ca = AGENTS[agent] || AGENTS.orion;
  return (
    <div role="group" aria-label="Quick actions" style={{ padding: "0 16px 8px", display: "flex", gap: 6, overflowX: "auto", flexWrap: "nowrap", scrollbarWidth: "none" }}>
      {suggestions.map((s, i) => (
        <motion.button key={s} onClick={() => onSend(s)} disabled={loading}
          aria-label={s}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{
            scale: 1.04,
            borderColor: `${ca.color}40`,
            boxShadow: `0 0 12px ${ca.color}10`,
          }}
          whileTap={{ scale: 0.96 }}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, padding: "5px 12px", fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            whiteSpace: "nowrap", flexShrink: 0,
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={e => { e.target.style.color = ca.color; }}
          onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.5)"; }}
        >{s}</motion.button>
      ))}
    </div>
  );
}

const QuickActions = memo(QuickActionsInner);
export default QuickActions;
