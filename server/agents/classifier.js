const CLASSIFIER_PROMPT = `Eres un clasificador de intenciones para un sistema de atención al cliente.

Tu ÚNICA tarea es responder con UNA sola palabra según la intención del usuario:

- VENTAS → preguntas sobre planes, precios, demo, contratar, prueba gratuita, comparar planes
- SOPORTE → problemas técnicos, errores, no funciona, cómo usar, configuración, integración rota
- FACTURACION → facturas, cobros, pagos, reembolsos, cancelar suscripción, método de pago
- ESCALAMIENTO → queja grave, hablar con humano, muy enojado, problema urgente, amenaza de irse
- GENERAL → saludos, agradecimientos, preguntas generales, info de contacto

Responde SOLO con una de estas palabras, sin explicación.`;

const VALID_CATEGORIES = ['VENTAS', 'SOPORTE', 'FACTURACION', 'ESCALAMIENTO', 'GENERAL'];

export async function classifyIntent(client, message) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 20,
    system: CLASSIFIER_PROMPT,
    messages: [{ role: 'user', content: message }],
  });

  const classification = response.content[0].text.trim().toUpperCase();
  return VALID_CATEGORIES.includes(classification) ? classification : 'GENERAL';
}
