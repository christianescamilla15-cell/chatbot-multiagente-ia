# Tasks — Orchestrator Refactor

## T1: Extract _identify_and_authenticate()
- Description: Steps 1-3 (resident lookup, session, OTP check)
- Owner Agent: Developer
- Dependencies: none
- Validation: existing OTP flow still works
- Risk: medium

## T2: Extract _classify_and_verify()
- Description: Steps 4-5 (intent classification, OTP gate)
- Owner Agent: Developer
- Dependencies: T1
- Validation: billing triggers OTP, general doesn't
- Risk: low

## T3: Extract _execute_agent()
- Description: Steps 6-8 (context loading, agent routing, response)
- Owner Agent: Developer
- Dependencies: T2
- Validation: all 5 intents route to correct agents
- Risk: medium

## T4: Simplify process_message to pipeline
- Description: Make process_message call the 3 extracted functions in sequence
- Owner Agent: Developer
- Dependencies: T1-T3
- Validation: all existing tests pass, no behavior change
- Risk: low

## T5: Test all flows
- Description: Test general, billing+OTP, maintenance+ticket, escalation, unknown phone
- Owner Agent: Test Agent
- Dependencies: T4
- Validation: 5/5 scenarios pass
- Risk: low
