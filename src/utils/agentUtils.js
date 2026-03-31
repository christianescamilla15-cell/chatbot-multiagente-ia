// Agent utilities — MultiAgente Resident Support System
import { AGENTS, agentRole } from "../constants/agents.js";

export function getSystemPrompt(agentId, lang) {
  // System prompts are now handled by the backend agents
  // This is only used as fallback for demo mode
  const a = AGENTS[agentId];
  if (!a) return "";
  const roleName = agentRole(agentId, lang);
  return lang === "en"
    ? `You are ${a.name}, ${roleName} agent for Residencial Las Palmas. Respond helpfully in English.`
    : `Eres ${a.name}, agente de ${roleName} de Residencial Las Palmas. Responde en espanol de forma util.`;
}

export function getSuggestions(agentId, msgCount, lang) {
  if (lang === "en") {
    if (msgCount <= 1) return ["What are the pool hours?", "I want to know my balance", "There's a water leak", "My WiFi isn't working", "I want to book the party room"];
    return {
      router: ["Check my balance", "Report a problem"],
      sentinel: ["Enter verification code"],
      nova: ["My internet is slow", "Security camera is down", "Intercom doesn't work", "Access app not working"],
      atlas: ["Water leak in bathroom", "Elevator is stuck", "Light out in hallway", "Garage door won't open"],
      aria: ["What's my balance?", "I need a receipt", "Account statement", "Payment info"],
      orion: ["Pool schedule?", "Gym hours?", "Pet rules?", "Book party room"],
      nexus: ["Talk to a person", "I need a solution now", "File a complaint"],
      closure: ["Was my issue resolved?", "Thank you"],
    }[agentId] || ["How can I help?"];
  }
  if (msgCount <= 1) return ["Cual es el horario de la alberca?", "Quiero saber mi saldo pendiente", "Hay una fuga de agua", "Mi WiFi no funciona", "Quiero reservar el salon de fiestas"];
  return {
    router: ["Consultar mi saldo", "Reportar un problema"],
    sentinel: ["Ingresar codigo de verificacion"],
    nova: ["Mi internet esta lento", "La camara de seguridad no graba", "El interfon no funciona", "La app de acceso no conecta"],
    atlas: ["Fuga de agua en bano", "El elevador esta atorado", "Luz fundida en pasillo", "La puerta del garage no abre"],
    aria: ["Cual es mi saldo?", "Necesito un recibo de pago", "Estado de cuenta", "Informacion de pago"],
    orion: ["Horario de alberca?", "Horario del gimnasio?", "Reglas de mascotas?", "Reservar salon de fiestas"],
    nexus: ["Hablar con una persona", "Necesito solucion ya", "Poner una queja"],
    closure: ["Se resolvio mi problema?", "Gracias"],
  }[agentId] || ["En que puedo ayudar?"];
}
