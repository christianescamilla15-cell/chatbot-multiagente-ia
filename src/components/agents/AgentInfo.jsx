import { AGENTS } from "../../constants/agents.js";

export default function AgentInfo({ agent, lang }) {
  const ca = AGENTS[agent] || AGENTS.orion;
  return (
    <div style={{
      padding: "12px 20px",
      background: `${ca.color}06`,
      borderBottom: `1px solid ${ca.color}15`,
      backdropFilter: "blur(12px)",
    }}>
      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
        {lang === "en" ? (
          <><strong style={{ color: ca.color }}>5 AI agents</strong> with intent classification, sentiment detection and automatic routing. Each agent has its own personality, knowledge base and tone. Powered by <strong>Claude API</strong>, orchestrated with <strong>n8n</strong>.</>
        ) : (
          <><strong style={{ color: ca.color }}>5 agentes IA</strong> con clasificaci&oacute;n de intenci&oacute;n, detecci&oacute;n de sentimiento y enrutamiento autom&aacute;tico. Cada agente tiene personalidad, base de conocimiento y tono propio. Powered by <strong>Claude API</strong>, orquestado con <strong>n8n</strong>.</>
        )}
      </p>
    </div>
  );
}
