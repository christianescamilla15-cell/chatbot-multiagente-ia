import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "../../constants/icons.js";
import { exportConversation } from "../../utils/conversationExport.js";

export default function ExportButton({ messages, agent, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleExport = (format) => {
    const { blob, filename } = exportConversation(messages, format);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={lang === "en" ? "Export conversation" : "Exportar conversacion"}
        aria-expanded={open}
        aria-haspopup="true"
        title={lang === "en" ? "Export" : "Exportar"}
        style={{
          background: open ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${open ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 8, padding: "6px 8px",
          color: open ? "#6366F1" : "rgba(255,255,255,0.4)",
          cursor: "pointer", display: "flex", alignItems: "center",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          backdropFilter: "blur(8px)",
        }}
      >
        {Icons.download}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
              background: "rgba(15,17,23,0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: 4, minWidth: 140,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            <button
              role="menuitem"
              onClick={() => handleExport("txt")}
              aria-label={lang === "en" ? "Export as text" : "Exportar como texto"}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                background: "transparent", border: "none", borderRadius: 6,
                padding: "8px 10px", color: "rgba(255,255,255,0.75)", fontSize: 12,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                transition: "background 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14 }}>TXT</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                {lang === "en" ? "Plain text" : "Texto plano"}
              </span>
            </button>
            <button
              role="menuitem"
              onClick={() => handleExport("json")}
              aria-label={lang === "en" ? "Export as JSON" : "Exportar como JSON"}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                background: "transparent", border: "none", borderRadius: 6,
                padding: "8px 10px", color: "rgba(255,255,255,0.75)", fontSize: 12,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                transition: "background 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14 }}>JSON</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                {lang === "en" ? "Structured data" : "Datos estructurados"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
