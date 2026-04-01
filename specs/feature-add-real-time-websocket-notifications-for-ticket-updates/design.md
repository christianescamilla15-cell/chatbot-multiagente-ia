# Design - WebSocket Notifications

## Current State
- Tickets created in orchestrator._create_ticket() -> saved to PostgreSQL
- Admin Panel fetches data via REST (polling on page load)
- No real-time updates — admin must refresh to see changes
- No notification system exists

## Proposed Design
```
Ticket Event (create/update/escalate/resolve)
  -> orchestrator saves to DB
  -> broadcasts via WebSocket manager
  -> connected clients receive event
  -> Admin Panel updates UI in real-time
```

### Backend Components
1. **WebSocket Manager** (backend-python/app/websocket/manager.py)
   - Manages connected clients
   - Broadcasts events to all or filtered clients
   - FastAPI WebSocket endpoint: /ws/notifications

2. **Notification Service** (backend-python/app/services/notification.py)
   - Called by orchestrator when ticket changes
   - Formats notification payload
   - Saves to notifications table
   - Triggers WebSocket broadcast

3. **DB: notifications table**
   - id, type, ticket_id, resident_id, message, read, created_at

### Frontend Components
1. **useNotifications hook** (src/hooks/useNotifications.js)
   - Connects to WebSocket
   - Auto-reconnect on disconnect
   - Stores notifications in state

2. **NotificationBell** (src/components/common/NotificationBell.jsx)
   - Bell icon with unread count badge
   - Dropdown with recent notifications
   - Click to navigate to ticket

3. **Admin Panel integration**
   - Tickets section auto-updates when notification received
   - Toast notification for urgent tickets

## Architecture Impact
- New WebSocket endpoint on backend
- New DB migration (notifications table)
- Admin Panel gets real-time capability
- Orchestrator emits events on ticket changes

## Tradeoffs
| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Transport | WebSocket | SSE | Bidirectional, better for future features |
| Storage | PostgreSQL | In-memory | Persistence, history, multi-instance |
| Scope | Admin only | Admin + Resident | Start simple, extend later |

## Risks
- Render free tier: WebSocket connections may drop on cold start
- No Redis: can't do pub/sub across multiple instances (single instance OK)
