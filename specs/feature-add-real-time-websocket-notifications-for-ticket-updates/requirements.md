# Feature - Real-Time WebSocket Notifications for Ticket Updates

## Objective
Notify admins and residents in real-time when ticket status changes (created, updated, escalated, resolved).

## User Impact
- Admins see ticket updates instantly in Admin Panel without refreshing
- Residents get confirmation when their ticket progresses

## Requirements (EARS Format)

### Ubiquitous
- The system SHALL maintain a WebSocket server on /ws/notifications

### Event-Driven
- WHEN a ticket is created, the system SHALL broadcast a notification to all connected Admin Panel clients
- WHEN a ticket status changes, the system SHALL notify the assigned agent and the resident
- WHEN a ticket is escalated, the system SHALL send an urgent notification to admin clients

### State-Driven
- WHILE an admin client is connected via WebSocket, the system SHALL deliver all ticket events in real-time

### Unwanted Behavior
- IF the WebSocket connection drops, THEN the client SHALL reconnect automatically within 5 seconds
- IF the server restarts, THEN pending notifications SHALL be recovered from the database

### Optional
- WHERE the resident has WhatsApp connected, the system SHALL also send ticket updates via WhatsApp

## Non-Functional Requirements
- Performance: notification delivery < 500ms
- Reliability: auto-reconnect on disconnect
- Scalability: support 50+ concurrent admin connections

## Acceptance Criteria
- [ ] Admin Panel shows real-time ticket notifications without refresh
- [ ] New ticket created -> notification appears in < 1 second
- [ ] Ticket status change -> admin sees update live
- [ ] WebSocket auto-reconnects on disconnect
- [ ] Notifications stored in DB for history

## Out of Scope
- Push notifications (mobile)
- Email notifications for ticket updates
- Sound alerts
