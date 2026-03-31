import { AnimatePresence, motion } from "framer-motion";
import { AGENTS } from "../../constants/agents.js";
import AgentAvatar from "../agents/AgentAvatar.jsx";
import MessageBubble from "./MessageBubble.jsx";
import TransferIndicator from "./TransferIndicator.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

export default function ChatPanel({ messages, loading, agent, lang, firstFromAgent, onRate, bottomRef }) {
  const ca = AGENTS[agent] || AGENTS.orion;
  return (
    <div
      data-tour="messages"
      role="log"
      aria-live="polite"
      aria-label={lang === "en" ? "Chat messages" : "Mensajes del chat"}
      aria-busy={loading}
      style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}
    >
      <AnimatePresence initial={false}>
        {messages.map(msg =>
          msg.role === "transfer"
            ? (
              <motion.div key={msg.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <TransferIndicator to={msg.to} lang={lang} />
              </motion.div>
            )
            : (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <MessageBubble msg={msg} onRate={onRate} isFirstFromAgent={firstFromAgent[msg.id]} lang={lang} />
              </motion.div>
            )
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            aria-label={lang === "en" ? "Agent is typing" : "El agente esta escribiendo"}
            style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16 }}
          >
            <AgentAvatar agentId={agent} />
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${ca.color}12`,
              borderRadius: "18px 18px 18px 4px",
              backdropFilter: "blur(8px)",
            }}>
              <TypingIndicator agent={agent} lang={lang} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
