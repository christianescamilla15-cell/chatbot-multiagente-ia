import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "https://multiagente-api.onrender.com";

const COLORS = {
  bg: "#0B1120", card: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#F9FAFB", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  blue: "#3B82F6", green: "#10B981", red: "#EF4444", yellow: "#F59E0B",
  purple: "#8B5CF6", pink: "#EC4899", teal: "#14B8A6",
};

const STATUS_COLORS = {
  active: COLORS.green, inactive: COLORS.yellow, suspended: COLORS.red, blocked: COLORS.red,
  archived: COLORS.dim, pending_removal: COLORS.pink,
  open: COLORS.yellow, in_progress: COLORS.blue, pending: COLORS.purple,
  resolved: COLORS.green, escalated: COLORS.red, closed: COLORS.dim,
  paid: COLORS.green, partial: COLORS.yellow, overdue: COLORS.red,
  low: COLORS.teal, medium: COLORS.yellow, high: COLORS.pink, urgent: COLORS.red,
};

function Badge({ text, color }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
      background: `${color || COLORS.dim}20`, color: color || COLORS.dim,
      whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function fmt(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function fmtMoney(n) {
  if (n == null) return "-";
  return `$${Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

async function api(path) {
  try {
    const r = await fetch(`${API}${path}`);
    return await r.json();
  } catch { return null; }
}

async function apiPost(path, body) {
  try {
    const r = await fetch(`${API}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch { return null; }
}

// ── STYLES ──
const sidebarBtn = (active) => ({
  display: "block", width: "100%", textAlign: "left",
  padding: "10px 16px", border: "none", borderRadius: 8, cursor: "pointer",
  background: active ? `${COLORS.blue}30` : "rgba(255,255,255,0.05)",
  color: active ? "#FFFFFF" : "#E2E8F0",
  fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: "'DM Sans', sans-serif",
  borderLeft: active ? `3px solid ${COLORS.blue}` : "3px solid transparent",
  transition: "all 0.2s",
});

const inputStyle = {
  padding: "8px 12px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
  borderRadius: 8, color: COLORS.text, fontSize: 13, outline: "none",
  fontFamily: "'DM Sans', sans-serif", width: "100%",
};

const tableRow = {
  padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`,
  display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
  fontSize: 12, color: COLORS.text,
};

const kpiCard = (color) => ({
  padding: "16px 20px", background: COLORS.card, borderRadius: 12,
  border: `1px solid ${COLORS.border}`, flex: "1 1 140px", minWidth: 140,
  borderTop: `3px solid ${color}`,
});


// ═══════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════

export default function AdminPanel({ onClose }) {
  const [section, setSection] = useState("dashboard");
  const [detailId, setDetailId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const sections = [
    { id: "dashboard", label: "Dashboard", icon: "D" },
    { id: "residents", label: "Residentes", icon: "R" },
    { id: "sessions", label: "Sesiones", icon: "S" },
    { id: "tickets", label: "Tickets", icon: "T" },
    { id: "payments", label: "Pagos", icon: "P" },
    { id: "sync", label: "Sync / Drive", icon: "Y" },
    { id: "audit", label: "Auditoria", icon: "A" },
    { id: "runs", label: "Ejecuciones", icon: "E" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: COLORS.bg, display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Sidebar */}
      <div style={{
        width: isMobile ? "100%" : 210, background: "#1E293B",
        borderRight: isMobile ? "none" : `1px solid ${COLORS.border}`,
        borderBottom: isMobile ? `1px solid ${COLORS.border}` : "none",
        padding: isMobile ? "8px" : "16px 8px",
        display: "flex", flexDirection: isMobile ? "row" : "column",
        gap: isMobile ? 4 : 2, overflowX: isMobile ? "auto" : "visible",
        flexShrink: 0,
      }}>
        {!isMobile && (
          <div style={{ padding: "8px 16px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, fontFamily: "'Syne', sans-serif" }}>Admin</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>X</button>
          </div>
        )}
        {isMobile && (
          <button onClick={onClose} style={{ ...sidebarBtn(false), minWidth: 40, textAlign: "center", color: COLORS.red, fontWeight: 700 }}>X</button>
        )}
        {sections.map(s => (
          <button key={s.id} onClick={() => { setSection(s.id); setDetailId(null); }}
            style={{ ...sidebarBtn(section === s.id), ...(isMobile ? { whiteSpace: "nowrap", minWidth: "auto", padding: "8px 12px" } : {}) }}>
            {isMobile ? s.icon : s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: isMobile ? 12 : 24 }}>
        {section === "dashboard" && <DashboardSection />}
        {section === "residents" && !detailId && <ResidentsSection onSelect={setDetailId} />}
        {section === "residents" && detailId && <ResidentDetail id={detailId} onBack={() => setDetailId(null)} />}
        {section === "sessions" && <SessionsSection />}
        {section === "tickets" && <TicketsSection />}
        {section === "payments" && <PaymentsSection />}
        {section === "sync" && <SyncSection />}
        {section === "audit" && <AuditSection />}
        {section === "runs" && <RunsSection />}
      </div>
    </div>
  );
}


// ── DASHBOARD ──
function DashboardSection() {
  const [data, setData] = useState(null);
  useEffect(() => { api("/api/admin/dashboard").then(setData); }, []);

  if (!data) return <Loading />;

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Dashboard</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <KPI label="Residentes" value={data.residents?.total ?? 0} sub={`${data.residents?.active ?? 0} activos`} color={COLORS.blue} />
        <KPI label="Multi-hogar" value={data.residents?.multi_household ?? 0} color={COLORS.purple} />
        <KPI label="Sesiones Verificadas" value={data.sessions?.verified ?? 0} sub={`${data.sessions?.pending ?? 0} pendientes`} color={COLORS.green} />
        <KPI label="Tickets Abiertos" value={data.tickets?.open ?? 0} sub={`${data.tickets?.urgent ?? 0} urgentes`} color={COLORS.yellow} />
        <KPI label="Escalados" value={data.tickets?.escalated ?? 0} color={COLORS.red} />
        <KPI label="Pagos Vencidos" value={data.payments?.overdue ?? 0} color={COLORS.red} />
        <KPI label="Saldo Pendiente" value={fmtMoney(data.payments?.total_outstanding)} color={COLORS.pink} />
        <KPI label="Pagados vs No" value={`${data.payments?.paid ?? 0} / ${data.payments?.unpaid ?? 0}`} color={COLORS.green} />
        <KPI label="Conflictos Sync" value={data.sync?.pending_conflicts ?? 0} color={COLORS.yellow} />
        <KPI label="Pendientes Remover" value={data.sync?.pending_removal ?? 0} color={COLORS.pink} />
        <KPI label="Ejecuciones Hoy" value={data.operations?.runs_today ?? 0} color={COLORS.teal} />
        <KPI label="Latencia Promedio" value={`${data.operations?.avg_latency_ms ?? 0}ms`} color={COLORS.blue} />
      </div>
    </div>
  );
}

function KPI({ label, value, sub, color }) {
  return (
    <div style={kpiCard(color)}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: COLORS.dim }}>{sub}</div>}
    </div>
  );
}


// ── RESIDENTS ──
function ResidentsSection({ onSelect }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    let url = `/api/admin/residents?page=${page}&per_page=15`;
    if (search) url += `&search=${search}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    api(url).then(setData);
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  if (!data) return <Loading />;

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Residentes ({data.total})</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input placeholder="Buscar nombre, unidad, telefono..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()}
          style={{ ...inputStyle, flex: "1 1 200px" }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width: "auto", flex: "0 0 150px" }}>
          <option value="">Todos los status</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="suspended">Suspendido</option>
          <option value="pending_removal">Pendiente remover</option>
        </select>
      </div>

      {data.residents?.map(r => (
        <div key={r.id} onClick={() => onSelect(r.id)} style={{ ...tableRow, cursor: "pointer", borderRadius: 8, marginBottom: 4, background: COLORS.card }}>
          <div style={{ flex: "1 1 180px" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.full_name}</div>
            <div style={{ color: COLORS.dim, fontSize: 11 }}>{r.unit_number} | Edif. {r.building}</div>
          </div>
          <div style={{ flex: "0 0 130px", fontSize: 11, color: COLORS.dim }}>{r.phone}</div>
          <Badge text={r.resident_status} color={STATUS_COLORS[r.resident_status]} />
          {r.multi_household && <Badge text="Multi-hogar" color={COLORS.purple} />}
          <div style={{ fontSize: 10, color: COLORS.dim }}>{fmt(r.created_at)}</div>
        </div>
      ))}

      <Pagination page={page} total={data.total} perPage={15} onPage={setPage} />
    </div>
  );
}


// ── RESIDENT DETAIL ──
function ResidentDetail({ id, onBack }) {
  const [data, setData] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => { api(`/api/admin/residents/${id}`).then(setData); }, [id]);

  if (!data) return <Loading />;
  const r = data.resident || {};

  async function doAction(action) {
    if (!confirm(`Confirmar: ${action} para ${r.full_name}?`)) return;
    const res = await apiPost(`/api/admin/residents/${id}/action`, { action });
    setActionMsg(res?.status ? `Status cambiado a: ${res.status}` : "Error");
    api(`/api/admin/residents/${id}`).then(setData);
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.blue, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Volver a Residentes</button>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: "1 1 300px", background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.text, fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>{r.full_name}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 12 }}>
            <Field label="Unidad" value={r.unit_number} />
            <Field label="Edificio" value={r.building} />
            <Field label="Telefono" value={r.phone} />
            <Field label="Email" value={r.email} />
            <Field label="Status" value={<Badge text={r.resident_status} color={STATUS_COLORS[r.resident_status]} />} />
            <Field label="Verificacion" value={r.verification_enabled ? "Habilitada" : "Deshabilitada"} />
            <Field label="Tipo vivienda" value={r.home_type || "apartment"} />
            <Field label="Recamaras" value={r.bedrooms} />
            <Field label="Banos" value={r.bathrooms} />
            <Field label="Estacionamiento" value={r.has_parking ? "Si" : "No"} />
            <Field label="Multi-hogar" value={r.multi_household ? "Si" : "No"} />
            <Field label="Ocupantes" value={r.occupants_count} />
          </div>
          {r.notes && <div style={{ marginTop: 12, fontSize: 12, color: COLORS.muted, fontStyle: "italic" }}>{r.notes}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {r.resident_status !== "inactive" && <ActionBtn label="Desactivar" color={COLORS.yellow} onClick={() => doAction("mark_inactive")} />}
            {r.resident_status !== "active" && <ActionBtn label="Restaurar" color={COLORS.green} onClick={() => doAction("restore")} />}
            {r.resident_status !== "archived" && <ActionBtn label="Archivar" color={COLORS.dim} onClick={() => doAction("archive")} />}
            {r.resident_status !== "blocked" && <ActionBtn label="Bloquear" color={COLORS.red} onClick={() => doAction("block")} />}
          </div>
          {actionMsg && <div style={{ marginTop: 8, fontSize: 11, color: COLORS.green }}>{actionMsg}</div>}
        </div>
      </div>

      {/* Tabs for operational data */}
      <DetailTabs data={data} />
    </div>
  );
}

