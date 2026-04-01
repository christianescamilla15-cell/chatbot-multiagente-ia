# Tasks - WebSocket Notifications

## T1: Create notifications DB table
- Description: Migration 004 with notifications table (id, type, ticket_id, resident_id, message, read, created_at)
- Owner Agent: Developer Agent
- Dependencies: none
- Validation: migration runs on startup, table exists
- Risk: low

## T2: Create WebSocket manager
- Description: FastAPI WebSocket endpoint /ws/notifications with connection manager (connect, disconnect, broadcast)
- Owner Agent: Developer Agent
- Dependencies: none
- Validation: client can connect and receive test message
- Risk: low

## T3: Create notification service
- Description: Service that formats and saves notifications, triggers WebSocket broadcast
- Owner Agent: Developer Agent
- Dependencies: T1, T2
- Validation: notify() saves to DB and broadcasts to connected clients
- Risk: medium

## T4: Wire orchestrator to emit events
- Description: Call notification service when ticket is created/updated/escalated in orchestrator._create_ticket()
- Owner Agent: Developer Agent
- Dependencies: T3
- Validation: create ticket -> notification appears in DB + WebSocket
- Risk: medium

## T5: Frontend useNotifications hook
- Description: React hook that connects to WebSocket, auto-reconnects, stores notifications
- Owner Agent: Developer Agent
- Dependencies: T2
- Validation: hook connects, receives events, stores in state
- Risk: low

## T6: NotificationBell component
- Description: Bell icon with unread count badge + dropdown in Admin Panel header
- Owner Agent: Developer Agent
- Dependencies: T5
- Validation: bell shows count, dropdown lists recent notifications
- Risk: low

## T7: Admin Panel live updates
- Description: Tickets section auto-updates when WebSocket notification received
- Owner Agent: Developer Agent
- Dependencies: T5, T6
- Validation: create ticket via chat -> Admin Panel shows it without refresh
- Risk: low

## T8: End-to-end test
- Description: Full flow: chat creates ticket -> WebSocket notifies -> Admin Panel updates
- Owner Agent: Test Agent
- Dependencies: T1-T7
- Validation: all acceptance criteria pass
- Risk: low
