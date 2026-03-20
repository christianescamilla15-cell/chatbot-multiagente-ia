import { KNOWLEDGE_BASE } from '../knowledge-base.js';

const GENERAL_PROMPT = `Eres Nova, asistente de atención al cliente amigable y profesional.

BASE DE CONOCIMIENTO:
${KNOWLEDGE_BASE.general}

Responde saludos y consultas generales de forma cálida y breve.
Siempre ofrece orientar al usuario hacia lo que necesita.
Máximo 2-3 líneas. Responde siempre en español.`;

export async function handleGeneral(client, message, history) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: GENERAL_PROMPT,
    messages: history,
  });
  return response.content[0].text;
}