function DetailTabs({ data }) {
  const [tab, setTab] = useState("tickets");
  const tabs = ["tickets", "payments", "sessions", "verifications", "messages", "audit"];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: tab === t ? `${COLORS.blue}20` : "transparent", color: tab === t ? COLORS.blue : COLORS.muted,
          }}>{t.charAt(0).toUpperCase() + t.slice(1)} ({data[t]?.length || 0})</button>
        ))}
      </div>

      {tab === "tickets" && data.tickets?.map((t, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 11 }}>{t.ticket_ref}</span>
          <span style={{ flex: 1 }}>{t.subject}</span>
          <Badge text={t.status} color={STATUS_COLORS[t.status]} />
          <Badge text={t.priority} color={STATUS_COLORS[t.priority]} />
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(t.created_at)}</span>
        </div>
      ))}

      {tab === "payments" && data.payments?.map((p, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <span style={{ flex: 1 }}>{p.concept}</span>
          <span>{fmtMoney(p.amount)}</span>
          <span style={{ color: p.current_balance > 0 ? COLORS.red : COLORS.green }}>{fmtMoney(p.current_balance)}</span>
          <Badge text={p.payment_status} color={STATUS_COLORS[p.payment_status]} />
          <span style={{ fontSize: 10, color: COLORS.dim }}>{p.due_date}</span>
        </div>
      ))}

      {tab === "sessions" && data.sessions?.map((s, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <Badge text={s.is_verified ? "Verificado" : "No verificado"} color={s.is_verified ? COLORS.green : COLORS.yellow} />
          <span style={{ fontSize: 11 }}>{s.verification_level}</span>
          <span style={{ fontSize: 11, color: COLORS.dim }}>{s.current_agent || "-"}</span>
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(s.created_at)} - {fmt(s.expires_at)}</span>
        </div>
      ))}

      {tab === "verifications" && data.verifications?.map((v, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: "monospace" }}>{v.code}</span>
          <Badge text={v.status} color={v.status === "verified" ? COLORS.green : v.status === "failed" ? COLORS.red : COLORS.yellow} />
          <span style={{ fontSize: 11 }}>Intentos: {v.attempts}/{v.max_attempts}</span>
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(v.created_at)}</span>
        </div>
      ))}

      {tab === "messages" && data.messages?.map((m, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4, borderLeft: `3px solid ${m.direction === "inbound" ? COLORS.blue : COLORS.green}` }}>
          <Badge text={m.direction} color={m.direction === "inbound" ? COLORS.blue : COLORS.green} />
          <span style={{ fontSize: 11, color: COLORS.dim }}>{m.agent || "-"}</span>
          <span style={{ flex: 1, fontSize: 12 }}>{(m.content || "").substring(0, 120)}</span>
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(m.created_at)}</span>
        </div>
      ))}

      {tab === "audit" && data.audit?.map((a, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <Badge text={a.change_type} color={a.change_type.includes("fail") ? COLORS.red : COLORS.green} />
          <span style={{ fontSize: 11 }}>{a.field_changed || "-"}</span>
          <span style={{ fontSize: 11, color: COLORS.dim }}>{a.previous_value || ""} → {a.new_value || ""}</span>
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(a.created_at)}</span>
        </div>
      ))}

      {(!data[tab] || data[tab].length === 0) && <div style={{ color: COLORS.dim, fontSize: 12, padding: 20, textAlign: "center" }}>Sin datos</div>}
    </div>
  );
}


