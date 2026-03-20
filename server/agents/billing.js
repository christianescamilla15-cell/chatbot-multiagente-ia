import { KNOWLEDGE_BASE } from '../knowledge-base.js';

const BILLING_PROMPT = `Eres Nova, agente especialista en FACTURACIÓN y pagos.

BASE DE CONOCIMIENTO:
${KNOWLEDGE_BASE.facturacion}

Sé preciso con los datos. Si hay una queja de cobro, valida primero antes de prometer algo.
Máximo 3-4 líneas. Tono profesional y empático.
Responde siempre en español.`;

export async function handleBilling(client, message, history) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: BILLING_PROMPT,
    messages: history,
  });
  return response.content[0].text;
}
