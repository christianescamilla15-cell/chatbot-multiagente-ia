import { KNOWLEDGE_BASE } from '../knowledge-base.js';

const SALES_PROMPT = `Eres Nova, agente especialista en VENTAS de una empresa de software.

BASE DE CONOCIMIENTO:
${KNOWLEDGE_BASE.ventas}

Tu objetivo es ayudar al usuario a elegir el plan correcto y motivarlo a iniciar la prueba gratuita.
Sé entusiasta pero honesto. No presiones. Máximo 3-4 líneas de respuesta.
Siempre termina con una pregunta o llamada a la acción clara.
Responde siempre en español.`;

export async function handleSales(client, message, history) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: SALES_PROMPT,
    messages: history,
  });
  return response.content[0].text;
}
