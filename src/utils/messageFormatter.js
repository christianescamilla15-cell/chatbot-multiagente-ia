// Message formatting utilities
import { createElement as h } from "react";

export function renderBoldText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? h("strong", { key: i, style: { color: "#fff" } }, part) : part);
}

export const timestamp = () =>
  new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

// Global message ID counter
let msgId = 0;
export const nextMsgId = () => ++msgId;
