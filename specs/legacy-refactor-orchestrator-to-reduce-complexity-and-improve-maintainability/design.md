# Design — Orchestrator Refactor

## Current State
- orchestrator.py: 352 lines, 6 functions
- process_message(): 190 lines with 10 inline steps
- Handles: identification, OTP, routing, context loading, execution, ticket creation, logging
- All in ONE function — hard to test, debug, and extend

## Proposed Refactor
Split process_message into focused pipeline stages:

```
process_message()
  -> _identify_resident(phone)
  -> _handle_otp_code(message, resident, session)
  -> _classify_and_verify(message, context, resident, session)
  -> _execute_agent(message, context, agent_name, resident, session)
  -> _handle_ticket(response, intent, resident, session)
  -> _log_and_return(response, ...)
```

## What changes:
- Extract Steps 1-3 into _identify_and_authenticate()
- Extract Steps 4-5 into _classify_and_verify()
- Extract Steps 6-8 into _execute_agent()
- Extract Steps 8b into _handle_ticket()
- Extract Steps 9-10 into _log_and_return()
- process_message becomes a thin orchestrator calling these stages

## What DOES NOT change:
- Public API: process_message(message, phone, context, session_id) — same signature
- All 3 importers (residents.py, sms.py, whatsapp.py) work without changes
- Agent behavior unchanged
- Database schema unchanged

## Risks
- Regression if variable passing between stages breaks
- Must test all flows: general, billing+OTP, maintenance+ticket, escalation
