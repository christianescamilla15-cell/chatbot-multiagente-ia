import { useState, useRef } from "react";
import { AGENTS } from "../../constants/agents.js";
import { Icons } from "../../constants/icons.js";

const GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export default function ChatInput({ inputRef, input, setInput, loading, agent, onSend, lang, phone, setPhone, verified, residentName }) {
  const ca = AGENTS[agent] || AGENTS.orion;
  const canSend = input.trim() && !loading;
  const [showPhone, setShowPhone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function transcribeAudio(blob) {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem("groq_api_key") || "";
    if (!groqKey) {
      setInput("(Audio no disponible sin API key)");
      return;
    }

    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      formData.append("model", "whisper-large-v3-turbo");
      formData.append("language", lang === "en" ? "en" : "es");
      formData.append("response_format", "text");

      const resp = await fetch(GROQ_WHISPER_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqKey}` },
        body: formData,
      });

      if (resp.ok) {
        const text = (await resp.text()).trim();
        if (text) {
          setInput(text);
          // Auto-send after transcription
          setTimeout(() => onSend(text), 100);
        }
      }
    } catch (err) {
      console.error("Whisper transcription error:", err);
    }
    setTranscribing(false);
  }

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

      {/* Message input + mic + send */}
      <div style={{
        display: "flex", gap: 8, alignItems: "flex-end",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${recording ? "#EF444440" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, padding: "10px 14px",
        transition: "all 0.3s ease",
        boxShadow: recording ? "0 0 12px rgba(239,68,68,0.15)" : `0 0 0 1px ${ca.color}06`,
      }}
        onFocus={e => {
          if (!recording) {
            e.currentTarget.style.borderColor = `${ca.color}35`;
            e.currentTarget.style.boxShadow = `0 0 0 1px ${ca.color}15, 0 0 24px ${ca.color}08`;
          }
        }}
        onBlur={e => {
          if (!recording) {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            e.currentTarget.style.boxShadow = `0 0 0 1px ${ca.color}06`;
          }
        }}
      >
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={transcribing ? "Transcribiendo..." : recording ? "Grabando..." : lang === "en" ? "Type or hold mic..." : "Escribe o manten mic..."}
          rows={1} disabled={loading || recording || transcribing}
          style={{ flex: 1, background: "transparent", border: "none", color: "#FAFAFA", fontSize: 14, lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: 22, maxHeight: 100, overflowY: "auto", resize: "none", outline: "none" }}
        />

        {/* Mic button */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={loading || transcribing}
          aria-label="Grabar audio"
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: recording ? "rgba(239,68,68,0.3)" : transcribing ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
            border: recording ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "all 0.3s ease",
            color: recording ? "#EF4444" : transcribing ? "#8B5CF6" : "rgba(255,255,255,0.4)",
            animation: recording ? "pulse 1s infinite" : "none",
          }}
        >
          {transcribing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          )}
        </button>

        {/* Send button */}
        <button onClick={() => onSend()} disabled={!canSend}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: canSend ? ca.gradient : "rgba(255,255,255,0.04)",
            border: "none", cursor: canSend ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: canSend ? `0 0 16px ${ca.shadow}` : "none",
            color: "#fff",
          }}
        >{Icons.send}</button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
