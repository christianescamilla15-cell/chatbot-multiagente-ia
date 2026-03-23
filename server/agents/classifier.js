const CLASSIFIER_PROMPT = `Eres un clasificador de intenciones para un sistema de atención al cliente de una empresa de software (chatbots IA).

Tu tarea es analizar el mensaje del usuario y devolver un JSON con la clasificación.

## Categorías disponibles:
- VENTAS → preguntas sobre planes, precios, demo, contratar, prueba gratuita, comparar planes, competidores, features
- SOPORTE → problemas técnicos, errores, no funciona, cómo usar, configuración, integración rota, widget, chatbot no responde
- FACTURACION → facturas, cobros, pagos, reembolsos, cancelar suscripción, método de pago, impuestos, prorrateo
- ESCALAMIENTO → queja grave, hablar con humano, muy enojado, problema urgente, amenaza de irse, múltiples intentos sin solución
- GENERAL → saludos, agradecimientos, preguntas generales, info de contacto, qué hacen, horarios

## Ejemplos:

Mensaje: "¿Cuánto cuesta el plan Pro?"
{"agent":"VENTAS","confidence":0.95,"reasoning":"Pregunta directa sobre precio de plan específico"}

Mensaje: "No me carga el dashboard desde ayer"
{"agent":"SOPORTE","confidence":0.92,"reasoning":"Problema técnico con funcionalidad de la plataforma"}

Mensaje: "Me cobraron doble este mes"
{"agent":"FACTURACION","confidence":0.94,"reasoning":"Queja sobre cobro duplicado, tema de facturación"}

Mensaje: "Estoy harto, llevo 3 días con el mismo problema y nadie me ayuda"
{"agent":"ESCALAMIENTO","confidence":0.88,"reasoning":"Frustración acumulada, múltiples intentos sin resolución, necesita atención humana"}

Mensaje: "Hola, buenos días"
{"agent":"GENERAL","confidence":0.97,"reasoning":"Saludo simple sin intención específica"}

Mensaje: "¿Qué tal comparan con Zendesk?"
{"agent":"VENTAS","confidence":0.85,"reasoning":"Comparación con competidor, interés de compra implícito"}

Mensaje: "No puedo pagar porque me rechaza la tarjeta y además el sistema está lento"
{"agent":"FACTURACION","confidence":0.55,"reasoning":"Problema mixto: pago rechazado (facturación) y rendimiento (soporte). Facturación es más urgente.","secondary":{"agent":"SOPORTE","confidence":0.40}}

## Instrucciones:
- Responde SOLO con JSON válido, sin texto adicional
- confidence: número entre 0 y 1 (0.0 = nada seguro, 1.0 = completamente seguro)
- Si el mensaje es ambiguo o mezcla temas, incluye un campo "secondary" con segunda clasificación
- reasoning: explicación breve de por qué elegiste esa categoría`;

const VALID_CATEGORIES = ['VENTAS', 'SOPORTE', 'FACTURACION', 'ESCALAMIENTO', 'GENERAL'];

export async function classifyIntent(client, message) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: CLASSIFIER_PROMPT,
    messages: [{ role: 'user', content: message }],
  });

  const raw = response.content[0].text.trim();

  try {
    const parsed = JSON.parse(raw);
    const agent = VALID_CATEGORIES.includes(parsed.agent) ? parsed.agent : 'GENERAL';
    const confidence = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5;
    const reasoning = parsed.reasoning || '';
    const secondary = parsed.secondary && VALID_CATEGORIES.includes(parsed.secondary?.agent)
      ? { agent: parsed.secondary.agent, confidence: parsed.secondary.confidence || 0 }
      : null;

    // Low confidence → route to general agent
    if (confidence < 0.4) {
      return {
        agent: 'GENERAL',
        confidence,
        reasoning: `Baja confianza (${confidence}) en clasificación original: ${agent}. Redirigiendo a general.`,
        original: agent,
        secondary,
      };
    }

    return { agent, confidence, reasoning, secondary };
  } catch {
    // Fallback: try to extract a raw category like the old classifier
    const upper = raw.toUpperCase();
    for (const cat of VALID_CATEGORIES) {
      if (upper.includes(cat)) {
        return { agent: cat, confidence: 0.5, reasoning: 'Fallback — parsed from raw text', secondary: null };
      }
    }
    return { agent: 'GENERAL', confidence: 0.3, reasoning: 'Could not parse classifier output', secondary: null };
  }
}
