// i18n strings and language detection

export const EN_WORDS = new Set(["the","is","are","was","were","have","has","had","will","would","can","could","do","does","did","i","you","he","she","it","we","they","my","your","this","that","what","how","why","when","where","who","which","not","no","yes","with","from","for","about","but","and","or","if","then","so","all","any","some","need","want","help","please","thanks","thank","hello","hi","hey"]);

export const ES_WORDS = new Set(["el","la","los","las","es","son","fue","era","han","tiene","haber","será","puede","puedo","hacer","hace","hizo","yo","tú","él","ella","nosotros","ellos","mi","tu","este","ese","qué","cómo","por","dónde","cuándo","quién","cuál","no","sí","con","de","para","sobre","pero","que","si","entonces","todo","algún","necesito","quiero","ayuda","gracias","hola","buenas"]);

export function detectLang(text) {
  const words = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/);
  let en = 0, es = 0;
  for (const w of words) {
    if (EN_WORDS.has(w)) en++;
    if (ES_WORDS.has(w)) es++;
  }
  if (en === 0 && es === 0) return null;
  if (en > es) return "en";
  if (es > en) return "es";
  return null;
}

export const TOUR_TEXTS = {
  0: {
    title: { en: "MultiAgente — Resident Support AI System", es: "MultiAgente — Sistema IA de Soporte a Residentes" },
    text: {
      en: "This resident support system uses 8 specialized AI agents to help residents of Residencial Las Palmas. It handles tech support, maintenance, billing (with OTP verification), general info, escalation, and more. The AI routes your messages automatically. Let me show you!",
      es: "Este sistema de soporte usa 8 agentes IA especializados para atender a los residentes de Residencial Las Palmas. Maneja soporte tecnico, mantenimiento, facturacion (con verificacion OTP), info general, escalamiento y mas. La IA rutea tus mensajes automaticamente. Te muestro como funciona!",
    },
  },
  1: {
    en: "These are the 8 AI agents. **Router** classifies your intent, **Sentinel** verifies your identity via OTP, **Nova** handles tech support, **Atlas** handles maintenance, **Aria** handles billing (requires verification), **Orion** handles general info, **Nexus** escalates to human, and **Closure** summarizes the case.",
    es: "Estos son los 8 agentes IA. **Router** clasifica tu intencion, **Sentinel** verifica tu identidad via OTP, **Nova** maneja soporte tecnico, **Atlas** mantenimiento, **Aria** facturacion (requiere verificacion), **Orion** info general, **Nexus** escala a humano, y **Closure** resume el caso.",
  },
  2: {
    en: "Type your message here. Try: 'What are the pool hours?', 'I want to know my balance', or 'There's a water leak in my bathroom'. The AI will route you to the right agent.",
    es: "Escribe tu mensaje aqui. Prueba: 'Cual es el horario de la alberca?', 'Quiero saber mi saldo', o 'Hay una fuga de agua en mi bano'. La IA te conectara con el agente correcto.",
  },
  3: {
    en: "The agent responded with info from the **knowledge base** and **resident database**. Notice the agent transfer animation when routing between specialists!",
    es: "El agente respondio con informacion de la **base de conocimiento** y la **base de datos de residentes**. Observa la animacion de transferencia cuando cambia de agente!",
  },
  4: {
    en: "The analytics panel shows message distribution across agents, verification status, and system stats (500 residents, 200 tickets, response latency).",
    es: "El panel de analiticas muestra distribucion de mensajes entre agentes, estado de verificacion, y stats del sistema (500 residentes, 200 tickets, latencia).",
  },
  5: {
    en: "Tour complete! Try asking about your balance — you'll see the OTP verification flow in action. 8 agents, 500 residents, real database.",
    es: "Tour completo! Intenta preguntar por tu saldo — veras el flujo de verificacion OTP en accion. 8 agentes, 500 residentes, base de datos real.",
  },
};
