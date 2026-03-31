// Agent performance statistics calculator — pure functions
import { AGENTS } from "../constants/agents.js";
import { classifyIntent } from "./intentClassifier.js";

/**
 * Calculate per-agent statistics from chat messages.
 * @param {Array} messages - Chat messages array
 * @param {Object} [ratingsMap] - Optional external ratings map { msgId: rating }
 * @returns {Object} Stats keyed by agentId
 */
export function calculateAgentStats(messages, ratingsMap = {}) {
  const stats = {};

  // Initialize all agents
  for (const id of Object.keys(AGENTS)) {
    stats[id] = {
      agentId: id,
      name: AGENTS[id].name,
      color: AGENTS[id].color,
      messageCount: 0,
      thumbsUp: 0,
      thumbsDown: 0,
      avgRating: 0,
      intents: {},
    };
  }

  // Collect intent info from user messages preceding each assistant reply
  const userMessages = [];

  for (const msg of messages) {
    if (msg.role === "user") {
      userMessages.push(msg.content);
      continue;
    }

    if (msg.role === "assistant" && msg.agent && stats[msg.agent]) {
      const entry = stats[msg.agent];
      entry.messageCount++;

      // Rating from message or external map
      const rating = msg.rating || ratingsMap[msg.id] || 0;
      if (rating === 1) entry.thumbsUp++;
      if (rating === -1) entry.thumbsDown++;

      // Classify intent from the most recent user message
      const lastUser = userMessages[userMessages.length - 1];
      if (lastUser) {
        try {
          const intent = classifyIntent(lastUser);
          const intentName = intent?.agent || "general";
          entry.intents[intentName] = (entry.intents[intentName] || 0) + 1;
        } catch {
          // Ignore classification errors
        }
      }
    }
  }

  // Compute average ratings
  for (const entry of Object.values(stats)) {
    const total = entry.thumbsUp + entry.thumbsDown;
    entry.avgRating = total > 0 ? Math.round((entry.thumbsUp / total) * 100) : 0;
    entry.totalRated = total;

    // Sort intents by frequency
    const sorted = Object.entries(entry.intents)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    entry.topIntents = sorted.map(([name, count]) => ({ name, count }));
  }

  return stats;
}
