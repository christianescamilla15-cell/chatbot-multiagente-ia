# Feature - WhatsApp Webhook Pipeline

## Objective
Enable residents to interact with MultiAgente via WhatsApp messages. Inbound messages route through the existing orchestrator and respond via WhatsApp.

## User Impact
- Residents text questions/reports via WhatsApp (most natural channel)
- Same 8-agent intelligence available via WhatsApp
- OTP verification works natively (already sends via WhatsApp)

## Functional Requirements
1. Receive inbound WhatsApp messages via Twilio webhook
2. Extract: phone, text, media type (voice/image/text)
3. Voice notes: transcribe with Groq Whisper -> process as text
4. Route through existing orchestrator (process_message)
5. Send agent response back via WhatsApp (Twilio API)
6. Session continuity — same phone = same session as web
7. Log all messages with channel='whatsapp'

## Non-Functional Requirements
- Response < 5 seconds
- Handle Twilio 15s webhook timeout
- Graceful fallback if Groq rate limited
- No sensitive data in Twilio logs

## Acceptance Criteria
- [ ] Text message -> agent response via WhatsApp
- [ ] Voice note -> transcribe -> process -> response via WhatsApp
- [ ] Billing query -> OTP -> verify -> data via WhatsApp
- [ ] Maintenance report -> ticket created -> confirmation via WhatsApp
- [ ] Messages logged in DB (channel='whatsapp')

## Out of Scope
- WhatsApp Business API (paid) — sandbox only
- Rich messages (buttons, templates)
- Group chats, media responses

## Context
MultiAgente has 8 AI agents, 500 residents in PostgreSQL, OTP via Twilio already built (outbound only). This adds the inbound pipeline.
