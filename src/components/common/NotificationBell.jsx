import { useState, useRef, useEffect } from "react";

const TYPE_COLORS = {
  ticket_created: "#F59E0B",
  ticket_updated: "#3B82F6",
  ticket_escalated: "#EF4444",
};

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export default function NotificationBell({ notifications, unreadCount, connected, markRead, markAllRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${open ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 8, padding: "6px 8px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
          position: "relative",
        }}
      >
        {/* Bell icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={connected ? "#F59E0B" : "#6B7280"} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#EF4444", color: "#fff",
            borderRadius: "50%", width: 16, height: 16,
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}

        {/* Connection dot */}
        <div style={{
          width: 5, height: 5, borderRadius: "50%",
          background: connected ? "#10B981" : "#EF4444",
        }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0, marginTop: 8,
          width: 320, maxHeight: 400, overflowY: "auto",
          background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          zIndex: 100,
        }}>
          {/* Header */}
          <div style={{
            padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#F9FAFB" }}>
              Notificaciones {unreadCount > 0 && `(${unreadCount})`}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: "none", border: "none", color: "#3B82F6",
                fontSize: 10, cursor: "pointer",
              }}>Marcar todo leido</button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
              Sin notificaciones
            </div>
          ) : (
            notifications.slice(0, 15).map((n, i) => {
              const isNew = !n.read;
              const color = TYPE_COLORS[n.notification_type] || "#6B7280";
              return (
                <div
                  key={n.id || i}
                  onClick={() => n.id && markRead(n.id)}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: isNew ? "rgba(59,130,246,0.05)" : "transparent",
                    cursor: "pointer",
                    borderLeft: `3px solid ${isNew ? color : "transparent"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: "1px 6px",
                      borderRadius: 4, background: `${color}20`, color,
                    }}>
                      {(n.notification_type || "").replace("ticket_", "")}
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, color: isNew ? "#F9FAFB" : "rgba(255,255,255,0.5)",
                    marginTop: 4, lineHeight: 1.4,
                  }}>
                    {n.message}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
