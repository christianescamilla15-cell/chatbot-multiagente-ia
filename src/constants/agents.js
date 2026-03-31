// Agent definitions — Resident Support System (8 agents)

export const AGENTS = {
  router:   { name: "Router",   mono: "RT", role: { es: "Clasificador", en: "Router" },           gradient: "linear-gradient(135deg, #6366F1, #A5B4FC)", color: "#A5B4FC", shadow: "rgba(165,180,252,0.3)" },
  sentinel: { name: "Sentinel", mono: "SN", role: { es: "Verificación", en: "Verification" },     gradient: "linear-gradient(135deg, #EC4899, #F9A8D4)", color: "#F9A8D4", shadow: "rgba(249,168,212,0.3)" },
  nova:     { name: "Nova",     mono: "NV", role: { es: "Soporte Técnico", en: "Tech Support" },   gradient: "linear-gradient(135deg, #0D9488, #6EE7C7)", color: "#6EE7C7", shadow: "rgba(110,231,199,0.3)" },
  atlas:    { name: "Atlas",    mono: "AT", role: { es: "Mantenimiento", en: "Maintenance" },      gradient: "linear-gradient(135deg, #3B82F6, #93C5FD)", color: "#93C5FD", shadow: "rgba(147,197,253,0.3)" },
  aria:     { name: "Aria",     mono: "AR", role: { es: "Facturación", en: "Billing" },            gradient: "linear-gradient(135deg, #8B5CF6, #C4B5FD)", color: "#C4B5FD", shadow: "rgba(196,181,253,0.3)" },
  orion:    { name: "Orion",    mono: "OR", role: { es: "Info General", en: "General Info" },       gradient: "linear-gradient(135deg, #F59E0B, #FDE68A)", color: "#FDE68A", shadow: "rgba(253,230,138,0.3)" },
  nexus:    { name: "Nexus",    mono: "NX", role: { es: "Escalamiento", en: "Escalation" },        gradient: "linear-gradient(135deg, #EF4444, #FCA5A5)", color: "#FCA5A5", shadow: "rgba(252,165,165,0.3)" },
  closure:  { name: "Closure",  mono: "CL", role: { es: "Cierre", en: "Closure" },                 gradient: "linear-gradient(135deg, #10B981, #6EE7B7)", color: "#6EE7B7", shadow: "rgba(110,231,183,0.3)" },
};

// Map backend agent names to frontend IDs
export const AGENT_NAME_MAP = {
  "RouterAgent": "router",
  "SentinelAgent": "sentinel",
  "NovaAgent": "nova",
  "AtlasAgent": "atlas",
  "AriaAgent": "aria",
  "OrionAgent": "orion",
  "NexusAgent": "nexus",
  "ClosureAgent": "closure",
};

export function agentRole(agentId, lang) {
  const a = AGENTS[agentId];
  if (!a) return "";
  return typeof a.role === "string" ? a.role : (a.role[lang] || a.role.es);
}
