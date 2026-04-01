# Tasks - WhatsApp Webhook Pipeline

## T1: Create WhatsApp webhook route
- Description: New FastAPI route POST /api/whatsapp/webhook receiving Twilio form data
- Owner Agent: Developer Agent
- Dependencies: None
- Validation: Endpoint returns 200 on POST with Body + From fields
- Risk: low

## T2: Text message handling
- Description: Extract phone + text from webhook, call process_message, send response via Twilio
- Owner Agent: Developer Agent
- Dependencies: T1
- Validation: Send WhatsApp text -> get agent response back via WhatsApp
- Risk: low

## T3: Voice note handling
- Description: Download audio from Twilio MediaUrl, transcribe via Groq Whisper, feed to orchestrator
- Owner Agent: Developer Agent
- Dependencies: T1, T2
- Validation: Send voice note -> transcribed -> agent response via WhatsApp
- Risk: medium (audio format compatibility)

## T4: Register webhook route in main.py
- Description: Include whatsapp router in FastAPI app
- Owner Agent: Developer Agent
- Dependencies: T1
- Validation: /api/whatsapp/webhook appears in /docs
- Risk: low

## T5: Update Twilio sandbox webhook URL
- Description: Point Twilio sandbox to multiagente-api.onrender.com/api/whatsapp/webhook
- Owner Agent: Deployment Agent
- Dependencies: T4 deployed
- Validation: Twilio console shows correct URL, test message reaches webhook
- Risk: low

## T6: End-to-end test
- Description: Test all scenarios: text, voice, billing+OTP, maintenance+ticket
- Owner Agent: Test Agent
- Dependencies: T1-T5
- Validation: All 4 scenarios pass via real WhatsApp
- Risk: medium (Groq rate limit)

## T7: Deploy and verify
- Description: Push to GitHub, deploy Render, test live
- Owner Agent: Deployment Agent
- Dependencies: T6
- Validation: Live URL responds to WhatsApp messages
- Risk: low
