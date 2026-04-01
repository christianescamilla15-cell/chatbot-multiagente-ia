# Legacy Modernization - Refactor orchestrator to reduce complexity and improve maintainability

## Objective

## User Impact

## Requirements (EARS Format)

### Ubiquitous (always true)
<!-- The system SHALL [action] -->

### Event-Driven (when something happens)
<!-- WHEN [event], the system SHALL [action] -->

### State-Driven (while in a state)
<!-- WHILE [state], the system SHALL [action] -->

### Unwanted Behavior (handling failures)
<!-- IF [condition], THEN the system SHALL [action] -->

### Optional (conditional features)
<!-- WHERE [feature is enabled], the system SHALL [action] -->

## Non-Functional Requirements
- Performance:
- Security:
- Reliability:
- Scalability:

## Acceptance Criteria
- [ ]
- [ ]
- [ ]

## Out of Scope

## Context
orchestrator.py is 13.6KB hotspot with 300+ lines, handles routing, tickets, OTP, logging all in one function
