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
    title: { en: "MultiAgente — Resident AI Support System", es: "MultiAgente — Sistema IA de Soporte a Residentes" },
    text: {
      en: "Welcome! This is a production AI system for Residencial Las Palmas (500 residents). It uses **8 specialized agents**, WhatsApp OTP verification, PostgreSQL with 11 tables, and a full Admin Panel. Let me show you every feature!",
      es: "Bienvenido! Este es un sistema de IA en produccion para Residencial Las Palmas (500 residentes). Usa **8 agentes especializados**, verificacion OTP por WhatsApp, PostgreSQL con 11 tablas, y un Admin Panel completo. Te muestro cada funcion!",
    },
  },
  1: {
    en: "These are the **8 AI agents**: **Router** (intent classifier via LLM), **Sentinel** (OTP identity verification), **Nova** (tech support: WiFi, cameras), **Atlas** (maintenance: leaks, elevator), **Aria** (billing — requires OTP!), **Orion** (general info, FAQ), **Nexus** (escalation to human), **Closure** (case summary). Each has its own color and role.",
    es: "Estos son los **8 agentes IA**: **Router** (clasificador de intencion via LLM), **Sentinel** (verificacion OTP), **Nova** (soporte tecnico: WiFi, camaras), **Atlas** (mantenimiento: fugas, elevador), **Aria** (facturacion — requiere OTP!), **Orion** (info general, FAQ), **Nexus** (escalamiento a humano), **Closure** (resumen del caso). Cada uno tiene su color y rol.",
  },
  2: {
    en: "Type your message here. Try these to see different agents:\n- **'Pool hours?'** → Orion (general)\n- **'My WiFi is slow'** → Nova (tech support)\n- **'Water leak!'** → Atlas (maintenance)\n- **'Check my balance'** → Sentinel asks for OTP first!\nThe **resident bar** below shows your identity and verification status.",
    es: "Escribe tu mensaje aqui. Prueba estos para ver diferentes agentes:\n- **'Horario de alberca?'** → Orion (general)\n- **'Mi WiFi esta lento'** → Nova (soporte)\n- **'Fuga de agua!'** → Atlas (mantenimiento)\n- **'Mi saldo pendiente'** → Sentinel pide OTP primero!\nLa **barra de residente** abajo muestra tu identidad y estado de verificacion.",
  },
  3: {
    en: "The agent responded using the **knowledge base** (5 docs: rules, schedules, FAQ, payments, maintenance) and the **resident database** (500 residents, 3000 payments, 200 tickets). Notice the **agent transfer animation** when routing between specialists!",
    es: "El agente respondio usando la **base de conocimiento** (5 docs: reglamento, horarios, FAQ, pagos, mantenimiento) y la **base de datos** (500 residentes, 3000 pagos, 200 tickets). Observa la **animacion de transferencia** cuando cambia de agente!",
  },
  4: {
    en: "Click **Dashboard** to see live metrics (tickets, residents, runs, audit). Click **Admin Panel** for the full operational interface: manage residents, tickets, payments, sync conflicts, and audit logs. Everything is connected to real PostgreSQL data.",
    es: "Click **Dashboard** para ver metricas en vivo (tickets, residentes, ejecuciones, auditoria). Click **Admin Panel** para la interfaz operacional completa: gestionar residentes, tickets, pagos, conflictos de sync, y logs de auditoria. Todo conectado a datos reales de PostgreSQL.",
  },
  5: {
    en: "Tour complete! Key features to try:\n- **Ask for your balance** → OTP verification flow\n- **Report a water leak** → Automatic ticket creation\n- **Open Admin Panel** → See 500 residents, 200 tickets, audit log\n- **Change resident** → Simulate any of 500 residents\n\n8 agents. 500 residents. 11 DB tables. Real OTP. Production-grade.",
    es: "Tour completo! Funciones clave para probar:\n- **Pregunta tu saldo** → Flujo de verificacion OTP\n- **Reporta fuga de agua** → Creacion automatica de ticket\n- **Abre Admin Panel** → Ve 500 residentes, 200 tickets, auditoria\n- **Cambia residente** → Simula cualquiera de 500 residentes\n\n8 agentes. 500 residentes. 11 tablas DB. OTP real. Production-grade.",
  },
};
