# Migration - Render Free Tier to AWS ECS + RDS

## Objective
Migrate backend from Render free tier to AWS ECS Fargate + RDS PostgreSQL for production reliability.

## Requirements (EARS Format)

### Ubiquitous
- The system SHALL run on AWS ECS Fargate with auto-scaling
- The system SHALL use RDS PostgreSQL as the primary database
- The system SHALL maintain all existing API endpoints without changes

### Event-Driven
- WHEN the ECS task health check fails, the system SHALL restart the container automatically
- WHEN traffic exceeds capacity, the system SHALL scale to additional containers

### State-Driven
- WHILE the migration is in progress, the system SHALL remain accessible via Render (parallel run)
- WHILE both systems run in parallel, the system SHALL use the same database

### Unwanted Behavior
- IF the AWS deployment fails, THEN the system SHALL fall back to Render immediately
- IF the database migration fails, THEN the system SHALL keep Render DB as source of truth

### Optional
- WHERE budget allows, the system SHALL use ElastiCache (Redis) for session caching

## Non-Functional Requirements
- Zero downtime during migration
- Response time < 2 seconds (vs 30s cold start on Render)
- Auto-scaling: 1-4 containers based on load
- Automated backups: daily RDS snapshots

## Acceptance Criteria
- [ ] ECS task running with health check passing
- [ ] RDS PostgreSQL with all 14 tables migrated
- [ ] All API endpoints respond correctly
- [ ] WebSocket notifications work on ECS
- [ ] Frontend points to new AWS URL
- [ ] Render can be shut down without impact
- [ ] Rollback to Render verified

## Out of Scope
- Frontend migration (stays on Vercel)
- WhatsApp bot migration (stays local)
- CI/CD pipeline (GitHub Actions -> ECS, separate task)
