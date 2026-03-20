# 🤖 Chatbot Multiagente de Atención al Cliente

> Sistema de atención al cliente con 5 agentes IA especializados, orquestados con n8n. Resuelve el 80% de dudas frecuentes sin intervención humana. Desplegable en Web, WhatsApp y Telegram simultáneamente.

---

## Arquitectura del sistema

```
Usuario (Web / WhatsApp / Telegram)
            ↓
    Webhook n8n — recibe mensaje
            ↓
    Normalizador de canal
            ↓
    Agente Clasificador (Claude Haiku)
    → Detecta intención del mensaje
            ↓
    Router → agente correcto
    ┌────────────────────────────────┐
    │ 💼 Agente Ventas               │
    │ 🔧 Agente Soporte Técnico      │
    │ 💳 Agente Facturación          │
    │ 🚨 Agente Escalamiento         │
    │ 💬 Agente General              │
    └────────────────────────────────┘
            ↓
    Unificador de respuestas
            ↓
    Router de canal → responde al origen
```

## Características

- **5 agentes especializados** con base de conocimiento propia por área
- **Clasificador automático** de intención con Claude API
- **Base de conocimiento en Notion** sincronizada vía API
- **3 canales simultáneos**: Web (React), WhatsApp (Twilio Sandbox), Telegram (Bot API)
- **Workflow n8n importable** listo para usar (`workflow-multiagente.json`)
- **Escalamiento automático** a agente humano con notificación al equipo
- Stack 100% gratuito para empezar (Railway + Notion free + Telegram)

## Instalación rápida

```bash
# 1. Importar workflow en n8n
# Sube workflow-multiagente.json a tu instancia de n8n

# 2. Configurar credenciales en n8n
# - Anthropic API Key → x-api-key header
# - Telegram Bot Token → BotFather
# - Twilio → Account SID + Auth Token
# - Notion → Integration Token

# 3. Activar el workflow
# Toggle "Active" en n8n → listo
```

```bash
# UI Web (React)
git clone https://github.com/christianescamilla15-cell/chatbot-multiagente-ia
cd chatbot-multiagente-ia
npm install
cp .env.example .env   # Agrega tu ANTHROPIC_API_KEY
npm run dev            # http://localhost:3001
```

## Configurar Telegram (gratis)

```
1. Busca @BotFather en Telegram
2. /newbot → sigue instrucciones → copia el TOKEN
3. En n8n: Credentials → Telegram API → pega el token
4. Configura webhook:
   https://api.telegram.org/botTU_TOKEN/setWebhook
   ?url=https://tu-n8n.railway.app/webhook/chatbot-webhook
```

## Variables de entorno

```env
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
NOTION_API_KEY=secret_...
PORT=3001
```

## Stack

`React` `Node.js` `n8n` `Claude API` `Notion API` `Twilio` `Telegram Bot API` `Railway`

---

[![Portfolio](https://img.shields.io/badge/Portfolio-ch65--portfolio-6366F1?style=flat)](https://ch65-portfolio.vercel.app)
