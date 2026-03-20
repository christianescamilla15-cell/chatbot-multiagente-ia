# 🚀 Guía de Instalación Completa — Chatbot Multiagente

## Stack Gratuito
| Herramienta | Plan Gratuito | Límite Free |
|-------------|--------------|-------------|
| n8n | Self-hosted en Railway | $5 créditos gratis/mes |
| Notion | Personal Free | Páginas ilimitadas |
| Claude API | Pay-per-use | ~$0.001 por mensaje (Haiku) |
| Telegram Bot | 100% gratuito | Sin límites |
| Twilio WhatsApp | Sandbox gratuito | Solo números verificados |

---

## PASO 1 — Configurar n8n en Railway (Gratis)

```bash
# 1. Ve a railway.app y crea cuenta con GitHub
# 2. New Project > Deploy from Template > busca "n8n"
# 3. Railway despliega n8n automáticamente
# 4. En Variables de entorno agrega:
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=tu_password_seguro
WEBHOOK_URL=https://tu-app.railway.app
```

---

## PASO 2 — Importar el Workflow

1. Abre tu instancia de n8n en Railway
2. Ve a **Workflows > Import from File**
3. Sube el archivo `workflow-multiagente.json`
4. El workflow aparecerá con todos los nodos conectados

---

## PASO 3 — Configurar Credenciales en n8n

### Claude API (Anthropic)
```
1. Ve a credentials.anthropic.com > Get API Key
2. En n8n: Settings > Credentials > New > HTTP Header Auth
   Name: Anthropic API
   Header Name: x-api-key
   Header Value: sk-ant-tu-clave-aqui
3. Aplica esta credencial a todos los nodos de Claude
```

### Telegram Bot
```
1. Abre Telegram y busca @BotFather
2. Escribe /newbot y sigue las instrucciones
3. Copia el TOKEN que te da BotFather
4. En n8n: Settings > Credentials > New > Telegram API
   Token: tu-token-aqui
5. Configura el webhook:
   URL: https://api.telegram.org/botTU_TOKEN/setWebhook
   ?url=https://tu-app.railway.app/webhook/chatbot-webhook
```

### WhatsApp (Twilio Sandbox)
```
1. Ve a twilio.com > Console > Messaging > Try WhatsApp
2. Sigue las instrucciones para activar el sandbox
3. El número sandbox es: +1 415 523 8886
4. Configura el webhook en Twilio:
   When a message comes in: https://tu-app.railway.app/webhook/chatbot-webhook
5. En n8n: Settings > Credentials > New > Basic Auth
   User: tu_account_sid
   Password: tu_auth_token
```

### Notion API
```
1. Ve a notion.so/my-integrations > New Integration
2. Name: n8n-chatbot | Type: Internal
3. Copia el Integration Token
4. Comparte cada página de la base de conocimiento con esta integración
   (Abre cada página > ... > Add connections > n8n-chatbot)
5. En n8n: Settings > Credentials > New > Notion API
   API Key: secret_tu-token-aqui
```

---

## PASO 4 — Activar el Workflow

1. En n8n abre el workflow importado
2. Verifica que todas las credenciales estén configuradas (sin triángulos rojos)
3. Haz clic en **"Activate"** (toggle superior derecho)
4. La URL del webhook será:
   `https://tu-app.railway.app/webhook/chatbot-webhook`

---

## PASO 5 — Probar el Sistema

### Prueba Web (curl)
```bash
curl -X POST https://tu-app.railway.app/webhook/chatbot-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuáles son los precios?",
    "userId": "test-user-001",
    "userName": "Christian"
  }'
```

### Prueba Telegram
Abre tu bot en Telegram y escribe:
- "Hola" → debe responder el Agente General
- "¿Cuánto cuesta el plan pro?" → debe responder el Agente Ventas
- "No me funciona la integración" → debe responder el Agente Soporte
- "Quiero que me devuelvan mi dinero" → debe responder el Agente Facturación
- "Esto es inaceptable, necesito hablar con alguien" → debe escalar

---

## PASO 6 — Integrar la UI Web

Toma el archivo `chatbot-atencion-cliente.jsx` y actualiza la URL:

```javascript
// Cambia esta línea en el archivo JSX:
const response = await fetch("https://api.anthropic.com/v1/messages", {

// Por tu webhook de n8n:
const response = await fetch("https://tu-app.railway.app/webhook/chatbot-webhook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: content,
    userId: "web-" + Date.now(),
    userName: "Usuario Web"
  })
});

// Y parsea la respuesta así:
const data = await response.json();
const reply = data.response || "Error al procesar tu consulta.";
```

---

## Flujo Completo del Sistema

```
Usuario escribe (Web / Telegram / WhatsApp)
          ↓
  Webhook n8n recibe mensaje
          ↓
  Normalizador detecta el canal
          ↓
  Agente Clasificador (Claude Haiku)
  → Analiza la intención del mensaje
  → Devuelve: VENTAS / SOPORTE / FACTURACION / ESCALAMIENTO / GENERAL
          ↓
  Router envía al agente correcto
  ┌──────────────────────────────────┐
  │ Agente Ventas    (Claude Haiku)  │
  │ Agente Soporte   (Claude Haiku)  │
  │ Agente Facturación (Claude Haiku)│
  │ Agente Escalamiento (lógica JS)  │
  │ Agente General   (Claude Haiku)  │
  └──────────────────────────────────┘
          ↓
  Unificador normaliza la respuesta
          ↓
  Router de canal detecta origen
  ┌─────────────────────────┐
  │ → Telegram (Bot API)    │
  │ → WhatsApp (Twilio)     │
  │ → Web (JSON response)   │
  └─────────────────────────┘
          ↓
  Usuario recibe respuesta
```

---

## Costos Estimados (escenario real)

| Volumen | Costo Claude Haiku | Costo n8n Railway |
|---------|-------------------|-------------------|
| 100 msgs/día | ~$0.05/día | Gratis |
| 1,000 msgs/día | ~$0.50/día | ~$5/mes |
| 10,000 msgs/día | ~$5/día | ~$20/mes |

**Claude Haiku pricing:** ~$0.001 por conversación completa (clasificación + respuesta)

---

## Variables de Entorno Necesarias

```env
# n8n Railway
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=password_seguro
WEBHOOK_URL=https://tu-app.railway.app

# APIs (configurar en n8n Credentials, no como env vars)
# ANTHROPIC_API_KEY=sk-ant-...
# TELEGRAM_BOT_TOKEN=...
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# NOTION_API_KEY=secret_...
```
