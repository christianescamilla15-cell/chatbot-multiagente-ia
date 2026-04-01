# Architecture Context

## Orchestrator Pipeline
```
Message + Phone
  -> SentinelAgent (identify resident by phone)
  -> RouterAgent (classify intent via Groq LLM)
  -> IF sensitive: SentinelAgent (OTP gate)
  -> Specialized Agent (Nova/Atlas/Aria/Orion/Nexus)
  -> IF maintenance/tech: auto-create ticket in DB
  -> Log message + agent run
  -> Return response
```

## 8 Agents
| Agent | Role | File |
|-------|------|------|
| RouterAgent | Intent classifier (Groq LLM) | agents/router_agent.py |
| SentinelAgent | OTP verification | agents/sentinel_agent.py |
| NovaAgent | Tech support | agents/nova_agent.py |
| AtlasAgent | Maintenance + tickets | agents/atlas_agent.py |
| AriaAgent | Billing (requires OTP) | agents/aria_agent.py |
| OrionAgent | General info / FAQ | agents/orion_agent.py |
| NexusAgent | Escalation | agents/nexus_agent.py |
| ClosureAgent | Case summary | agents/closure_agent.py |

## Database Tables (11+)
residents, resident_sessions, verification_codes, tickets, ticket_events,
messages, payments, knowledge_documents, agent_runs, resident_change_log, rate_limits, sync_conflicts

## Key Files
- backend-python/app/agents/orchestrator.py — main pipeline
- backend-python/app/agents/resident_base.py — base agent (Groq + Claude)
- backend-python/app/routes/residents.py — chat + admin lite endpoints
- backend-python/app/routes/admin.py — full admin panel API
- backend-python/app/db/client.py — asyncpg pool
- backend-python/app/db/migrator.py — auto-migrations
- backend-python/app/integrations/drive_sync.py — CSV import
- backend-python/app/integrations/email_service.py — Resend
- src/components/chat/ChatInput.jsx — mic + text input
- src/components/admin/AdminPanel.jsx — 8-section admin

## Current WhatsApp Integration (LIMITED)
- OTP sending via Twilio sandbox (outbound only)
- No inbound webhook — residents can't message the system via WhatsApp
- Twilio sandbox expires every 72h
- All interaction happens through web frontend only

## Fragile Areas
- Groq 100K tokens/day limit
- Render cold start 30s
- Twilio sandbox expiration
- No inbound WhatsApp pipeline (THIS IS THE GAP)
