# Tech Context

## Current Stack
- Frontend: React 18 + Vite 5 (Vercel: chatbot-multiagente-ia.vercel.app)
- Backend: FastAPI + Python 3.12 (Render: multiagente-api.onrender.com)
- Database: PostgreSQL on Render (11+ tables, shared nexusforge DB)
- LLM: Groq Llama 3.3 70B (primary), Claude (fallback)
- WhatsApp: Twilio sandbox (+14155238886) — OTP only, no inbound pipeline
- Email: Resend API
- Audio: Groq Whisper (frontend mic input)

## Infrastructure
- Render: srv-d75qstchg0os73aupvs0 (backend), dpg-d75b1cpr0fns73blrtdg-a (DB)
- Vercel: chatbot-multiagente-ia (frontend)
- No Redis (free tier limitation)
- Auto-migrations on startup (app/db/migrator.py)

## Env Vars (Render)
- DATABASE_URL, GROQ_API_KEY, TWILIO_SID, TWILIO_TOKEN, RESEND_API_KEY

## Testing
- Local: pytest + manual curl tests
- 30/30 scenarios passing (routing, OTP, admin, edge cases)
- Groq rate limit: 100K tokens/day (fallback to keyword classifier)

## Deployment
- Push to GitHub -> Render auto-deploy (backend)
- Push to GitHub -> Vercel auto-deploy (frontend)
- Admin Panel: ?admin=true query param
