// Conversation export utilities — TXT and JSON formats
import { AGENTS } from "../constants/agents.js";

/**
 * Export conversation messages in the specified format.
 * @param {Array} messages - Chat messages array
 * @param {'txt'|'json'} format - Export format
 * @returns {{ blob: Blob, filename: string }}
 */
export function exportConversation(messages, format = "json") {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5).replace(":", "");

  if (format === "txt") {
    return exportAsTxt(messages, dateStr, timeStr);
  }
  return exportAsJson(messages, dateStr, timeStr);
}

function exportAsTxt(messages, dateStr, timeStr) {
  const lines = [
    "════════════════════════════════════════",
    "  Synapse Chat — Historial de conversacion",
    `  Exportado: ${dateStr} ${timeStr}`,
    "════════════════════════════════════════",
    "",
  ];

  for (const msg of messages) {
    if (msg.role === "transfer") {
      const agentName = AGENTS[msg.to]?.name || msg.to;
      lines.push(`--- Transferido a ${agentName} ---`);
      lines.push("");
      continue;
    }

    const time = msg.timestamp || "";
    const sender = msg.role === "user"
      ? "Tu"
      : (AGENTS[msg.agent]?.name || "Agente");
    const ratingMark = msg.rating === 1 ? " [+]" : msg.rating === -1 ? " [-]" : "";

    lines.push(`[${time}] ${sender}${ratingMark}:`);
    lines.push(msg.content);
    lines.push("");
  }

  lines.push("════════════════════════════════════════");
  lines.push(`Total mensajes: ${messages.filter(m => m.role !== "transfer").length}`);

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  return { blob, filename: `synapse-chat-${dateStr}-${timeStr}.txt` };
}

function exportAsJson(messages, dateStr, timeStr) {
  const agentSet = new Set();
  let userCount = 0;
  let assistantCount = 0;

  for (const msg of messages) {
    if (msg.agent) agentSet.add(msg.agent);
    if (msg.role === "user") userCount++;
    if (msg.role === "assistant") assistantCount++;
  }

  const data = {
    meta: {
      app: "Synapse Chat",
      exportedAt: new Date().toISOString(),
      totalMessages: messages.filter(m => m.role !== "transfer").length,
      userMessages: userCount,
      assistantMessages: assistantCount,
      agentsUsed: [...agentSet],
    },
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      agent: msg.agent || null,
      content: msg.content || null,
      timestamp: msg.timestamp || null,
      rating: msg.rating || null,
      ...(msg.role === "transfer" ? { transferTo: msg.to } : {}),
    })),
  };

  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  return { blob, filename: `synapse-chat-${dateStr}-${timeStr}.json` };
}