// ── SESSIONS ──
function SessionsSection() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    let url = "/api/admin/sessions?per_page=20";
    if (filter) url += `&verified=${filter}`;
    api(url).then(setData);
  }, [filter]);

  if (!data) return <Loading />;

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Sesiones ({data.total})</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["", "true", "false"].map(v => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 11, cursor: "pointer",
            background: filter === v ? `${COLORS.blue}20` : COLORS.card, color: filter === v ? COLORS.blue : COLORS.muted,
          }}>{v === "" ? "Todas" : v === "true" ? "Verificadas" : "No verificadas"}</button>
        ))}
      </div>
      {data.sessions?.map((s, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <div style={{ flex: "1 1 150px" }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{s.resident_name || "Desconocido"}</div>
            <div style={{ fontSize: 10, color: COLORS.dim }}>{s.unit_number} | {s.phone}</div>
          </div>
          <Badge text={s.is_verified ? "Verificado" : "Pendiente"} color={s.is_verified ? COLORS.green : COLORS.yellow} />
          <span style={{ fontSize: 11, color: COLORS.dim }}>{s.current_agent || "-"}</span>
          <span style={{ fontSize: 11, color: COLORS.dim }}>Esc: {s.escalation_level || 0}</span>
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(s.last_activity)}</span>
        </div>
      ))}
    </div>
  );
}


