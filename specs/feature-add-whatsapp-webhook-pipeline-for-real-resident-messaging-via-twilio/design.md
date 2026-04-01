# Design - WhatsApp Webhook Pipeline

## Current State
- Web frontend sends POST /api/residents/chat with {message, phone}
- Orchestrator processes: identify -> classify -> verify -> route -> respond
- OTP codes sent outbound via Twilio WhatsApp
- NO inbound WhatsApp handling — all interaction is web-only

## Proposed Design
```
WhatsApp Message (Twilio webhook)
  -> POST /api/whatsapp/webhook
  -> Extract: phone, text, media_url, media_type
  -> IF voice note: download audio -> Groq Whisper -> text
  -> Call orchestrator.process_message(text, phone)
  -> Send response back via Twilio (whatsapp message)
  -> Return TwiML 200
```

## Architecture Impact
- New route: /api/whatsapp/webhook (POST)
- New file: backend-python/app/routes/whatsapp.py
- Reuses: orchestrator.process_message (zero changes to agent logic)
- Reuses: SentinelAgent.send_otp_whatsapp (already exists)
- Messages logged with channel='whatsapp' (already supported in schema)

## Data Flow
```
Twilio -> webhook -> extract message
  -> process_message(text, phone)    [EXISTING]
  -> get response text
  -> twilio.messages.create(to=phone, body=response)
  -> return TwiML
```

## Voice Note Handling
```
Twilio sends MediaUrl0 + MediaContentType0='audio/ogg'
  -> download audio from Twilio (requires auth)
  -> POST to Groq Whisper API
  -> get transcription text
  -> feed to process_message as normal text
```

## Tradeoffs
| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Sync vs async | Sync (within 15s) | Background job | Simpler, Groq is fast (<2s) |
| TwiML vs API response | API response (twilio.messages.create) | TwiML <Message> | More control, can send multiple messages |
| Voice transcription | Groq Whisper | No voice support | Already have Groq key, free |

## Risks
- Twilio sandbox 15s timeout — if Groq is slow or rate limited, webhook may timeout
- Twilio sandbox expires every 72h — need "join" re-activation
- Voice notes download requires Twilio auth (SID + Token)
