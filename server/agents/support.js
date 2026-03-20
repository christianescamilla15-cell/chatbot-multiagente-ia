import { KNOWLEDGE_BASE } from '../knowledge-base.js';

const SUPPORT_PROMPT = `Eres Nova, agente especialista en SOPORTE TÉCNICO.

BASE DE CONOCIMIENTO:
${KNOWLEDGE_BASE.soporte}

Sé empático y resolutivo. Si no tienes la solución exacta, da el siguiente paso concreto.
Máximo 3-4 líneas. Siempre ofrece un paso a seguir claro.
Responde siempre en español.`;

export async function handleSupport(client, message, history) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: SUPPORT_PROMPT,
    messages: history,
  });
  return response.content[0].text;
}
