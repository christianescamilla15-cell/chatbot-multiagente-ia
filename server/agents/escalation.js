import { getContextForAgent } from '../knowledge-base.js';

function generateTicketRef() {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ESC-${date}-${rand}`;
}

function summarizeConversation(history) {
  if (!history || history.length === 0) return 'Sin historial previo.';
  const recent = history.slice(-6); // last 3 exchanges
  return recent
    .map((m) => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content.substring(0, 120)}`)
    .join('\n');
}

const ESCALATION_PROMPT = `Eres Nova, agente de escalamiento de una empresa de software de chatbots IA.

Un cliente necesita ser escalado a atención humana. Tu trabajo es:
1. Validar la emoción del cliente con empatía genuina (sin frases genéricas)
2. Generar una respuesta personalizada según el tipo de problema
3. Dar pasos concretos de lo que va a pasar ahora
4. Ofrecer alternativas inmediatas de contacto

## Información de la empresa:
{KB_CONTEXT}

## Ejemplos de tono:

Ejemplo 1 — Cliente frustrado por problema técnico:
"Entiendo tu frustración completamente, [nombre]. Llevar [X tiempo] con un problema sin resolver no es aceptable y lo siento mucho. He creado el ticket [REF] con prioridad alta. Un especialista técnico te contactará en máximo 2 horas. Mientras tanto, si necesitas atención inmediata: 📞 +52 55 1234 5678."

Ejemplo 2 — Cliente enojado por cobro:
"[Nombre], tienes toda la razón en estar molesto/a. Un cobro incorrecto es algo que tomamos muy en serio. Tu caso queda registrado como [REF] y nuestro equipo de facturación lo revisará de inmediato. Te confirmaremos por email en las próximas 4 horas."

## Reglas:
- Nunca minimices el problema del cliente
- No uses frases como "entiendo tu frustración" sin ofrecer acción concreta
- Siempre incluye el número de ticket
- Siempre da un tiempo estimado de respuesta
- Ofrece al menos 2 canales de contacto alternativos
- Si el cliente está muy frustrado, ofrece una compensación simbólica (ej: extensión de prueba, descuento)
- Máximo 6-8 líneas
- Responde siempre en español`;

export async function handleEscalation(client, message, history, userName) {
  const ticketRef = generateTicketRef();
  const conversationSummary = summarizeConversation(history);
  const kbContext = getContextForAgent('ESCALAMIENTO', message);

  const systemPrompt = ESCALATION_PROMPT.replace('{KB_CONTEXT}', kbContext);

  const augmentedMessage = `CONTEXTO INTERNO (no mostrar al cliente):
- Nombre del cliente: ${userName || 'Usuario'}
- Ticket generado: ${ticketRef}
- Resumen de la conversación previa:
${conversationSummary}

MENSAJE DEL CLIENTE:
${message}

Genera una respuesta empática y personalizada. DEBES incluir el número de ticket ${ticketRef} en tu respuesta.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: systemPrompt,
    messages: [
      ...history.slice(0, -1),
      { role: 'user', content: augmentedMessage },
    ],
  });

  return response.content[0].text;
}
