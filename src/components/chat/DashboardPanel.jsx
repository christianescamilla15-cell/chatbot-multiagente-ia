import { useState, useEffect } from "react";
import { AGENTS } from "../../constants/agents.js";

const API_URL = import.meta.env.VITE_API_URL || "https://multiagente-api.onrender.com";

const TAB_STYLE = (active, color) => ({
  padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 600,
  background: active ? `${color}20` : "rgba(255,255,255,0.03)",
  color: active ? color : "rgba(255,255,255,0.4)",
  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
});

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPanel({ agent }) {
  const ca = AGENTS[agent] || AGENTS.orion;
  const [tab, setTab] = useState("tickets");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { loadTab(tab); }, [tab]);

  async function loadTab(t) {
    setLoading(true);
    try {
      let url;
      if (t === "tickets") url = `${API_URL}/api/residents/tickets?limit=15`;
      else if (t === "residents") url = `${API_URL}/api/residents/residents-list?per_page=15${search ? `&search=${search}` : ""}`;
      else if (t === "audit") url = `${API_URL}/api/residents/audit?limit=20`;
      else if (t === "stats") url = `${API_URL}/api/residents/stats`;
      else if (t === "runs") url = `${API_URL}/api/residents/runs?limit=15`;

      const res = await fetch(url);
      setData(await res.json());
    } catch (e) {
      setData({ error: e.message });
    }
    setLoading(false);
  }

  const STATUS_COLORS = {
    open: "#F59E0B", in_progress: "#3B82F6", pending: "#8B5CF6",
    resolved: "#10B981", escalated: "#EF4444", closed: "#6B7280",
  };

  return (
    <div style={{ padding: "12px 16px", maxHeight: 400, overflowY: "auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {["tickets", "residents", "runs", "audit", "stats"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={TAB_STYLE(tab === t, ca.color)}>
            {t === "tickets" ? "Tickets" : t === "residents" ? "Residentes" : t === "audit" ? "Auditoria" : t === "stats" ? "Stats" : "Ejecuciones"}
          </button>
        ))}
      </div>

      {/* Search (residents only) */}
      {tab === "residents" && (
        <div style={{ marginBottom: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadTab("residents")}
            placeholder="Buscar por nombre, unidad o telefono..."
            style={{ width: "100%", padding: "6px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#FAFAFA", fontSize: 12, outline: "none", fontFamily: "'DM Sans'" }}
          />
        </div>
      )}

      {loading && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", padding: 20 }}>Cargando...</div>}

      {!loading && data && !data.error && (
        <>
          {/* TICKETS */}
          {tab === "tickets" && data.tickets?.map(t => (
            <div key={t.ticket_ref} style={{ padding: "8px 10px", marginBottom: 6, background: "rgba(255,255,255,0.02)", borderRadius: 8, borderLeft: `3px solid ${STATUS_COLORS[t.status] || "#6B7280"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#FAFAFA", fontFamily: "'DM Mono'" }}>{t.ticket_ref}</span>
                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${STATUS_COLORS[t.status]}20`, color: STATUS_COLORS[t.status], fontWeight: 600 }}>{t.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{t.subject}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{t.category} | {t.priority} | {formatDate(t.created_at)}</div>
            </div>
          ))}

          {/* RESIDENTS */}
          {tab === "residents" && (
            <>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Total: {data.total} residentes</div>
              {data.residents?.map(r => (
                <div key={r.id} style={{ padding: "6px 10px", marginBottom: 4, background: "rgba(255,255,255,0.02)", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#FAFAFA", fontWeight: 500 }}>{r.full_name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{r.unit_number} | Edificio {r.building}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: r.resident_status === "active" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: r.resident_status === "active" ? "#10B981" : "#EF4444" }}>{r.resident_status}</span>
                </div>
              ))}
            </>
          )}

          {/* RUNS */}
          {tab === "runs" && data.runs?.map((r, i) => (
            <div key={i} style={{ padding: "6px 10px", marginBottom: 4, background: "rgba(255,255,255,0.02)", borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: ca.color, fontWeight: 600 }}>{r.intent || "unknown"}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{r.latency_ms}ms | {r.total_tokens} tokens</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                {(r.agent_path || []).join(" → ")} | {r.verification_state} | {formatDate(r.created_at)}
              </div>
            </div>
          ))}

          {/* AUDIT */}
          {tab === "audit" && data.logs?.map((l, i) => (
            <div key={i} style={{ padding: "5px 10px", marginBottom: 3, background: "rgba(255,255,255,0.02)", borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: l.change_type.includes("fail") ? "#EF4444" : "#10B981", fontWeight: 600 }}>{l.change_type}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{formatDate(l.created_at)}</span>
              </div>
              {l.field_changed && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{l.field_changed}: {l.previous_value} → {l.new_value}</div>}
            </div>
          ))}

          {/* STATS */}
          {tab === "stats" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Residentes", value: data.residents?.total || 0, sub: `${data.residents?.active || 0} activos` },
                { label: "Tickets", value: data.tickets?.total || 0, sub: `${data.tickets?.open || 0} abiertos` },
                { label: "Sesiones activas", value: data.sessions_active || 0 },
                { label: "Ejecuciones hoy", value: data.runs_today || 0 },
                { label: "Latencia promedio", value: `${data.avg_latency_ms || 0}ms` },
              ].map((s, i) => (
                <div key={i} style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: ca.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{s.sub}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {data?.error && <div style={{ color: "#EF4444", fontSize: 12 }}>Error: {data.error}</div>}
    </div>
  );
}
