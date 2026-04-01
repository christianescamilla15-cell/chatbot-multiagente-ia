# Design - AWS Migration

## Current State (Render)
```
Vercel (Frontend) -> Render (FastAPI) -> Render PostgreSQL
                                      -> Twilio (WhatsApp/SMS)
                                      -> Groq (LLM)
                                      -> Resend (Email)
```
Limitations: 30s cold start, sleeps after 15min, shared DB, no auto-scaling

## Target State (AWS)
```
Vercel (Frontend) -> ALB -> ECS Fargate (FastAPI)
                              -> RDS PostgreSQL (private subnet)
                              -> ElastiCache Redis (optional)
                              -> Twilio, Groq, Resend (same)
```

## Architecture

### Networking
- VPC with public + private subnets (2 AZs)
- ALB in public subnet (HTTPS)
- ECS tasks in private subnet
- RDS in private subnet (no public access)

### Compute
- ECS Fargate (no EC2 management)
- Task: 0.5 vCPU, 1GB RAM
- Auto-scaling: 1-4 tasks
- Health check: /api/health

### Database
- RDS PostgreSQL 16 (db.t3.micro for start)
- Multi-AZ: no (cost, start single-AZ)
- Automated backups: daily, 7-day retention
- Encryption at rest: yes

### Migration Strategy: Parallel Run
1. Deploy ECS + RDS
2. Migrate data from Render DB to RDS
3. Run both in parallel (same frontend, two backends)
4. Switch frontend to AWS
5. Monitor 48 hours
6. Shut down Render

## Tradeoffs
| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Compute | ECS Fargate | EC2 | No server management |
| DB | RDS | Aurora | Cost (Aurora ~3x more) |
| Multi-AZ | No | Yes | Cost ($50+/mo vs $15/mo) |
| Redis | Optional | Required | Works without Redis currently |
| Migration | Parallel run | Big bang | Zero downtime, safe rollback |