// ── TICKETS ──
function TicketsSection() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ category: "", priority: "", status: "", search: "" });
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    let url = `/api/admin/tickets?page=${page}&per_page=15`;
    if (filters.category) url += `&category=${filters.category}`;
    if (filters.priority) url += `&priority=${filters.priority}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.search) url += `&search=${filters.search}`;
    api(url).then(setData);
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);
  if (!data) return <Loading />;

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Tickets ({data.total})</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input placeholder="Buscar ticket, residente..." value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })} onKeyDown={e => e.key === "Enter" && load()}
          style={{ ...inputStyle, flex: "1 1 200px" }} />
        <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
          <option value="">Categoria</option>
          {["technical_support", "maintenance", "billing", "general", "escalation"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
          <option value="">Prioridad</option>
          {["low", "medium", "high", "urgent"].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
          <option value="">Status</option>
          {["open", "in_progress", "pending", "resolved", "escalated", "closed"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {data.tickets?.map((t, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4, borderLeft: `3px solid ${STATUS_COLORS[t.priority] || COLORS.dim}` }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, flex: "0 0 80px" }}>{t.ticket_ref}</span>
          <div style={{ flex: "1 1 150px" }}>
            <div style={{ fontSize: 12 }}>{t.subject}</div>
            <div style={{ fontSize: 10, color: COLORS.dim }}>{t.resident_name || "?"}</div>
          </div>
          <Badge text={t.category} color={COLORS.teal} />
          <Badge text={t.priority} color={STATUS_COLORS[t.priority]} />
          <Badge text={t.status} color={STATUS_COLORS[t.status]} />
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(t.created_at)}</span>
        </div>
      ))}
      <Pagination page={page} total={data.total} perPage={15} onPage={setPage} />
    </div>
  );
}


// ── PAYMENTS ──
function PaymentsSection() {
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    let url = `/api/admin/payments?page=${page}&per_page=15`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (search) url += `&search=${search}`;
    api(url).then(setData);
  }, [page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);
  if (!data) return <Loading />;

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Pagos ({data.total})</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input placeholder="Buscar residente, unidad..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()}
          style={{ ...inputStyle, flex: "1 1 200px" }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto" }}>
          <option value="">Todos</option>
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
          <option value="partial">Parcial</option>
          <option value="overdue">Vencido</option>
        </select>
      </div>

      {data.payments?.map((p, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <div style={{ flex: "1 1 150px" }}>
            <div style={{ fontWeight: 500, fontSize: 12 }}>{p.resident_name || "?"}</div>
            <div style={{ fontSize: 10, color: COLORS.dim }}>{p.unit_number}</div>
          </div>
          <span style={{ fontSize: 12 }}>{p.concept?.substring(0, 30)}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{fmtMoney(p.amount)}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: p.current_balance > 0 ? COLORS.red : COLORS.green }}>{fmtMoney(p.current_balance)}</span>
          <Badge text={p.payment_status} color={STATUS_COLORS[p.payment_status]} />
          <span style={{ fontSize: 10, color: COLORS.dim }}>{p.due_date || "-"}</span>
        </div>
      ))}
      <Pagination page={page} total={data.total} perPage={15} onPage={setPage} />
    </div>
  );
}


// ── SYNC CONFLICTS ──
function SyncSection() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");

  const load = useCallback(() => {
    let url = "/api/admin/sync-conflicts?per_page=20";
    if (filter) url += `&status=${filter}`;
    api(url).then(setData);
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  if (!data) return <Loading />;

  async function resolve(id, action) {
    await apiPost(`/api/admin/sync-conflicts/${id}/resolve`, { action, resolved_by: "admin" });
    load();
  }

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Sync / Drive Conflicts ({data.total})</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["", "pending", "resolved", "ignored"].map(v => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 11, cursor: "pointer",
            background: filter === v ? `${COLORS.blue}20` : COLORS.card, color: filter === v ? COLORS.blue : COLORS.muted,
          }}>{v || "Todos"}</button>
        ))}
      </div>

      {data.conflicts?.length === 0 && <div style={{ color: COLORS.dim, textAlign: "center", padding: 40 }}>Sin conflictos</div>}

      {data.conflicts?.map((c, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 8, marginBottom: 6, flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Badge text={c.conflict_type} color={COLORS.red} />
            <Badge text={c.resolution_status} color={c.resolution_status === "pending" ? COLORS.yellow : COLORS.green} />
            <span style={{ fontSize: 11 }}>{c.resident_name || `ID: ${c.resident_id || "?"}`}</span>
            <span style={{ fontSize: 10, color: COLORS.dim, marginLeft: "auto" }}>{fmt(c.created_at)}</span>
          </div>
          {c.field_name && (
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
              Campo: <strong>{c.field_name}</strong> | Drive: "{c.source_value}" | DB: "{c.database_value}"
            </div>
          )}
          {c.resolution_status === "pending" && (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <ActionBtn label="Resolver" color={COLORS.green} onClick={() => resolve(c.id, "resolve")} />
              <ActionBtn label="Ignorar" color={COLORS.dim} onClick={() => resolve(c.id, "ignore")} />
              <ActionBtn label="Escalar" color={COLORS.red} onClick={() => resolve(c.id, "escalate")} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


// ── AUDIT LOG ──
function AuditSection() {
  const [data, setData] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let url = `/api/admin/audit?page=${page}&per_page=25`;
    if (typeFilter) url += `&change_type=${typeFilter}`;
    api(url).then(setData);
  }, [page, typeFilter]);

  if (!data) return <Loading />;

  const types = ["otp_send", "otp_verify", "otp_fail", "session_create", "session_expire", "create", "update", "mark_inactive", "ticket_create", "escalation"];

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Auditoria ({data.total})</h2>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setTypeFilter("")} style={{ padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 10, cursor: "pointer", background: !typeFilter ? `${COLORS.blue}20` : COLORS.card, color: !typeFilter ? COLORS.blue : COLORS.muted }}>Todos</button>
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 10, cursor: "pointer", background: typeFilter === t ? `${COLORS.blue}20` : COLORS.card, color: typeFilter === t ? COLORS.blue : COLORS.muted }}>{t}</button>
        ))}
      </div>

      {data.logs?.map((l, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 3 }}>
          <Badge text={l.change_type} color={l.change_type.includes("fail") ? COLORS.red : l.change_type.includes("verify") ? COLORS.green : COLORS.blue} />
          <span style={{ fontSize: 11, flex: "0 0 120px" }}>{l.resident_name || `ID:${l.resident_id || "?"}`}</span>
          <span style={{ fontSize: 11, color: COLORS.muted, flex: 1 }}>
            {l.field_changed ? `${l.field_changed}: ${l.previous_value || ""} → ${l.new_value || ""}` : l.source || "-"}
          </span>
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(l.created_at)}</span>
        </div>
      ))}
      <Pagination page={page} total={data.total} perPage={25} onPage={setPage} />
    </div>
  );
}


// ── RUNS ──
function RunsSection() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => { api(`/api/admin/runs?page=${page}&per_page=20`).then(setData); }, [page]);
  if (!data) return <Loading />;

  return (
    <div>
      <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Ejecuciones de Agentes ({data.total})</h2>
      {data.runs?.map((r, i) => (
        <div key={i} style={{ ...tableRow, background: COLORS.card, borderRadius: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.blue, flex: "0 0 100px" }}>{r.intent || "?"}</span>
          <span style={{ fontSize: 11, flex: "0 0 120px" }}>{r.resident_name || `ID:${r.resident_id || "?"}`}</span>
          <span style={{ fontSize: 10, color: COLORS.dim, flex: 1 }}>{(r.agent_path || []).join(" → ")}</span>
          <Badge text={r.verification_state || "none"} color={r.verification_state === "verified" ? COLORS.green : COLORS.yellow} />
          <span style={{ fontSize: 10, color: COLORS.teal }}>{r.latency_ms}ms</span>
          <span style={{ fontSize: 10, color: COLORS.purple }}>{r.total_tokens} tok</span>
          <span style={{ fontSize: 10, color: COLORS.dim }}>{fmt(r.created_at)}</span>
        </div>
      ))}
      <Pagination page={page} total={data.total} perPage={20} onPage={setPage} />
    </div>
  );
}


// ── SHARED COMPONENTS ──
function Loading() {
  return <div style={{ color: COLORS.dim, textAlign: "center", padding: 40 }}>Cargando...</div>;
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: COLORS.dim }}>{label}</div>
      <div style={{ fontSize: 13, color: COLORS.text }}>{value ?? "No data"}</div>
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 12px", borderRadius: 6, border: `1px solid ${color}40`,
      background: `${color}15`, color, fontSize: 11, fontWeight: 600, cursor: "pointer",
    }}>{label}</button>
  );
}

function Pagination({ page, total, perPage, onPage }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 16 }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: COLORS.card, color: COLORS.muted, cursor: "pointer", fontSize: 12 }}>Ant</button>
      <span style={{ padding: "4px 12px", fontSize: 12, color: COLORS.muted }}>{page} / {pages}</span>
      <button onClick={() => onPage(Math.min(pages, page + 1))} disabled={page === pages}
        style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: COLORS.card, color: COLORS.muted, cursor: "pointer", fontSize: 12 }}>Sig</button>
    </div>
  );
}
