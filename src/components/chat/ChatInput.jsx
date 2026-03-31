import { useState } from "react";
import { AGENTS } from "../../constants/agents.js";
import { Icons } from "../../constants/icons.js";

export default function ChatInput({ inputRef, input, setInput, loading, agent, onSend, lang, phone, setPhone, verified, residentName }) {
  const ca = AGENTS[agent] || AGENTS.orion;
  const canSend = input.trim() && !loading;
  const [showPhone, setShowPhone] = useState(false);

  return (
    <div data-tour="input" style={{
      padding: "10px 16px 14px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(12px)",
    }}>
      {/* Resident info bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 8, padding: "4px 8px",
        fontSize: 11, color: "rgba(255,255,255,0.4)",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: verified ? "#34D399" : "#F59E0B",
          boxShadow: verified ? "0 0 6px #34D399" : "0 0 6px #F59E0B",
        }} />
        <span>{residentName || "Sin identificar"}</span>
        {verified && <span style={{ color: "#34D399", fontSize: 10 }}>Verificado</span>}
        <span style={{ marginLeft: "auto", cursor: "pointer", textDecoration: "underline" }}
          onClick={() => setShowPhone(!showPhone)}>
          {showPhone ? phone : "Cambiar residente"}
        </span>
      </div>

      {/* Phone input (toggleable) */}
      {showPhone && (
        <div style={{
          display: "flex", gap: 8, marginBottom: 8,
          padding: "6px 10px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
        }}>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+5215XXXXXXXXX"
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#FAFAFA", fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              outline: "none",
            }}
          />
          <button onClick={() => setShowPhone(false)} style={{
            background: ca.gradient, border: "none", borderRadius: 6,
            padding: "4px 10px", fontSize: 10, color: "#fff",
            cursor: "pointer", fontWeight: 600,
          }}>OK</button>
        </div>
      )}

      {/* Message input */}
      <div style={{
        display: "flex", gap: 10, alignItems: "flex-end",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, padding: "10px 14px",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: `0 0 0 1px ${ca.color}06`,
        backdropFilter: "blur(8px)",
      }}
        onFocus={e => {
          e.currentTarget.style.borderColor = `${ca.color}35`;
          e.currentTarget.style.boxShadow = `0 0 0 1px ${ca.color}15, 0 0 24px ${ca.color}08`;
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          e.currentTarget.style.boxShadow = `0 0 0 1px ${ca.color}06`;
        }}
      >
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={lang === "en" ? "Type your message..." : "Escribe tu consulta..."}
          aria-label={lang === "en" ? "Message input" : "Entrada de mensaje"}
          rows={1} disabled={loading}
          style={{ flex: 1, background: "transparent", border: "none", color: "#FAFAFA", fontSize: 14, lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: 22, maxHeight: 100, overflowY: "auto", resize: "none", outline: "none" }}
        />
        <button onClick={() => onSend()} disabled={!canSend}
          aria-label={lang === "en" ? "Send message" : "Enviar mensaje"}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: canSend ? ca.gradient : "rgba(255,255,255,0.04)",
            border: "none", cursor: canSend ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: canSend ? `0 0 16px ${ca.shadow}` : "none",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={e => {
            if (canSend) e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >{Icons.send}</button>
      </div>
    </div>
  );
}
