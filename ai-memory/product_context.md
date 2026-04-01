# Product Context

## Product
MultiAgente — AI-powered Resident Support System for Residencial Las Palmas

## Users
- 500 residents (tenants) who interact via chat and WhatsApp
- Property administrators who monitor via Admin Panel
- Maintenance staff who receive tickets

## Critical Workflows
1. Resident sends message -> Router classifies intent -> Specialized agent responds
2. Sensitive requests (billing) -> SentinelAgent sends OTP via WhatsApp -> Verify -> AriaAgent responds with real data
3. Maintenance/tech reports -> Agent responds + ticket auto-created in PostgreSQL
4. Admin Panel -> view residents, tickets, payments, sessions, audit, agent runs

## Business Rules
- Resident identity hidden until OTP verified (privacy)
- Billing data ONLY after verification
- Tickets auto-created for maintenance and tech support
- All actions logged in audit trail
- Session expires after 30 minutes

## Non-Functional Priorities
- Response time < 2 seconds
- Zero data leaks between residents
- Graceful degradation when Groq rate-limited
- System must work without Redis (Render free tier)
